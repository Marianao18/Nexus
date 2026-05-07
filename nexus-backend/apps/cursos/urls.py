from django.urls import path
from .views import (
    ResumenEstudianteView, CursosEstudianteView, RutasEstudianteView,
    ProgresoEstudianteView, CompletarModuloView,
    CatalogoView, InscribirseView,
    AdminCursosView, AdminCursoDetalleView, DocentesListView,
    DocenteCursosView, DocenteEstudiantesView, DocenteResumenView,
    RecursosView, RecursoDeleteView,
    AdminContenidoCursoView, AdminModuloView, AdminModuloDetalleView,
    AdminLeccionView, AdminLeccionDetalleView,
    EstudianteCursoContenidoView, MarcarLeccionVistaView,
)
from apps.usuarios.views import AdminUsuariosView

urlpatterns = [
    # ── Estudiante ────────────────────────────────────────────────────────────
    path('estudiante/resumen/',                        ResumenEstudianteView.as_view()),
    path('estudiante/cursos/',                         CursosEstudianteView.as_view()),
    path('estudiante/rutas/',                          RutasEstudianteView.as_view()),
    path('estudiante/progreso/',                       ProgresoEstudianteView.as_view()),
    path('estudiante/completar-modulo/',               CompletarModuloView.as_view()),
    path('estudiante/cursos/<uuid:id>/contenido/',     EstudianteCursoContenidoView.as_view()),
    path('estudiante/lecciones/<uuid:leccion_id>/vista/', MarcarLeccionVistaView.as_view()),

    # ── Catálogo e inscripción ────────────────────────────────────────────────
    path('cursos/catalogo/',    CatalogoView.as_view()),
    path('cursos/inscribirse/', InscribirseView.as_view()),

    # ── Admin ─────────────────────────────────────────────────────────────────
    path('admin/cursos/',                          AdminCursosView.as_view()),
    path('admin/cursos/<uuid:id>/',                AdminCursoDetalleView.as_view()),
    path('admin/cursos/<uuid:id>/contenido/',      AdminContenidoCursoView.as_view()),
    path('admin/cursos/<uuid:id>/modulos/',        AdminModuloView.as_view()),
    path('admin/modulos/<uuid:modulo_id>/',        AdminModuloDetalleView.as_view()),
    path('admin/modulos/<uuid:modulo_id>/lecciones/', AdminLeccionView.as_view()),
    path('admin/lecciones/<uuid:leccion_id>/',     AdminLeccionDetalleView.as_view()),
    path('admin/docentes/',                        DocentesListView.as_view()),
    path('admin/usuarios/',                        AdminUsuariosView.as_view()),

    # ── Docente ───────────────────────────────────────────────────────────────
    path('docente/resumen/',                              DocenteResumenView.as_view()),
    path('docente/cursos/',                               DocenteCursosView.as_view()),
    path('docente/cursos/<uuid:id>/estudiantes/',         DocenteEstudiantesView.as_view()),
    path('docente/cursos/<uuid:id>/recursos/',            RecursosView.as_view()),
    path('docente/recursos/<uuid:id>/',                   RecursoDeleteView.as_view()),
]
