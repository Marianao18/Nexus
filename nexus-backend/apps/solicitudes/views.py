from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import SolicitudDocente
from .serializers import SolicitudDocenteSerializer
from apps.usuarios.models import Usuario
import uuid
from django.core.mail import send_mail
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
            
            link_recuperacion = f"http://localhost:3000/restablecer-password/{uid}/{token}"
            
            asunto = "NEXUS - Recuperación de Acceso"
            mensaje = (
                f"Hola {user.nombre},\n\n"
                f"Para restablecer tu contraseña en NEXUS ID, haz clic en el siguiente enlace:\n\n"
                f"{link_recuperacion}\n\n"
                f"Este enlace es válido por tiempo limitado. Si no solicitaste esto, ignora este correo."
            )
            
            send_mail(
                asunto,
                mensaje,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

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