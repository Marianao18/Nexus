import React, { useEffect, useRef } from 'react';
import './NexusModal.css';



// ── Íconos SVG inline ────────────────────────────────────────────────────────
const Icons = {
  success: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="#00f5a0" strokeWidth="1.5"/>
      <path d="M8 14l4 4 8-8" stroke="#00f5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="#f87171" strokeWidth="1.5"/>
      <path d="M9 9l10 10M19 9L9 19" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3L26 24H2L14 3Z" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 11v6M14 20v1" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="#00e5ff" strokeWidth="1.5"/>
      <path d="M14 12v8M14 9v1" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  danger: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3L26 24H2L14 3Z" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 11v6M14 20v1" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

const COLORS = {
  success: { accent: '#00f5a0', bg: 'rgba(0,245,160,0.07)', border: 'rgba(0,245,160,0.25)' },
  error:   { accent: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.25)' },
  warning: { accent: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.25)' },
  info:    { accent: '#00e5ff', bg: 'rgba(0,229,255,0.07)',   border: 'rgba(0,229,255,0.25)' },
  danger:  { accent: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.25)' },
};

// ── Componente base ──────────────────────────────────────────────────────────
export function NexusModal({
  open,
  type = 'info',        // 'success' | 'error' | 'warning' | 'info' | 'danger'
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  acceptLabel  = 'Aceptar',
  mode = 'alert',       // 'alert' | 'confirm'
  onConfirm,
  onCancel,
  onAccept,
}) {
  const confirmBtnRef = useRef(null);
  const acceptBtnRef  = useRef(null);
  const color = COLORS[type] || COLORS.info;

  // Foco automático al abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        (mode === 'alert' ? acceptBtnRef : confirmBtnRef).current?.focus();
      }, 80);
    }
  }, [open, mode]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        mode === 'alert' ? onAccept?.() : onCancel?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, mode, onAccept, onCancel]);

  if (!open) return null;

  return (
    <div className="nx-modal-overlay" onClick={(e) => e.target === e.currentTarget && (mode === 'alert' ? onAccept?.() : onCancel?.())}>
      <div className="nx-modal-card" style={{ '--nx-accent': color.accent, '--nx-bg': color.bg, '--nx-border': color.border }}>

        {/* Barra superior de acento */}
        <div className="nx-modal-topbar" />

        {/* Icono + título */}
        <div className="nx-modal-header">
          <div className="nx-modal-icon">
            {Icons[type] || Icons.info}
          </div>
          {title && <h3 className="nx-modal-title">{title}</h3>}
        </div>

        {/* Mensaje */}
        {message && (
          <p className="nx-modal-message">{message}</p>
        )}

        {/* Acciones */}
        <div className="nx-modal-actions">
          {mode === 'alert' ? (
            <button
              ref={acceptBtnRef}
              className="nx-btn nx-btn-primary"
              onClick={onAccept}
            >
              {acceptLabel}
            </button>
          ) : (
            <>
              <button
                className="nx-btn nx-btn-ghost"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                className={`nx-btn nx-btn-primary ${type === 'danger' ? 'nx-btn-danger' : ''}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Hook: useNexusModal ───────────────────────────────────────────────────────
/**
 * Hook que provee showAlert y showConfirm + el JSX del modal.
 *
 * const { modalJSX, showAlert, showConfirm } = useNexusModal();
 * return <div>{modalJSX}{...resto}</div>
 */
export function useNexusModal() {
  const [state, setState] = React.useState({ open: false });

  const showAlert = (message, type = 'info', title) =>
    new Promise((resolve) => {
      setState({
        open: true, mode: 'alert', type,
        title: title || labelFor(type),
        message,
        onAccept: () => { setState({ open: false }); resolve(); },
      });
    });

  const showConfirm = (message, options = {}) =>
    new Promise((resolve) => {
      const { type = 'warning', title, confirmLabel, cancelLabel } = options;
      setState({
        open: true, mode: 'confirm', type,
        title: title || '¿Estás seguro?',
        message,
        confirmLabel: confirmLabel || 'Confirmar',
        cancelLabel:  cancelLabel  || 'Cancelar',
        onConfirm: () => { setState({ open: false }); resolve(true); },
        onCancel:  () => { setState({ open: false }); resolve(false); },
      });
    });

  const modalJSX = <NexusModal {...state} />;

  return { modalJSX, showAlert, showConfirm };
}

function labelFor(type) {
  return { success: '¡Listo!', error: 'Error', warning: 'Atención', info: 'Información', danger: 'Atención' }[type] || 'Aviso';
}
