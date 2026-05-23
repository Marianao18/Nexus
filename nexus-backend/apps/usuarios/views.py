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
        foto_url = None
        if u.foto_perfil:
            foto_url = request.build_absolute_uri(u.foto_perfil.url)
        return Response({
            'nombre':         u.nombre,
            'email':          u.email,
            'rol':            u.rol,
            'fecha_registro': u.fecha_registro,
            'biografia':      u.biografia or '',
            'foto_perfil':    foto_url,
            'avatar_id':      u.avatar_id or '',
        })

    def patch(self, request):
        u = request.user
        if 'biografia' in request.data:
            u.biografia = str(request.data['biografia'])[:500]
        if 'avatar_id' in request.data:
            u.avatar_id = str(request.data['avatar_id'])[:20]
        if 'foto_perfil' in request.FILES:
            if u.foto_perfil:
                try:
                    import os
                    if os.path.isfile(u.foto_perfil.path):
                        os.remove(u.foto_perfil.path)
                except Exception:
                    pass
            u.foto_perfil = request.FILES['foto_perfil']
        u.save()
        foto_url = None
        if u.foto_perfil:
            foto_url = request.build_absolute_uri(u.foto_perfil.url)
        return Response({
            'mensaje':     'Perfil actualizado correctamente.',
            'biografia':   u.biografia,
            'foto_perfil': foto_url,
            'avatar_id':   u.avatar_id,
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
    
class RegistroEstudianteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Extraemos los datos que vienen del componente React
        nombre = request.data.get('nombre')
        email = request.data.get('email')
        password = request.data.get('password')

        # Validaciones básicas
        if not email or not password:
            return Response(
                {"error": "Email y contraseña son obligatorios"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if Usuario.objects.filter(email=email).exists():
            return Response(
                {"email": "Este correo ya existe"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Creamos el usuario con rol estudiante
            user = Usuario.objects.create_user(
                email=email,
                nombre=nombre,
                password=password,
                rol='estudiante'
            )
            return Response(
                {"mensaje": "Estudiante creado con éxito"}, 
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class CambiarPasswordObligatorioView(APIView):
    permission_classes = [IsAuthenticated] # Requiere token

    def post(self, request):
        nueva_password = request.data.get('nueva_password')
        usuario = request.user
        
        if nueva_password:
            usuario.set_password(nueva_password)
            # Si usas el campo de cambio obligatorio, aquí lo desactivamos
            # usuario.debe_cambiar_password = False 
            usuario.save()
            return Response({"mensaje": "Password actualizado"}, status=status.HTTP_200_OK)
        
        return Response({"error": "Faltan datos"}, status=status.HTTP_400_BAD_REQUEST)
    


class CambiarPasswordPerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password_actual = request.data.get('password_actual')
        nueva_password = request.data.get('nueva_password')

        # 1. Validar que la contraseña actual sea correcta
        if not user.check_password(password_actual):
            return Response({'error': 'La contraseña actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Cambiar la contraseña
        user.set_password(nueva_password)
        user.save()
        
        return Response({'mensaje': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Usuario


class EliminarUsuarioView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, id):

        # Validar admin
        if request.user.rol != 'admin':
            return Response(
                {'error': 'No autorizado'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            usuario = Usuario.objects.get(id=id)

            # Evitar que el admin se elimine a así­ mismo
            if usuario.id == request.user.id:
                return Response(
                    {'error': 'No puedes eliminar tu propia cuenta'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            usuario.delete()

            return Response(
                {'mensaje': 'Usuario eliminado correctamente'},
                status=status.HTTP_200_OK
            )

        except Usuario.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

class CrearCursoView(APIView):

    def post(self, request):

        data = request.data

        curso = Curso.objects.create(
            nombre=data.get('nombre'),
            descripcion=data.get('descripcion'),
            tecnologia=data.get('tecnologia'),
            color=data.get('color'),
            docente_id=data.get('docente_id'),
        )

        return Response({
            "mensaje": "Curso creado correctamente",
            "id": str(curso.id)
        }, status=status.HTTP_201_CREATED)