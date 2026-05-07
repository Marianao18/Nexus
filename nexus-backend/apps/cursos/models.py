from django.db import models
import uuid
from apps.usuarios.models import Usuario


class RutaAprendizaje(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre      = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    duracion    = models.CharField(max_length=50, default='4 meses')
    color       = models.CharField(max_length=20, default='#00E5FF')
    activa      = models.BooleanField(default=True)

    class Meta:
        db_table     = 'rutas_aprendizaje'
        verbose_name = 'Ruta de Aprendizaje'

    def __str__(self):
        return self.nombre


class Curso(models.Model):
    TECNOLOGIA_CHOICES = [
        ('python',     'Python'),
        ('powerbi',    'Power BI'),
        ('excel',      'Excel'),
        ('django',     'Django'),
        ('java',       'Java Spring Boot'),
        ('postgresql', 'PostgreSQL'),
        ('mongodb',    'MongoDB'),
        ('otro',       'Otro'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre      = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    docente     = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='cursos_dictados', limit_choices_to={'rol': 'docente'})
    tecnologia  = models.CharField(max_length=30, choices=TECNOLOGIA_CHOICES, default='otro')
    color       = models.CharField(max_length=20, default='#00E5FF')
    ruta        = models.ForeignKey(RutaAprendizaje, on_delete=models.SET_NULL, null=True, blank=True, related_name='cursos')
    activo      = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table     = 'cursos'
        verbose_name = 'Curso'

    def __str__(self):
        return self.nombre


class Modulo(models.Model):
    id     = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    curso  = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='modulos')
    nombre = models.CharField(max_length=150)
    orden  = models.PositiveIntegerField(default=1)

    class Meta:
        db_table  = 'modulos'
        ordering  = ['orden']

    def __str__(self):
        return f"{self.curso.nombre} — {self.nombre}"


class Inscripcion(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    estudiante  = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='inscripciones', limit_choices_to={'rol': 'estudiante'})
    curso       = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='inscripciones')
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    activa      = models.BooleanField(default=True)

    class Meta:
        db_table = 'inscripciones'
        unique_together = ['estudiante', 'curso']

    def __str__(self):
        return f"{self.estudiante.nombre} → {self.curso.nombre}"

    @property
    def progreso(self):
        total = self.curso.modulos.count()
        if total == 0:
            return 0
        completados = ModuloCompletado.objects.filter(
            estudiante=self.estudiante,
            modulo__curso=self.curso
        ).count()
        return round((completados / total) * 100)

    @property
    def modulos_completados(self):
        return ModuloCompletado.objects.filter(
            estudiante=self.estudiante,
            modulo__curso=self.curso
        ).count()


class ModuloCompletado(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    estudiante  = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='modulos_completados')
    modulo      = models.ForeignKey(Modulo, on_delete=models.CASCADE)
    fecha       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'modulos_completados'
        unique_together = ['estudiante', 'modulo']

    def __str__(self):
        return f"{self.estudiante.nombre} ✓ {self.modulo.nombre}"


class InscripcionRuta(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='rutas_inscritas')
    ruta       = models.ForeignKey(RutaAprendizaje, on_delete=models.CASCADE, related_name='inscripciones')
    fecha      = models.DateTimeField(auto_now_add=True)
    activa     = models.BooleanField(default=True)

    class Meta:
        db_table        = 'inscripciones_rutas'
        unique_together = ['estudiante', 'ruta']

    def __str__(self):
        return f"{self.estudiante.nombre} → {self.ruta.nombre}"


class Recurso(models.Model):
    TIPO_CHOICES = [
        ('pdf',  'PDF'),
        ('docx', 'Word'),
        ('xlsx', 'Excel'),
        ('csv',  'CSV'),
        ('otro', 'Otro'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    curso       = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='recursos')
    docente     = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='recursos_subidos')
    nombre      = models.CharField(max_length=200)
    archivo     = models.FileField(upload_to='recursos/')
    tipo        = models.CharField(max_length=10, choices=TIPO_CHOICES, default='otro')
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recursos'
        ordering = ['-fecha_subida']

    def __str__(self):
        return f"{self.nombre} — {self.curso.nombre}"

class Modulo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name='modulos'
    )

    titulo = models.CharField(max_length=255)

    orden = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.titulo
    
class Leccion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    modulo = models.ForeignKey(
        Modulo,
        on_delete=models.CASCADE,
        related_name='lecciones'
    )

    titulo = models.CharField(max_length=255)

    descripcion = models.TextField(blank=True)

    video_url = models.URLField()

    orden = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.titulo