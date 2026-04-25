from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Curso, Inscripcion, InscripcionRuta, RutaAprendizaje, ModuloCompletado
from .serializers import CursoInscripcionSerializer, RutaSerializer
from apps.usuarios.models import Usuario


# ── VISTAS EXISTENTES ─────────────────────────────────────────────────────────

class ResumenEstudianteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        estudiante = request.user
        inscripciones = Inscripcion.objects.filter(estudiante=estudiante, activa=True)
        cursos_activos = inscripciones.count()

        if cursos_activos > 0:
            total_progreso = sum(i.progreso for i in inscripciones)
            progreso_global = round(total_progreso / cursos_activos)
        else:
            progreso_global = 0

        rutas_activas = InscripcionRuta.objects.filter(estudiante=estudiante, activa=True).count()
        modulos_hechos = ModuloCompletado.objects.filter(estudiante=estudiante).count()
        xp_total = modulos_hechos * 100

        if xp_total >= 2000:   nivel = 5
        elif xp_total >= 1500: nivel = 4
        elif xp_total >= 1000: nivel = 3
        elif xp_total >= 500:  nivel = 2
        else:                  nivel = 1

        from django.utils.timesince import timesince
        recientes = ModuloCompletado.objects.filter(
            estudiante=estudiante
        ).select_related('modulo__curso').order_by('-fecha')[:5]

        actividad = [{
            'texto': f'Completaste el módulo "{m.modulo.nombre}" en {m.modulo.curso.nombre}',
            'tiempo': f'Hace {timesince(m.fecha)}',
            'color': m.modulo.curso.color,
        } for m in recientes]

        return Response({
            'cursos_activos':  cursos_activos,
            'progreso_global': progreso_global,
            'rutas_activas':   rutas_activas,
            'xp_total':        xp_total,
            'nivel':           nivel,
            'actividad':       actividad,
        })


class CursosEstudianteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        estudiante = request.user
        inscripciones = Inscripcion.objects.filter(
            estudiante=estudiante, activa=True
        ).select_related('curso__docente', 'curso')
        cursos = [i.curso for i in inscripciones]
        serializer = CursoInscripcionSerializer(
            cursos, many=True, context={'estudiante': estudiante}
        )
        return Response(serializer.data)


class RutasEstudianteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        estudiante = request.user
        inscripciones = InscripcionRuta.objects.filter(
            estudiante=estudiante, activa=True
        ).select_related('ruta')
        rutas = [i.ruta for i in inscripciones]
        serializer = RutaSerializer(
            rutas, many=True, context={'estudiante': estudiante}
        )
        return Response(serializer.data)


class ProgresoEstudianteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        estudiante = request.user
        inscripciones = Inscripcion.objects.filter(
            estudiante=estudiante, activa=True
        ).select_related('curso')

        detalle_cursos = [{
            'curso':       insc.curso.nombre,
            'color':       insc.curso.color,
            'progreso':    insc.progreso,
            'completados': insc.modulos_completados,
            'total':       insc.curso.modulos.count(),
        } for insc in inscripciones]

        modulos_totales = ModuloCompletado.objects.filter(estudiante=estudiante).count()

        return Response({
            'modulos_completados_total': modulos_totales,
            'detalle_cursos': detalle_cursos,
        })


class CompletarModuloView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .models import Modulo
        modulo_id = request.data.get('modulo_id')
        if not modulo_id:
            return Response({'error': 'modulo_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            modulo = Modulo.objects.get(id=modulo_id)
        except Modulo.DoesNotExist:
            return Response({'error': 'Módulo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if not Inscripcion.objects.filter(estudiante=request.user, curso=modulo.curso).exists():
            return Response({'error': 'No estás inscrito en este curso'}, status=status.HTTP_403_FORBIDDEN)

        mc, creado = ModuloCompletado.objects.get_or_create(
            estudiante=request.user, modulo=modulo
        )
        return Response({
            'mensaje': 'Módulo completado' if creado else 'Ya estaba completado',
            'xp_ganado': 100 if creado else 0,
        })


# ── VISTAS NUEVAS ─────────────────────────────────────────────────────────────

class CatalogoView(APIView):
    """
    GET /api/cursos/catalogo/
    Devuelve todos los cursos activos con info de si el estudiante ya está inscrito.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cursos = Curso.objects.filter(activo=True).select_related('docente')
        data = []
        for curso in cursos:
            inscrito = Inscripcion.objects.filter(
                estudiante=request.user, curso=curso, activa=True
            ).exists()
            data.append({
                'id':          str(curso.id),
                'nombre':      curso.nombre,
                'descripcion': curso.descripcion,
                'tecnologia':  curso.tecnologia,
                'color':       curso.color,
                'docente':     curso.docente.nombre if curso.docente else 'NEXUS',
                'num_modulos': curso.modulos.count(),
                'inscrito':    inscrito,
            })
        return Response(data)


class InscribirseView(APIView):
    """
    POST /api/cursos/inscribirse/
    El estudiante se inscribe en un curso.
    Body: { "curso_id": "uuid" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.rol != 'estudiante':
            return Response(
                {'error': 'Solo los estudiantes pueden inscribirse.'},
                status=status.HTTP_403_FORBIDDEN
            )

        curso_id = request.data.get('curso_id')
        if not curso_id:
            return Response({'error': 'curso_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            curso = Curso.objects.get(id=curso_id, activo=True)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        inscripcion, creada = Inscripcion.objects.get_or_create(
            estudiante=request.user, curso=curso,
            defaults={'activa': True}
        )

        if not creada and not inscripcion.activa:
            inscripcion.activa = True
            inscripcion.save()

        return Response({
            'mensaje': f'Te inscribiste en "{curso.nombre}" exitosamente.' if creada else 'Ya estabas inscrito en este curso.',
            'inscrito': True,
        }, status=status.HTTP_201_CREATED if creada else status.HTTP_200_OK)


class AdminCursosView(APIView):
    """
    GET  /api/admin/cursos/         → lista todos los cursos
    POST /api/admin/cursos/         → crea un curso nuevo
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        cursos = Curso.objects.all().select_related('docente')
        data = [{
            'id':          str(c.id),
            'nombre':      c.nombre,
            'descripcion': c.descripcion,
            'tecnologia':  c.tecnologia,
            'color':       c.color,
            'activo':      c.activo,
            'docente_id':  str(c.docente.id) if c.docente else None,
            'docente':     c.docente.nombre if c.docente else '—',
            'num_modulos': c.modulos.count(),
            'inscritos':   c.inscripciones.count(),
        } for c in cursos]
        return Response(data)

    def post(self, request):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        nombre      = request.data.get('nombre', '').strip()
        descripcion = request.data.get('descripcion', '').strip()
        tecnologia  = request.data.get('tecnologia', 'otro')
        color       = request.data.get('color', '#00E5FF')
        docente_id  = request.data.get('docente_id')

        if not nombre:
            return Response({'error': 'El nombre es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        docente = None
        if docente_id:
            try:
                docente = Usuario.objects.get(id=docente_id, rol='docente')
            except Usuario.DoesNotExist:
                return Response({'error': 'Docente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        curso = Curso.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            tecnologia=tecnologia,
            color=color,
            docente=docente,
            activo=True,
        )

        return Response({
            'mensaje': f'Curso "{curso.nombre}" creado exitosamente.',
            'id': str(curso.id),
        }, status=status.HTTP_201_CREATED)


class AdminCursoDetalleView(APIView):
    """
    PATCH  /api/admin/cursos/<id>/  → activa o desactiva un curso
    DELETE /api/admin/cursos/<id>/  → elimina un curso
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            curso = Curso.objects.get(id=id)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        curso.activo = not curso.activo
        curso.save()
        return Response({'mensaje': f'Curso {"activado" if curso.activo else "desactivado"}.', 'activo': curso.activo})

    def delete(self, request, id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            curso = Curso.objects.get(id=id)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        nombre = curso.nombre
        curso.delete()
        return Response({'mensaje': f'Curso "{nombre}" eliminado.'})


class DocentesListView(APIView):
    """
    GET /api/admin/docentes/
    Lista todos los docentes aprobados (para el select al crear un curso).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        docentes = Usuario.objects.filter(rol='docente', is_active=True).values('id', 'nombre', 'email')
        return Response(list(docentes))


# ── VISTAS DOCENTE ────────────────────────────────────────────────────────────

class DocenteCursosView(APIView):
    """
    GET /api/docente/cursos/
    Cursos asignados al docente con conteo de inscritos y progreso promedio.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.rol != 'docente':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        cursos = Curso.objects.filter(docente=request.user, activo=True)
        data = []
        for c in cursos:
            inscritos = c.inscripciones.filter(activa=True)
            total_inscritos = inscritos.count()
            progreso_promedio = 0
            if total_inscritos > 0:
                progreso_promedio = round(
                    sum(i.progreso for i in inscritos) / total_inscritos
                )
            data.append({
                'id':                str(c.id),
                'nombre':            c.nombre,
                'descripcion':       c.descripcion,
                'tecnologia':        c.tecnologia,
                'color':             c.color,
                'num_modulos':       c.modulos.count(),
                'inscritos':         total_inscritos,
                'progreso_promedio': progreso_promedio,
            })
        return Response(data)


class DocenteEstudiantesView(APIView):
    """
    GET /api/docente/cursos/<id>/estudiantes/
    Estudiantes inscritos en un curso específico del docente.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.rol != 'docente':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            curso = Curso.objects.get(id=id, docente=request.user)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        inscripciones = Inscripcion.objects.filter(
            curso=curso, activa=True
        ).select_related('estudiante')

        data = [{
            'id':       str(i.estudiante.id),
            'nombre':   i.estudiante.nombre,
            'email':    i.estudiante.email,
            'progreso': i.progreso,
            'modulos_completados': i.modulos_completados,
            'modulos_total':       curso.modulos.count(),
        } for i in inscripciones]

        return Response({
            'curso':       curso.nombre,
            'color':       curso.color,
            'estudiantes': data,
        })


class DocenteResumenView(APIView):
    """
    GET /api/docente/resumen/
    Métricas generales del docente para el dashboard de inicio.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.rol != 'docente':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        cursos = Curso.objects.filter(docente=request.user, activo=True)
        cursos_count = cursos.count()

        total_estudiantes = sum(
            c.inscripciones.filter(activa=True).count() for c in cursos
        )

        total_modulos = sum(c.modulos.count() for c in cursos)
        total_completados = ModuloCompletado.objects.filter(
            modulo__curso__docente=request.user
        ).count()

        tasa = round((total_completados / (total_modulos * max(total_estudiantes, 1))) * 100) if total_modulos > 0 else 0

        return Response({
            'cursos_activos':    cursos_count,
            'total_estudiantes': total_estudiantes,
            'tasa_completacion': min(tasa, 100),
        })


class RecursosView(APIView):
    """
    GET  /api/docente/cursos/<id>/recursos/  → lista recursos del curso
    POST /api/docente/cursos/<id>/recursos/  → sube un archivo
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.rol != 'docente':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            curso = Curso.objects.get(id=id, docente=request.user)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        from .models import Recurso
        recursos = Recurso.objects.filter(curso=curso)
        data = [{
            'id':          str(r.id),
            'nombre':      r.nombre,
            'tipo':        r.tipo,
            'url':         request.build_absolute_uri(r.archivo.url),
            'fecha':       r.fecha_subida.strftime('%d/%m/%Y'),
        } for r in recursos]
        return Response(data)

    def post(self, request, id):
        if request.user.rol != 'docente':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            curso = Curso.objects.get(id=id, docente=request.user)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se envió ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar extensión
        ext = archivo.name.split('.')[-1].lower()
        tipos_permitidos = {'pdf': 'pdf', 'docx': 'docx', 'xlsx': 'xlsx', 'csv': 'csv'}
        if ext not in tipos_permitidos:
            return Response(
                {'error': 'Solo se permiten archivos PDF, DOCX, XLSX y CSV.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from .models import Recurso
        recurso = Recurso.objects.create(
            curso=curso,
            docente=request.user,
            nombre=request.data.get('nombre', archivo.name),
            archivo=archivo,
            tipo=tipos_permitidos[ext],
        )

        return Response({
            'mensaje': f'Archivo "{recurso.nombre}" subido correctamente.',
            'id':      str(recurso.id),
            'url':     request.build_absolute_uri(recurso.archivo.url),
        }, status=status.HTTP_201_CREATED)


class RecursoDeleteView(APIView):
    """
    DELETE /api/docente/recursos/<id>/
    Elimina un recurso subido por el docente.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        from .models import Recurso
        try:
            recurso = Recurso.objects.get(id=id, docente=request.user)
        except Recurso.DoesNotExist:
            return Response({'error': 'Recurso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        recurso.archivo.delete(save=False)
        recurso.delete()
        return Response({'mensaje': 'Recurso eliminado correctamente.'})
