import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

export function Button({
  variant = 'secondary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'link' }) {
  const v = variant === 'secondary' ? '' : ` btn--${variant}`;
  return <button type="button" className={`btn${v} ${className}`} {...rest} />;
}

export function Chip({ pressed, children, onToggle }: { pressed: boolean; children: ReactNode; onToggle: () => void }) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onToggle}>
      {children}
    </button>
  );
}

export function Banner({ kind, children }: { kind?: 'error' | 'warn'; children: ReactNode }) {
  return (
    <div className={`banner${kind ? ` banner--${kind}` : ''}`} role={kind === 'error' ? 'alert' : 'note'}>
      {children}
    </div>
  );
}

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <circle cx="256" cy="256" r="240" fill="#D98BA8" />
      <circle cx="270" cy="240" r="150" fill="#FFF8FA" />
      <circle cx="170" cy="300" r="28" fill="#713B61" />
    </svg>
  );
}

/** Panneau inférieur : fermeture par bouton ou Échap. */
export function Sheet({ title, onClose, children, closeLabel }: { title: string; onClose: () => void; children: ReactNode; closeLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="sheet" role="dialog" aria-label={title} tabIndex={-1} ref={ref}>
      <h2>{title}</h2>
      {children}
      <Button onClick={onClose}>{closeLabel}</Button>
    </div>
  );
}

interface ToastState {
  message: string;
  action?: { label: string; run: () => void };
}
const ToastCtx = createContext<(t: ToastState) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number>(undefined);
  const show = useCallback((t: ToastState) => {
    setToast(t);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.run();
                setToast(null);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
