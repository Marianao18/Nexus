from django.urls import path
from .views import (
    LoginView, LogoutView, PerfilView, 
    AdminUsuariosView, RegistroEstudianteView,CambiarPasswordPerfilView,CambiarPasswordObligatorioView, EliminarUsuarioView,CrearCursoView
)

urlpatterns = [
    path('registrar-estudiante/', RegistroEstudianteView.as_view()), 
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('perfil/', PerfilView.as_view()),
    path('cambiar-password-perfil/', CambiarPasswordPerfilView.as_view()),
    path('cambiar-password-obligatorio/', CambiarPasswordObligatorioView.as_view()),
    #path('cambiar-password-perfil/', CambiarPasswordPerfilView.as_view()),
    #path('admin/usuarios/', AdminUsuariosView.as_view()),
    path('admin/eliminar-usuario/<uuid:id>/',EliminarUsuarioView.as_view(),name='eliminar_usuario'),
        #path('admin/cursos/', CrearCursoView.as_view()),


]