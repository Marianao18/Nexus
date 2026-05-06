from django.contrib import admin
from .models import SolicitudDocente # Asegúrate de que el nombre sea exacto

@admin.register(SolicitudDocente)
class SolicitudDocenteAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'email', 'especialidad', 'estado', 'fecha_solicitud')
    
    list_filter = ('estado', 'especialidad')
    
    search_fields = ('nombre_completo', 'email')
    
    readonly_fields = ('fecha_solicitud', 'id')