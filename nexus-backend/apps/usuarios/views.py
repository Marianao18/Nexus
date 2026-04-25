from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import RegistroSerializer
from .models import Usuario


class RegistroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response(
                {"mensaje": "Cuenta creada con éxito.", "email": usuario.email},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Credenciales incorrectas."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not usuario.check_password(password):
            return Response(
                {"error": "Credenciales incorrectas."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(usuario)
        return Response({
            "access":  str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "nombre": usuario.nombre,
                "email":  usuario.email,
                "rol":    usuario.rol,
            }
        })


class LogoutView(APIView):
    """
    Invalida el refresh token en el servidor (blacklist).
    El frontend debe enviar: { "refresh": "<refresh_token>" }
    con el Authorization: Bearer <access_token> en el header.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Se requiere el refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"mensaje": "Sesión cerrada correctamente."},
                status=status.HTTP_200_OK
            )
        except TokenError:
            # Token ya expirado o inválido → igual limpiamos la sesión
            return Response(
                {"mensaje": "Sesión cerrada."},
                status=status.HTTP_200_OK
            )


class PerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "nombre":         u.nombre,
            "email":          u.email,
            "rol":            u.rol,
            "fecha_registro": u.fecha_registro,
        })



class AdminUsuariosView(APIView):
    """
    GET /api/admin/usuarios/
    Lista todos los usuarios separados por rol.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.rol != 'admin':
            return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

        estudiantes = Usuario.objects.filter(rol='estudiante').values(
            'id', 'nombre', 'email', 'rol', 'is_active', 'fecha_registro'
        )
        docentes = Usuario.objects.filter(rol='docente').values(
            'id', 'nombre', 'email', 'rol', 'is_active', 'fecha_registro'
        )

        return Response({
            'estudiantes': list(estudiantes),
            'docentes':    list(docentes),
        })
