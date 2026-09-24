"use client";

import { useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
}

// Accessible dialog shell: traps Tab focus inside, closes on Escape, and
// restores focus to whatever had it when the dialog opened. Works for both
// overlay popups (outerClassName="popup-overlay") and the inline help panel.
export default function Dialog({
  label,
  onClose,
  outerClassName,
  innerClassName,
  lockScroll = true,
  children,
}: {
  label: string;
  onClose: () => void;
  outerClassName: string;
  innerClassName?: string;
  lockScroll?: boolean;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  // Keep the ref fresh without writing it during render.
  useEffect(() => {
    closeRef.current = onClose;
  });
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = rootRef.current;
    // Move focus inside the dialog on open.
    (focusableIn(root!).at(0) ?? root)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const els = focusableIn(root);
      if (els.length === 0) {
        event.preventDefault();
        return;
      }
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    // Lock background scroll while open; save/restore nests correctly when
    // dialogs stack (e.g. hint popup over the challenges modal).
    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus();
    };
    // lockScroll is intentionally read once: scroll behavior is fixed for the
    // dialog's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const body = innerClassName ? (
    <div className={innerClassName}>{children}</div>
  ) : (
    children
  );
  return (
    <div
      ref={rootRef}
      className={outerClassName}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
    >
      {body}
    </div>
  );
}
