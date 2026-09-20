import { useEffect, useRef } from 'react';

const stack = [];

export default function Modal({ title, onClose, level = 1, children }) {
  const id = useRef(Symbol('modal'));
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const me = id.current;
    stack.push(me);
    const h = (e) => e.key === 'Escape' && stack[stack.length - 1] === me && close.current();
    window.addEventListener('keydown', h);
    return () => {
      window.removeEventListener('keydown', h);
      stack.splice(stack.indexOf(me), 1);
    };
  }, []);

  return (
    <div className="modal-overlay" style={{ zIndex: 100 + level * 10 }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">✕</button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
