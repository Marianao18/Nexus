from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .serializers import RegistroSerializer
from .models import Usuario


# ─── HTML del correo de bienvenida al estudiante ──────────────────────────────
# (usa {nombre} y {link_login} como placeholders de .format())
_RENDER_BIENVENIDA_ESTUDIANTE = """\
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXUS - Bienvenido</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6fb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f6fb; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px; background-color:#0d1424; border:1px solid rgba(0,229,255,0.15); border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(13,20,36,0.15);">
          <tr>
            <td align="center" style="padding:40px 30px 20px 30px; background:linear-gradient(135deg, #0d1424 0%, #131c30 100%); border-bottom:1px solid rgba(0,229,255,0.1);">
              <h1 style="margin:0; font-size:36px; font-weight:800; letter-spacing:2px; color:#eef2ff;">
                NEX<span style="color:#00e5ff;">US</span>
              </h1>
              <p style="margin:8px 0 0 0; font-size:11px; letter-spacing:3px; color:#00e5ff; text-transform:uppercase; font-weight:600;">
                Bienvenido a bordo
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 20px 40px;">
              <h2 style="margin:0 0 16px 0; font-size:24px; color:#eef2ff; font-weight:700;">
                &iexcl;Hola, {nombre}! &#128640;
              </h2>
              <p style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#a8b3cf;">
                Bienvenido a <strong style="color:#eef2ff;">NEXUS</strong>, la plataforma
                de educacion en TI hecha para personas como tu. Tu cuenta ha sido creada
                exitosamente y todo esta listo para que empieces a aprender.
              </p>
              <div style="margin:24px 0;">
                <p style="margin:0 0 12px 0; font-size:11px; color:#00e5ff; text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">
                  Lo que encontraras dentro
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr><td style="padding:8px 0; font-size:14px; color:#cdd5e5;">&#128218; &nbsp; Cursos curados por docentes expertos</td></tr>
                  <tr><td style="padding:8px 0; font-size:14px; color:#cdd5e5;">&#129302; &nbsp; NexIA, tu asistente de aprendizaje personalizado</td></tr>
                  <tr><td style="padding:8px 0; font-size:14px; color:#cdd5e5;">&#128202; &nbsp; Seguimiento de tu progreso en tiempo real</td></tr>
                  <tr><td style="padding:8px 0; font-size:14px; color:#cdd5e5;">&#128206; &nbsp; Recursos descargables en cada curso</td></tr>
                </table>
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 24px 0;">
                    <a href="{link_login}"
                       style="display:inline-block; padding:14px 38px; background-color:#00e5ff; color:#060b14; text-decoration:none; font-weight:700; font-size:15px; border-radius:10px; letter-spacing:0.5px; box-shadow:0 4px 20px rgba(0,229,255,0.3);">
                      Empezar ahora &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="padding:14px 16px; background-color:rgba(0,229,255,0.05); border-left:3px solid #00e5ff; border-radius:6px;">
                <p style="margin:0; font-size:13px; color:#cdd5e5; line-height:1.5; font-style:italic;">
                  &ldquo;El conocimiento es el unico tesoro que crece cuando se comparte.&rdquo;
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 30px 32px 30px; border-top:1px solid rgba(0,229,255,0.08);">
              <p style="margin:0 0 6px 0; font-size:12px; color:#7a8ba8;">
                Este correo fue enviado automaticamente, por favor no respondas a este mensaje.
              </p>
              <p style="margin:0; font-size:11px; color:#5a6781; letter-spacing:0.5px;">
                &copy; NEXUS &middot; Educacion en TI &middot; Medellin
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


class RegistroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response(
                {"mensaje": "Cuenta creada con ÃÂ©xito.", "email": usuario.email},
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
                {"mensaje": "SesiÃÂ³n cerrada correctamente."},
                status=status.HTTP_200_OK
            )
        except TokenError:
            # Token ya expirado o invÃÂ¡lido Ã¢ÂÂ igual limpiamos la sesiÃÂ³n
            return Response(
                {"mensaje": "SesiÃÂ³n cerrada."},
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

        # Validacion basica
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

            # Enviar correo de bienvenida (no bloqueamos la respuesta si falla)
            try:
                self._enviar_correo_bienvenida(request, nombre, email)
            except Exception as e:
                print(f"Error SMTP en bienvenida estudiante: {e}")

            return Response(
                {"mensaje": "Estudiante creado con éxito"},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @staticmethod
    def _enviar_correo_bienvenida(request, nombre, email):
        """Envia correo HTML branded de bienvenida al nuevo estudiante."""
        base_url = request.build_absolute_uri('/').rstrip('/')
        link_login = f"{base_url}/login"

        asunto = "NEXUS - ¡Bienvenido a la comunidad!"

        mensaje_texto = (
            f"¡Hola {nombre}!\n\n"
            f"Bienvenido a NEXUS, la plataforma de educacion en TI hecha para ti.\n\n"
            f"Tu cuenta ha sido creada exitosamente. Ahora puedes acceder a:\n"
            f"- Cursos curados por docentes expertos\n"
            f"- NexIA, tu asistente de aprendizaje personalizado\n"
            f"- Seguimiento de tu progreso en tiempo real\n"
            f"- Recursos descargables para cada curso\n\n"
            f"Empieza tu camino aqui: {link_login}\n\n"
            f"¡Nos vemos en la plataforma!\nEl equipo de NEXUS."
        )

        mensaje_html = _RENDER_BIENVENIDA_ESTUDIANTE.format(nombre=nombre, link_login=link_login)

        email_msg = EmailMultiAlternatives(
            subject=asunto,
            body=mensaje_texto,
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        email_msg.attach_alternative(mensaje_html, "text/html")
        email_msg.send(fail_silently=False)


class CambiarPasswordObligatorioView(APIView):
    permission_classes = [IsAuthenticated] # Requiere token

    def post(self, request):
        nueva_password = request.data.get('nueva_password')
        usuario = request.user
        
        if nueva_password:
            usuario.set_password(nueva_password)
            # Si usas el campo de cambio obligatorio, aquÃÂ­ lo desactivamos
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

        # 1. Validar que la contraseÃÂ±a actual sea correcta
        if not user.check_password(password_actual):
            return Response({'error': 'La contraseÃÂ±a actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Cambiar la contraseÃÂ±a
        user.set_password(nueva_password)
        user.save()
        
        return Response({'mensaje': 'ContraseÃÂ±a actualizada correctamente.'}, status=status.HTTP_200_OK)
    
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

            # Evitar que el admin se elimine a sÃÂ­ mismo
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