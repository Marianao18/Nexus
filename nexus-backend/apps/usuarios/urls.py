from django.urls import path
from .views import RegistroView, LoginView, LogoutView, PerfilView, AdminUsuariosView

urlpatterns = [
    path('registrar-estudiante/', RegistroView.as_view()),
    path('login/',                LoginView.as_view()),
    path('logout/',               LogoutView.as_view()),
    path('perfil/',               PerfilView.as_view()),
]
