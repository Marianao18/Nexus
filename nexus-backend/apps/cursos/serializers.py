from rest_framework import serializers
from .models import Curso, Modulo, Inscripcion, RutaAprendizaje, InscripcionRuta


class ModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Modulo
        fields = ['id', 'nombre', 'orden']


class CursoInscripcionSerializer(serializers.ModelSerializer):
    docente_nombre      = serializers.SerializerMethodField()
    progreso            = serializers.SerializerMethodField()
    modulos_total       = serializers.SerializerMethodField()
    modulos_completados = serializers.SerializerMethodField()
    modulos             = ModuloSerializer(many=True, read_only=True)

    class Meta:
        model  = Curso
        fields = [
            'id', 'nombre', 'descripcion', 'tecnologia',
            'color', 'docente_nombre', 'progreso',
            'modulos_total', 'modulos_completados', 'modulos'
        ]

    def get_docente_nombre(self, obj):
        return obj.docente.nombre if obj.docente else 'NEXUS'

    def get_progreso(self, obj):
        """Progreso basado en lecciones vistas / total lecciones del curso."""
        from .models import LeccionVista
        estudiante = self.context.get('estudiante')
        if not estudiante:
            return 0
        total_lecciones = sum(m.lecciones.count() for m in obj.modulos.all())
        if total_lecciones == 0:
            return 0
        vistas = LeccionVista.objects.filter(
            estudiante=estudiante,
            leccion__modulo__curso=obj
        ).count()
        return round((vistas / total_lecciones) * 100)

    def get_modulos_total(self, obj):
        """Total de lecciones del curso (renombrado para compatibilidad con el frontend)."""
        return sum(m.lecciones.count() for m in obj.modulos.all())

    def get_modulos_completados(self, obj):
        """Lecciones vistas por el estudiante."""
        from .models import LeccionVista
        estudiante = self.context.get('estudiante')
        if not estudiante:
            return 0
        return LeccionVista.objects.filter(
            estudiante=estudiante,
            leccion__modulo__curso=obj
        ).count()


class RutaSerializer(serializers.ModelSerializer):
    progreso   = serializers.SerializerMethodField()
    num_cursos = serializers.SerializerMethodField()

    class Meta:
        model  = RutaAprendizaje
        fields = ['id', 'nombre', 'descripcion', 'duracion', 'color', 'progreso', 'num_cursos']

    def get_progreso(self, obj):
        """Progreso de la ruta basado en lecciones vistas."""
        from .models import LeccionVista
        estudiante = self.context.get('estudiante')
        if not estudiante:
            return 0
        cursos = obj.cursos.filter(activo=True)
        if not cursos.exists():
            return 0
        total_progreso = 0
        for curso in cursos:
            total_lecciones = sum(m.lecciones.count() for m in curso.modulos.all())
            if total_lecciones == 0:
                continue
            vistas = LeccionVista.objects.filter(
                estudiante=estudiante,
                leccion__modulo__curso=curso
            ).count()
            total_progreso += round((vistas / total_lecciones) * 100)
        return round(total_progreso / cursos.count())

    def get_num_cursos(self, obj):
        return obj.cursos.filter(activo=True).count()
