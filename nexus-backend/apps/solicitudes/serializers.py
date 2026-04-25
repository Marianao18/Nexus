from rest_framework import serializers
from .models import SolicitudDocente

class SolicitudDocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SolicitudDocente
        fields = [
            'id', 'nombre_completo', 'email',
            'especialidad', 'link_certificacion',
            'mensaje_motivacion', 'estado', 'fecha_solicitud'
        ]
        read_only_fields = ['id', 'estado', 'fecha_solicitud']