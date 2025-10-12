import React from 'react';
import { createPortal } from 'react-dom';

interface PopupProps {
  onClose: () => void;
  anchor?: DOMRect;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Popup: React.FC<PopupProps> = ({ onClose, anchor, children }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const container = React.useMemo(() => {
    const element = document.createElement('div');
    element.className = 'pds-popupPortal';
    return element;
  }, []);

  React.useEffect(() => {
    document.body.appendChild(container);
    containerRef.current = container;

    return () => {
      containerRef.current = null;
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [container]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const content = contentRef.current;
        if (!content) {
          return;
        }
        const focusable = Array.from(
          content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.hasAttribute('disabled'));
        if (!focusable.length) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey) {
          if (!active || !content.contains(active) || active === first) {
            event.preventDefault();
            last.focus();
          }
        } else if (!active || !content.contains(active) || active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose]);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      const content = contentRef.current;
      if (content && !content.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      const content = contentRef.current;
      if (content && !content.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('wheel', handleWheel, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('wheel', handleWheel, true);
    };
  }, [onClose]);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    const focusable = content.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.focus({ preventScroll: true });
  }, []);

  const style: React.CSSProperties = anchor
    ? {
        top: Math.max(anchor.bottom + 8, 0),
        left: Math.max(anchor.left, 0),
        minWidth: Math.max(anchor.width, 280),
      }
    : undefined;

  const popup = (
    <div className="pds-popupOverlay">
      <div
        className="pds-popup"
        role="dialog"
        aria-modal="true"
        ref={contentRef}
        style={style}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(popup, container);
};
