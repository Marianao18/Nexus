from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

#urlpatterns = [
   # path('admin/', admin.site.urls),
  #  path('api/usuarios/',   include('apps.usuarios.urls')),
   # path('api/solicitudes/',   include('apps.solicitudes.urls')),
   # path('api/cursos/',   include('apps.cursos.urls')),
    
#] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.usuarios.urls')),
    path('api/', include('apps.solicitudes.urls')),
    path('api/', include('apps.cursos.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
