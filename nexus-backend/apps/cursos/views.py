from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Curso, Inscripcion, InscripcionRuta, RutaAprendizaje, ModuloCompletado, Modulo, Recurso
from .serializers import CursoInscripcionSerializer, RutaSerializer
from apps.usuarios.models import Usuario


# VISTAS EXISTENTES

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
            'texto': f'Completaste la lecciÃ³n "{lv.leccion.titulo}" en {lv.leccion.modulo.curso.nombre}',
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
            estudiante=estudiante, activa=True,
            curso__activo=True          # ocultar cursos desactivados por admin
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
            return Response({'error': 'MÃ³dulo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if not Inscripcion.objects.filter(estudiante=request.user, curso=modulo.curso).exists():
            return Response({'error': 'No estÃ¡s inscrito en este curso'}, status=status.HTTP_403_FORBIDDEN)

        mc, creado = ModuloCompletado.objects.get_or_create(
            estudiante=request.user, modulo=modulo
        )
        return Response({
            'mensaje': 'MÃ³dulo completado' if creado else 'Ya estaba completado',
            'xp_ganado': 100 if creado else 0,
        })


#  VISTAS NUEVAS

class CatalogoView(APIView):
    """
    GET /api/cursos/catalogo/
    Devuelve todos los cursos activos con info de si el estudiante ya estÃ¡ inscrito.
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
    GET  /api/admin/cursos/         â lista todos los cursos
    POST /api/admin/cursos/         â crea un curso nuevo
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
            'docente':     c.docente.nombre if c.docente else 'â',
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
    PATCH  /api/admin/cursos/<id>/  â activa o desactiva un curso
    DELETE /api/admin/cursos/<id>/  â elimina un curso
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


#  VISTAS DOCENTE 

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
    Estudiantes inscritos en un curso especÃ­fico del docente.
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
    MÃ©tricas generales del docente para el dashboard de inicio.
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
    GET  /api/docente/cursos/<id>/recursos/  â lista recursos del curso
    POST /api/docente/cursos/<id>/recursos/  â sube un archivo
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
            return Response({'error': 'No se enviÃ³ ningÃºn archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar extensiÃ³n
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


#  VISTAS CONTENIDO 

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
    GET  /api/admin/cursos/<id>/contenido/  â mÃ³dulos y lecciones del curso
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
    POST   /api/admin/cursos/<id>/modulos/        â crear mÃ³dulo
    DELETE /api/admin/modulos/<modulo_id>/        â eliminar mÃ³dulo
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
            return Response({'error': 'MÃ³dulo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        modulo.delete()
        return Response({'mensaje': 'MÃ³dulo eliminado.'})


class AdminLeccionView(APIView):
    """
    POST /api/admin/modulos/<modulo_id>/lecciones/  â crear lecciÃ³n con video
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, modulo_id):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            modulo = Modulo.objects.get(id=modulo_id)
        except Modulo.DoesNotExist:
            return Response({'error': 'MÃ³dulo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        from .models import Leccion
        titulo    = request.data.get('titulo', '').strip()
        video_url = request.data.get('video_url', '').strip()
        descripcion = request.data.get('descripcion', '').strip()

        if not titulo:
            return Response({'error': 'El tÃ­tulo es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({'error': 'LecciÃ³n no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        leccion.delete()
        return Response({'mensaje': 'LecciÃ³n eliminada.'})


class EstudianteCursoContenidoView(APIView):
    """
    GET /api/estudiante/cursos/<id>/contenido/
    Contenido del curso para el estudiante â mÃ³dulos, lecciones y cuÃ¡les ha visto.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            curso = Curso.objects.get(id=id)
            Inscripcion.objects.get(estudiante=request.user, curso=curso, activa=True)
        except Curso.DoesNotExist:
            return Response({'error': 'Curso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except Inscripcion.DoesNotExist:
            return Response({'error': 'No estÃ¡s inscrito en este curso.'}, status=status.HTTP_403_FORBIDDEN)

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

        # Recursos del curso (archivos de apoyo subidos por el docente)
        # El estudiante inscrito puede verlos y descargarlos.
        from .models import Recurso
        recursos_qs = Recurso.objects.filter(curso=curso)
        recursos_data = [{
            'id':     str(r.id),
            'nombre': r.nombre,
            'tipo':   r.tipo,
            'url':    request.build_absolute_uri(r.archivo.url),
            'fecha':  r.fecha_subida.strftime('%d/%m/%Y'),
        } for r in recursos_qs]

        return Response({
            'curso_nombre': curso.nombre,
            'curso_color':  curso.color,
            'progreso':     progreso,
            'modulos':      modulos_data,
            'recursos':     recursos_data,
        })


class MarcarLeccionVistaView(APIView):
    """
    POST /api/estudiante/lecciones/<id>/vista/
    Marca una lecciÃ³n como vista por el estudiante.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, leccion_id):
        from .models import Leccion, LeccionVista
        try:
            leccion = Leccion.objects.get(id=leccion_id)
        except Leccion.DoesNotExist:
            return Response({'error': 'LecciÃ³n no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        lv, creada = LeccionVista.objects.get_or_create(
            estudiante=request.user, leccion=leccion
        )
        return Response({
            'mensaje': 'LecciÃ³n marcada como vista.' if creada else 'Ya estaba marcada.',
            'xp_ganado': 50 if creada else 0,
        })


#  SEGURIDAD DE VIDEO 

class TokenVideoView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, leccion_id):
        from .models import Leccion

        # 1. Verificar que la lecciÃ³n existe
        try:
            leccion = Leccion.objects.select_related(
                'modulo__curso'
            ).get(id=leccion_id)
        except Leccion.DoesNotExist:
            return Response(
                {'error': 'Contenido no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        curso = leccion.modulo.curso

        # 2. Verificar que el estudiante estÃ¡ inscrito y activo
        if request.user.rol != 'estudiante':
            return Response(
                {'error': 'Solo los estudiantes pueden acceder al contenido.'},
                status=status.HTTP_403_FORBIDDEN
            )

        inscrito = Inscripcion.objects.filter(
            estudiante=request.user,
            curso=curso,
            activa=True
        ).exists()

        if not inscrito:
            return Response(
                {'error': 'No estÃ¡s inscrito en este curso.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Verificar que el curso estÃ¡ activo
        if not curso.activo:
            return Response(
                {'error': 'Este curso no estÃ¡ disponible.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 4. Entregar el embed URL de forma segura
        embed_url = youtube_embed(leccion.video_url)
        if not embed_url:
            return Response(
                {'error': 'Esta lecciÃ³n no tiene video disponible.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Agregar parÃ¡metros de seguridad al embed de YouTube
        embed_url_seguro = (
                f"{embed_url}"
                f"?rel=0"
                f"&modestbranding=1"
                f"&iv_load_policy=3"
                f"&showinfo=0"
                f"&disablekb=0"
                f"&controls=1"
                f"&playsinline=1"
                f"&origin=http://localhost:3000"
        )

        return Response({
            'leccion_id':  str(leccion.id),
            'titulo':      leccion.titulo,
            'embed_url':   embed_url_seguro,
            'curso':       curso.nombre,
            'autorizado':  True,
        })


#  NEXIA  Asistente IA 

class NexIAChatView(APIView):
    """
    POST /api/nexia/chat/
    Recibe el mensaje del estudiante, construye contexto real desde la DB
    y consulta Claude (Anthropic) para generar una respuesta personalizada.

    Body: {
        "mensaje": "Â¿CuÃ¡nto llevo en Python?",
        "historial": [                       # opcional, Ãºltimos N turnos
            {"rol": "user",      "texto": "Hola"},
            {"rol": "assistant", "texto": "Â¡Hola! Soy NexIA..."}
        ]
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.conf import settings
        import anthropic
        from .models import LeccionVista, Recurso

        #  1. Validar entrada  1. Validar entrada
        mensaje = request.data.get('mensaje', '').strip()
        historial = request.data.get('historial', [])

        if not mensaje:
            return Response(
                {'error': 'El campo "mensaje" es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(mensaje) > 1000:
            return Response(
                {'error': 'El mensaje es demasiado largo (mÃ¡ximo 1000 caracteres).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        estudiante = request.user

        # Solo estudiantes usan NexIA (docentes y admin no tienen cursos inscritos)
        if estudiante.rol not in ('estudiante', 'docente', 'admin'):
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        #  2. Construir contexto real desde la DB  2. Construir contexto real desde la DB
        contexto_usuario = _construir_contexto(estudiante)

        #  3. Armar el system prompt personalizado  3. Armar el system prompt personalizado
        system_prompt = _system_prompt(estudiante, contexto_usuario)

        #  4. Convertir historial del frontend al formato Anthropic  4. Convertir historial del frontend al formato Anthropic
        messages = []
        for turno in historial[-10:]:   # mÃ¡ximo Ãºltimos 10 turnos
            rol_api = 'user' if turno.get('rol') == 'user' else 'assistant'
            texto   = str(turno.get('texto', '')).strip()
            if texto:
                messages.append({'role': rol_api, 'content': texto})

        # Agregar el mensaje actual
        messages.append({'role': 'user', 'content': mensaje})

        # Anthropic exige alternancia estricta user/assistant
        messages = _limpiar_historial(messages)

        #  5. Llamar a Claude  5. Llamar a Claude
        api_key = settings.ANTHROPIC_API_KEY
        if not api_key or api_key.startswith('sk-ant-aqui'):
            return Response(
                {'error': 'NexIA no estÃ¡ configurada aÃºn. Contacta al administrador.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            client = anthropic.Anthropic(api_key=api_key)
            respuesta = client.messages.create(
                model='claude-haiku-4-5-20251001',   # rÃ¡pido y econÃ³mico para chat
                max_tokens=600,
                system=system_prompt,
                messages=messages,
            )
            texto_respuesta = respuesta.content[0].text

        except anthropic.APIConnectionError:
            return Response(
                {'error': 'No se pudo conectar con NexIA. Intenta de nuevo.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except anthropic.RateLimitError:
            return Response(
                {'error': 'NexIA estÃ¡ recibiendo muchas consultas. Intenta en unos segundos.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except anthropic.APIError as e:
            return Response(
                {'error': f'Error en NexIA: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({'respuesta': texto_respuesta})


#  Helpers privados  1. Validar entrada

def _construir_contexto(estudiante):
    """Consulta la DB y devuelve un dict con toda la info del estudiante."""
    from .models import (
        Inscripcion, LeccionVista, InscripcionRuta, RutaAprendizaje, Curso
    )

    # Cursos inscritos con progreso real
    inscripciones = Inscripcion.objects.filter(
        estudiante=estudiante, activa=True
    ).select_related('curso__docente')

    cursos_info = []
    for insc in inscripciones:
        curso = insc.curso
        total_lecciones = sum(m.lecciones.count() for m in curso.modulos.all())
        vistas = LeccionVista.objects.filter(
            estudiante=estudiante,
            leccion__modulo__curso=curso
        ).count()
        progreso = round((vistas / total_lecciones) * 100) if total_lecciones > 0 else 0

        # PrÃ³xima lecciÃ³n no vista
        proxima = None
        for modulo in curso.modulos.all():
            for leccion in modulo.lecciones.all():
                if not LeccionVista.objects.filter(
                    estudiante=estudiante, leccion=leccion
                ).exists():
                    proxima = f'"{leccion.titulo}" (mÃ³dulo: {modulo.nombre})'
                    break
            if proxima:
                break

        cursos_info.append({
            'nombre':      curso.nombre,
            'tecnologia':  curso.tecnologia,
            'docente':     curso.docente.nombre if curso.docente else 'NEXUS',
            'progreso':    progreso,
            'vistas':      vistas,
            'total':       total_lecciones,
            'proxima':     proxima or 'curso completado â',
        })

    # Rutas inscritas
    rutas = list(
        InscripcionRuta.objects.filter(
            estudiante=estudiante, activa=True
        ).select_related('ruta').values_list('ruta__nombre', flat=True)
    )

    # XP y nivel
    total_vistas = LeccionVista.objects.filter(estudiante=estudiante).count()
    xp = total_vistas * 50
    if xp >= 2000:   nivel = 5
    elif xp >= 1500: nivel = 4
    elif xp >= 1000: nivel = 3
    elif xp >= 500:  nivel = 2
    else:            nivel = 1

    # CatÃ¡logo de cursos disponibles (para recomendar inscripciÃ³n)
    catalogo = list(
        Curso.objects.filter(activo=True).values_list('nombre', 'tecnologia')
    )
    catalogo_str = ', '.join(f'{n} ({t})' for n, t in catalogo[:10])

    return {
        'nombre':   estudiante.nombre,
        'cursos':   cursos_info,
        'rutas':    rutas,
        'xp':       xp,
        'nivel':    nivel,
        'catalogo': catalogo_str,
    }


def _system_prompt(estudiante, ctx):
    """Construye el system prompt con contexto real del estudiante."""

    cursos_texto = ''
    for c in ctx['cursos']:
        cursos_texto += (
            f"  â¢ {c['nombre']} ({c['tecnologia']}) â "
            f"{c['progreso']}% completado ({c['vistas']}/{c['total']} lecciones). "
            f"Docente: {c['docente']}. "
            f"PrÃ³xima lecciÃ³n pendiente: {c['proxima']}\n"
        )
    if not cursos_texto:
        cursos_texto = '  (El estudiante no tiene cursos inscritos aÃºn)\n'

    rutas_texto = ', '.join(ctx['rutas']) if ctx['rutas'] else 'ninguna ruta inscrita aÃºn'

    return f"""Eres NexIA, el asistente de aprendizaje de la plataforma educativa NEXUS.
NEXUS es una plataforma de formaciÃ³n tecnolÃ³gica para estudiantes de MedellÃ­n, Colombia,
enfocada en impulsar conocimientos de tecnologÃ­a de la informaciÃ³n (TI).

EstÃ¡s hablando con: {ctx['nombre']}
Rol: estudiante de la plataforma NEXUS.

=== INFORMACIÃN REAL DEL ESTUDIANTE ===

Cursos inscritos y progreso:
{cursos_texto}
Rutas de aprendizaje inscritas: {rutas_texto}

XP acumulado: {ctx['xp']} puntos | Nivel actual: {ctx['nivel']}/5

CatÃ¡logo de cursos disponibles en NEXUS:
  {ctx['catalogo']}

=== TU PERSONALIDAD Y COMPORTAMIENTO ===

1. Eres cercano, motivador y claro. Hablas en espaÃ±ol colombiano informal pero respetuoso.
   Usas "tÃº" para dirigirte al estudiante, no "usted".
2. Siempre que sea relevante, usa los datos reales del estudiante para personalizar
   tu respuesta (su progreso real, su prÃ³xima lecciÃ³n pendiente, su nivel de XP).
3. Si el estudiante tiene dudas tÃ©cnicas sobre temas de sus cursos (Python, Django,
   SQL, Power BI, Excel, Java, etc.), explica de forma clara y con ejemplos breves.
4. Si el estudiante parece desmotivado o atascado, ofrece apoyo y estrategias concretas.
5. NO inventes informaciÃ³n sobre cursos, docentes o contenidos que no estÃ©n en los datos.
6. NO eres un chatbot de propÃ³sito general. Si te preguntan algo completamente ajeno
   a la plataforma o al aprendizaje de TI, redirige amablemente la conversaciÃ³n.
7. MantÃ©n respuestas concisas (mÃ¡ximo 4 pÃ¡rrafos). Usa listas cuando sea Ãºtil.
8. Si no sabes algo especÃ­fico del contenido de un mÃ³dulo, sÃ© honesto y sugiere
   que el estudiante consulte con su docente o revise los recursos del curso.

Recuerda: tu objetivo es que {ctx['nombre']} progrese, aprenda y se sienta acompaÃ±ado
en su camino de formaciÃ³n tecnolÃ³gica en NEXUS MedellÃ­n.
"""


def _limpiar_historial(messages):
    """
    Anthropic exige que los mensajes alternen estrictamente user/assistant
    y que el primero y Ãºltimo sean 'user'. Esta funciÃ³n limpia el historial.
    """
    if not messages:
        return messages

    # Eliminar duplicados consecutivos del mismo rol
    limpio = [messages[0]]
    for msg in messages[1:]:
        if msg['role'] != limpio[-1]['role']:
            limpio.append(msg)

    # Asegurar que empiece con 'user'
    if limpio[0]['role'] != 'user':
        limpio = limpio[1:]

    # Asegurar que termine con 'user'
    if limpio and limpio[-1]['role'] != 'user':
        limpio = limpio[:-1]

    return limpio if limpio else [{'role': 'user', 'content': 'Hola'}]
