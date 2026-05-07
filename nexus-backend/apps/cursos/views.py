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
        from .models import LeccionVista
        from django.utils.timesince import timesince

        estudiante = request.user
        inscripciones = Inscripcion.objects.filter(estudiante=estudiante, activa=True)
        cursos_activos = inscripciones.count()

        if cursos_activos > 0:
            progreso_total = 0
            for insc in inscripciones:
                total_lecciones = sum(m.lecciones.count() for m in insc.curso.modulos.all())
                vistas = LeccionVista.objects.filter(
                    estudiante=estudiante,
                    leccion__modulo__curso=insc.curso
                ).count()
                progreso_total += round((vistas / total_lecciones) * 100) if total_lecciones > 0 else 0
            progreso_global = round(progreso_total / cursos_activos)
        else:
            progreso_global = 0

        rutas_activas = InscripcionRuta.objects.filter(estudiante=estudiante, activa=True).count()
        lecciones_vistas = LeccionVista.objects.filter(estudiante=estudiante).count()
        xp_total = lecciones_vistas * 50

        if xp_total >= 2000:   nivel = 5
        elif xp_total >= 1500: nivel = 4
        elif xp_total >= 1000: nivel = 3
        elif xp_total >= 500:  nivel = 2
        else:                  nivel = 1

        recientes = LeccionVista.objects.filter(
            estudiante=estudiante
        ).select_related('leccion__modulo__curso').order_by('-fecha')[:5]

        actividad = [{
            'texto': f'Completaste la lección "{lv.leccion.titulo}" en {lv.leccion.modulo.curso.nombre}',
            'tiempo': f'Hace {timesince(lv.fecha)}',
            'color': lv.leccion.modulo.curso.color,
        } for lv in recientes]

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

        from .models import LeccionVista
        detalle_cursos = []
        for insc in inscripciones:
            total_lecciones = sum(m.lecciones.count() for m in insc.curso.modulos.all())
            vistas = LeccionVista.objects.filter(
                estudiante=estudiante,
                leccion__modulo__curso=insc.curso
            ).count()
            progreso = round((vistas / total_lecciones) * 100) if total_lecciones > 0 else 0
            detalle_cursos.append({
                'curso':       insc.curso.nombre,
                'color':       insc.curso.color,
                'progreso':    progreso,
                'completados': vistas,
                'total':       total_lecciones,
            })

        from .models import LeccionVista
        lecciones_totales = LeccionVista.objects.filter(estudiante=estudiante).count()

        return Response({
            'modulos_completados_total': lecciones_totales,
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

        from .models import LeccionVista
        total_lecciones = sum(m.lecciones.count() for m in curso.modulos.all())

        data = []
        for i in inscripciones:
            lecciones_vistas = LeccionVista.objects.filter(
                estudiante=i.estudiante,
                leccion__modulo__curso=curso
            ).count()
            progreso = round((lecciones_vistas / total_lecciones) * 100) if total_lecciones > 0 else 0
            data.append({
                'id':                 str(i.estudiante.id),
                'nombre':             i.estudiante.nombre,
                'email':              i.estudiante.email,
                'progreso':           progreso,
                'lecciones_vistas':   lecciones_vistas,
                'lecciones_total':    total_lecciones,
            })

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

        from .models import LeccionVista
        total_lecciones_vistas = LeccionVista.objects.filter(
            leccion__modulo__curso__docente=request.user
        ).count()
        total_lecciones = sum(
            sum(m.lecciones.count() for m in c.modulos.all()) for c in cursos
        )
        tasa = round((total_lecciones_vistas / (total_lecciones * max(total_estudiantes, 1))) * 100) if total_lecciones > 0 else 0

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


# ── VISTAS CONTENIDO ──────────────────────────────────────────────────────────

def youtube_embed(url):
    """Convierte cualquier URL de YouTube a formato embed."""
    import re
    if not url:
        return ''
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return f"https://www.youtube.com/embed/{m.group(1)}"
    return url


class AdminContenidoCursoView(APIView):
    """
    GET  /api/admin/cursos/<id>/contenido/  → módulos y lecciones del curso
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            curso = Curso.objects.get(id=id)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        from .models import Leccion
        modulos = curso.modulos.all()
        data = {
            'curso_nombre': curso.nombre,
            'curso_color':  curso.color,
            'modulos': [{
                'id':    str(m.id),
                'nombre': m.nombre,
                'orden':  m.orden,
                'lecciones': [{
                    'id':          str(l.id),
                    'titulo':      l.titulo,
                    'descripcion': l.descripcion,
                    'video_url':   youtube_embed(l.video_url),
                    'orden':       l.orden,
                } for l in m.lecciones.all()]
            } for m in modulos]
        }
        return Response(data)


class AdminModuloView(APIView):
    """
    POST   /api/admin/cursos/<id>/modulos/        → crear módulo
    DELETE /api/admin/modulos/<modulo_id>/        → eliminar módulo
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            curso = Curso.objects.get(id=id)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        nombre = request.data.get('nombre', '').strip()
        if not nombre:
            return Response({'error': 'El nombre es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        orden = curso.modulos.count() + 1
        modulo = Modulo.objects.create(curso=curso, nombre=nombre, orden=orden)
        return Response({'id': str(modulo.id), 'nombre': modulo.nombre, 'orden': modulo.orden, 'lecciones': []}, status=status.HTTP_201_CREATED)


class AdminModuloDetalleView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, modulo_id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            modulo = Modulo.objects.get(id=modulo_id)
        except Modulo.DoesNotExist:
            return Response({'error': 'Módulo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        modulo.delete()
        return Response({'mensaje': 'Módulo eliminado.'})


class AdminLeccionView(APIView):
    """
    POST /api/admin/modulos/<modulo_id>/lecciones/  → crear lección con video
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, modulo_id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            modulo = Modulo.objects.get(id=modulo_id)
        except Modulo.DoesNotExist:
            return Response({'error': 'Módulo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        from .models import Leccion
        titulo    = request.data.get('titulo', '').strip()
        video_url = request.data.get('video_url', '').strip()
        descripcion = request.data.get('descripcion', '').strip()

        if not titulo:
            return Response({'error': 'El título es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        orden = modulo.lecciones.count() + 1
        leccion = Leccion.objects.create(
            modulo=modulo, titulo=titulo,
            video_url=video_url, descripcion=descripcion, orden=orden
        )
        return Response({
            'id':          str(leccion.id),
            'titulo':      leccion.titulo,
            'descripcion': leccion.descripcion,
            'video_url':   youtube_embed(leccion.video_url),
            'orden':       leccion.orden,
        }, status=status.HTTP_201_CREATED)


class AdminLeccionDetalleView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, leccion_id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        from .models import Leccion
        try:
            leccion = Leccion.objects.get(id=leccion_id)
        except Leccion.DoesNotExist:
            return Response({'error': 'Lección no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        leccion.delete()
        return Response({'mensaje': 'Lección eliminada.'})


class EstudianteCursoContenidoView(APIView):
    """
    GET /api/estudiante/cursos/<id>/contenido/
    Contenido del curso para el estudiante — módulos, lecciones y cuáles ha visto.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            curso = Curso.objects.get(id=id)
            Inscripcion.objects.get(estudiante=request.user, curso=curso, activa=True)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except Inscripcion.DoesNotExist:
            return Response({'error': 'No estás inscrito en este curso.'}, status=status.HTTP_403_FORBIDDEN)

        from .models import Leccion, LeccionVista
        lecciones_vistas = set(
            LeccionVista.objects.filter(estudiante=request.user).values_list('leccion_id', flat=True)
        )

        modulos = curso.modulos.all()
        total_lecciones = 0
        total_vistas    = 0

        modulos_data = []
        for m in modulos:
            lecciones = m.lecciones.all()
            lecs_data = []
            for l in lecciones:
                vista = l.id in lecciones_vistas
                total_lecciones += 1
                if vista: total_vistas += 1
                lecs_data.append({
                    'id':          str(l.id),
                    'titulo':      l.titulo,
                    'descripcion': l.descripcion,
                    'video_url':   youtube_embed(l.video_url),
                    'orden':       l.orden,
                    'vista':       vista,
                })
            modulos_data.append({
                'id':       str(m.id),
                'nombre':   m.nombre,
                'orden':    m.orden,
                'lecciones': lecs_data,
            })

        progreso = round((total_vistas / total_lecciones) * 100) if total_lecciones > 0 else 0

        return Response({
            'curso_nombre': curso.nombre,
            'curso_color':  curso.color,
            'progreso':     progreso,
            'modulos':      modulos_data,
        })


class MarcarLeccionVistaView(APIView):
    """
    POST /api/estudiante/lecciones/<id>/vista/
    Marca una lección como vista por el estudiante.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, leccion_id):
        from .models import Leccion, LeccionVista
        try:
            leccion = Leccion.objects.get(id=leccion_id)
        except Leccion.DoesNotExist:
            return Response({'error': 'Lección no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        lv, creada = LeccionVista.objects.get_or_create(
            estudiante=request.user, leccion=leccion
        )
        return Response({
            'mensaje': 'Lección marcada como vista.' if creada else 'Ya estaba marcada.',
            'xp_ganado': 50 if creada else 0,
        })
