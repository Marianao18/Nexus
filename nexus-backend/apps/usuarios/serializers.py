from rest_framework import serializers
from .models import Usuario
import re

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=10)

    class Meta:
        model  = Usuario
        fields = ['nombre', 'email', 'password']

    def validate_nombre(self, value):
        if not re.match(r'^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$', value.strip()):
            raise serializers.ValidationError(
                "El nombre no puede contener números ni símbolos.")
        return value.strip()

    def validate_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Debe tener al menos una mayúscula.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Debe tener al menos una minúscula.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Debe tener al menos un número.")
        return value

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)