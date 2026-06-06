from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import SolicitudDocente
from .serializers import SolicitudDocenteSerializer
from apps.usuarios.models import Usuario
import uuid
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.db import transaction 

class SolicitudDocenteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SolicitudDocenteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"mensaje": "Solicitud enviada correctamente. El administrador la revisará pronto."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AprobarDocenteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        # 1. Validación de permisos
        if request.user.rol != 'admin':
            return Response(
                {"error": "No tienes permisos."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with transaction.atomic():
                try:
                    # Buscamos la solicitud pendiente
                    solicitud = SolicitudDocente.objects.get(id=id, estado='pendiente')
                except SolicitudDocente.DoesNotExist:
                    return Response(
                        {"error": "Solicitud no encontrada o ya procesada."},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Generar contraseña temporal
                password_temporal = f"Nexus{str(uuid.uuid4())[:8]}!"
                
                # Crear o actualizar usuario
                user, created = Usuario.objects.get_or_create(
                    email=solicitud.email,
                    defaults={
                        'nombre': solicitud.nombre_completo,
                        'rol': 'docente',
                        'debe_cambiar_password': True  
                    }
                )

                if created:
                    user.set_password(password_temporal)
                    user.save()
                else:
                    user.set_password(password_temporal)
                    user.debe_cambiar_password = True
                    user.save()

                # Actualizar estado de la solicitud
                solicitud.estado = 'aprobada'
                solicitud.fecha_respuesta = timezone.now()
                solicitud.save()

                # Configurar correo
                asunto = "NEXUS - Tu cuenta de docente ha sido aprobada"
                mensaje = (
                    f"Hola {solicitud.nombre_completo},\n\n"
                    f"Tu solicitud ha sido aprobada. Credenciales:\n\n"
                    f"Usuario: {solicitud.email}\n"
                    f"Contraseña temporal: {password_temporal}\n\n"
                    f"Cámbiala al ingresar por primera vez."
                )

                # Intentar enviar mail
                try:
                    send_mail(
                        asunto,
                        mensaje,
                        settings.EMAIL_HOST_USER,
                        [solicitud.email],
                        fail_silently=False,
                    )
                    return Response({
                        "mensaje": f"Docente {solicitud.nombre_completo} aprobado y notificado.",
                        "password": password_temporal
                    }, status=status.HTTP_200_OK)

                except Exception as e:
                    print(f"Error SMTP: {e}")
                    return Response({
                        "mensaje": "Docente aprobado, pero falló el envío del correo.",
                        "error_email": str(e),
                        "password_not_sent": password_temporal 
                    }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Este es el bloque que cierra el 'try' principal de la función
            print(f"Error crítico: {e}")
            return Response(
                {"error": "Hubo un fallo crítico al procesar la aprobación."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminSolicitudesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.rol != 'admin':
            return Response(
                {"error": "No tienes permisos para ver esta lista."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        solicitudes = SolicitudDocente.objects.filter(estado='pendiente').order_by('-fecha_solicitud')
        serializer = SolicitudDocenteSerializer(solicitudes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RechazarDocenteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.rol != 'admin':
            return Response(
                {"error": "No tienes permisos."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            solicitud = SolicitudDocente.objects.get(id=id, estado='pendiente')
        except SolicitudDocente.DoesNotExist:
            return Response(
                {"error": "Solicitud no encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )

        solicitud.estado          = 'rechazada'
        solicitud.fecha_respuesta = timezone.now()
        solicitud.save()

        return Response({
            "mensaje": f"Solicitud de {solicitud.nombre_completo} rechazada."
        })
    
class RecuperarPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        
        if not email:
            return Response({"error": "El correo es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Usuario.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # URL dinamica: toma el dominio del request (sirve en dev y prod).
            # nginx pasa Host correctamente con `proxy_set_header Host $host;`,
            # asi que Django ve el dominio publico al que el navegador se conecto.
            base_url = request.build_absolute_uri('/').rstrip('/')
            link_recuperacion = f"{base_url}/restablecer-password/{uid}/{token}"

            asunto = "NEXUS - Recuperacion de Acceso"

            # Fallback en texto plano (para clientes de correo sin HTML)
            mensaje_texto = (
                f"Hola {user.nombre},\n\n"
                f"Para restablecer tu contraseña en NEXUS ID, haz clic en el siguiente enlace:\n\n"
                f"{link_recuperacion}\n\n"
                f"Este enlace es valido por tiempo limitado. Si no solicitaste esto, ignora este correo."
            )

            
            mensaje_html = f"""\
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXUS - Recuperacion de Acceso</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6fb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f6fb; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px; background-color:#0d1424; border:1px solid rgba(0,229,255,0.15); border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(13,20,36,0.15);">

          <!-- Header con logo -->
          <tr>
            <td align="center" style="padding:40px 30px 20px 30px; background:linear-gradient(135deg, #0d1424 0%, #131c30 100%); border-bottom:1px solid rgba(0,229,255,0.1);">
              <h1 style="margin:0; font-size:36px; font-weight:800; letter-spacing:2px; color:#eef2ff;">
                NEX<span style="color:#00e5ff;">US</span>
              </h1>
              <p style="margin:8px 0 0 0; font-size:11px; letter-spacing:3px; color:#00e5ff; text-transform:uppercase; font-weight:600;">
                Recuperacion de Acceso
              </p>
            </td>
          </tr>

          <!-- Cuerpo del mensaje -->
          <tr>
            <td style="padding:36px 40px 20px 40px;">
              <h2 style="margin:0 0 16px 0; font-size:22px; color:#eef2ff; font-weight:700;">
                Hola, {user.nombre}
              </h2>
              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#a8b3cf;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                <strong style="color:#eef2ff;">NEXUS ID</strong>. Para continuar con el proceso,
                haz clic en el siguiente boton:
              </p>

              <!-- Boton CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 28px 0;">
                    <a href="{link_recuperacion}"
                       style="display:inline-block; padding:14px 38px; background-color:#00e5ff; color:#060b14; text-decoration:none; font-weight:700; font-size:15px; border-radius:10px; letter-spacing:0.5px; box-shadow:0 4px 20px rgba(0,229,255,0.3);">
                      Restablecer contraseña &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin:0 0 8px 0; font-size:13px; color:#7a8ba8;">
                Si el boton no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px 0; font-size:12px; color:#00e5ff; word-break:break-all; padding:12px; background-color:#060b14; border-radius:8px; border:1px solid rgba(0,229,255,0.1);">
                {link_recuperacion}
              </p>

              <!-- Aviso de seguridad -->
              <div style="padding:16px; background-color:rgba(255,193,7,0.08); border-left:3px solid #ffc107; border-radius:6px; margin-top:8px;">
                <p style="margin:0; font-size:13px; color:#cdd5e5; line-height:1.5;">
                  <strong style="color:#ffc107;">Importante:</strong> Este enlace es valido por tiempo limitado.
                  Si tu no solicitaste cambiar tu contraseña, puedes ignorar este correo de forma segura.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
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

            # Enviar con texto plano + HTML (multipart)
            email_msg = EmailMultiAlternatives(
                subject=asunto,
                body=mensaje_texto,
                from_email=settings.EMAIL_HOST_USER,
                to=[email],
            )
            email_msg.attach_alternative(mensaje_html, "text/html")
            email_msg.send(fail_silently=False)

            return Response(
                {"mensaje": "Si el correo coincide con nuestros registros, recibirás el enlace pronto."},
                status=status.HTTP_200_OK
            )

        except Usuario.DoesNotExist:
            return Response(
                {"mensaje": "Si el correo coincide con nuestros registros, recibirás el enlace pronto."},
                status=status.HTTP_200_OK
            )
        
class ConfirmarPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        try:
            id_usuario = force_str(urlsafe_base64_decode(uidb64))
            user = Usuario.objects.get(pk=id_usuario)

            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()

                return Response({"mensaje": "Contraseña actualizada con éxito."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "El enlace ha expirado o es inválido."}, status=status.HTTP_400_BAD_REQUEST)

        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response({"error": "Datos de recuperación inválidos."}, status=status.HTTP_400_BAD_REQUEST)
        

