import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Info, LoaderCircle, X } from 'lucide-react';
export function Button({ to, href, children, variant = 'primary', className = '', arrow = false, ...props }) {
  const cls = `button button-${variant} ${className}`;
  const content = <>{children}{arrow && <ArrowRight size={17} />}</>;
  return to ? <Link className={cls} to={to} {...props}>{content}</Link> : href ? <a className={cls} href={href} {...props}>{content}</a> : <button className={cls} {...props}>{content}</button>;
}
export function Badge({ children, warm = false }) { return <span className={`badge ${warm ? 'badge-warm' : ''}`}>{children}</span>; }
export function SectionTitle({ eyebrow, title, accent, description, center = false }) { return <div className={`section-title ${center ? 'center' : ''}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title} <em>{accent}</em></h2>{description && <p>{description}</p>}</div>; }
export function EmptyState({ icon: Icon = Info, title, children }) { return <div className="empty-state"><span className="icon-disc"><Icon size={26}/></span><h3>{title}</h3>{children && <p>{children}</p>}</div>; }
export function Loading() { return <div className="loading" role="status"><LoaderCircle className="spin" size={25}/><span>Cargando tu espacio…</span></div>; }
export function Notice({ children, tone = 'info' }) { return <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : undefined}><Info size={19}/><div>{children}</div></div>; }
export function Field({ label, error, children, ...props }) { const id = useId(); return <div className="field"><label htmlFor={id}>{label}</label>{children ? React.cloneElement(children, { id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined }) : <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props}/>} {error && <span className="field-error" id={`${id}-error`}>{error}</span>}</div>; }
export function Modal({ title, children, onClose }) {
  const ref = useRef(); const heading = useId();
  useEffect(() => { const d = ref.current; const active = document.activeElement; d.showModal(); return () => { d.close(); active?.focus(); }; }, []);
  return <dialog className="modal" ref={ref} aria-labelledby={heading} onCancel={onClose} onClick={e => { if(e.target === e.currentTarget) onClose(); }}><div className="modal-head"><h2 id={heading}>{title}</h2><button onClick={onClose} className="icon-button" aria-label="Cerrar ventana"><X/></button></div>{children}</dialog>;
}
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 5500); return () => clearTimeout(id); }, [toast]);
  return <ToastContext.Provider value={(message, type = 'success') => setToast({ message, type })}>{children}{toast && <div className={`toast ${toast.type}`} role="status"><Check size={18}/>{toast.message}<button className="icon-button" onClick={() => setToast(null)} aria-label="Cerrar aviso"><X size={16}/></button></div>}</ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
export class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? (this.props.fallback || <main className="container section"><EmptyState title="Necesitamos volver a cargar esta página">Tu información guardada sigue disponible.</EmptyState><Button onClick={() => window.location.reload()}>Volver a cargar</Button></main>) : this.props.children; }
}
