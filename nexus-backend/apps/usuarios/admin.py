from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display  = ['nombre', 'email', 'rol', 'is_active', 'fecha_registro']
    list_filter   = ['rol', 'is_active']
    search_fields = ['nombre', 'email']
    ordering      = ['-fecha_registro']