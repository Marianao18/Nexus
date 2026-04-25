from django.urls import path
from .views import (
    SolicitudDocenteView,
    AdminSolicitudesView,
    AprobarDocenteView,
    RechazarDocenteView,
    RecuperarPasswordView,
    ConfirmarPasswordView
)

urlpatterns = [
    path('solicitud-docente/',             SolicitudDocenteView.as_view()),
    path('admin/solicitudes/',             AdminSolicitudesView.as_view()),
    path('admin/aprobar-docente/<uuid:id>/', AprobarDocenteView.as_view()),
    path('admin/rechazar-docente/<uuid:id>/', RechazarDocenteView.as_view()),
    path('password-reset/', RecuperarPasswordView.as_view(), name='recuperar-password'),
    path('confirmar-password/', ConfirmarPasswordView.as_view(), name='confirmar-password'),
]