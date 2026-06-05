from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/', include('apps.usuarios.urls')),
    path('api/', include('apps.solicitudes.urls')),
    path('api/', include('apps.cursos.urls')),

    # Servir archivos /media/ siempre (dev y prod).
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
