from django.db import models
import uuid

class SolicitudDocente(models.Model):
    ESTADO_CHOICES = [
        ('pendiente',  'Pendiente'),
        ('aprobada',   'Aprobada'),
        ('rechazada',  'Rechazada'),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre_completo  = models.CharField(max_length=150)
    email            = models.EmailField()
    especialidad     = models.CharField(max_length=100)
    link_certificacion = models.URLField(blank=True, null=True)
    mensaje_motivacion = models.TextField()
    estado           = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fecha_solicitud  = models.DateTimeField(auto_now_add=True)
    fecha_respuesta  = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table     = 'solicitudes_docente'
        ordering     = ['-fecha_solicitud']
        verbose_name = 'Solicitud Docente'

    def __str__(self):
        return f"{self.nombre_completo} — {self.estado}"