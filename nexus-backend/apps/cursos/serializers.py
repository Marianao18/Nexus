from rest_framework import serializers
from .models import Curso, Modulo, Inscripcion, RutaAprendizaje, InscripcionRuta, ModuloCompletado


class ModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Modulo
        fields = ['id', 'nombre', 'orden']


class CursoInscripcionSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.SerializerMethodField()
    progreso       = serializers.SerializerMethodField()
    modulos_total  = serializers.SerializerMethodField()
    modulos_completados = serializers.SerializerMethodField()
    modulos        = ModuloSerializer(many=True, read_only=True)

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
        estudiante = self.context.get('estudiante')
        if not estudiante:
            return 0
        try:
            insc = Inscripcion.objects.get(estudiante=estudiante, curso=obj)
            return insc.progreso
        except Inscripcion.DoesNotExist:
            return 0

    def get_modulos_total(self, obj):
        return obj.modulos.count()

    def get_modulos_completados(self, obj):
        estudiante = self.context.get('estudiante')
        if not estudiante:
            return 0
        return ModuloCompletado.objects.filter(
            estudiante=estudiante,
            modulo__curso=obj
        ).count()


class RutaSerializer(serializers.ModelSerializer):
    progreso   = serializers.SerializerMethodField()
    num_cursos = serializers.SerializerMethodField()

    class Meta:
        model  = RutaAprendizaje
        fields = ['id', 'nombre', 'descripcion', 'duracion', 'color', 'progreso', 'num_cursos']

    def get_progreso(self, obj):
        estudiante = self.context.get('estudiante')
        if not estudiante:
            return 0
        cursos = obj.cursos.filter(activo=True)
        if not cursos.exists():
            return 0
        total = sum(
            Inscripcion.objects.filter(estudiante=estudiante, curso=c).first().progreso
            if Inscripcion.objects.filter(estudiante=estudiante, curso=c).exists() else 0
            for c in cursos
        )
        return round(total / cursos.count())

    def get_num_cursos(self, obj):
        return obj.cursos.filter(activo=True).count()
