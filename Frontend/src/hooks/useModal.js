import { useEffect, useRef, useCallback } from "react";

export const useModal = ({ isOpen, onClose, isDirty = false }) => {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Save the currently focused element before opening modal
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement;
    }
  }, [isOpen]);

  // Handle Close with optional dirty form confirmation
  const handleSafeClose = useCallback(() => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmDiscard) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      // Escape key to close
      if (event.key === "Escape") {
        event.preventDefault();
        handleSafeClose();
        return;
      }

      // Focus trap
      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus to triggering element
      if (previouslyFocusedElement.current?.focus) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, handleSafeClose]);

  return {
    modalRef,
    handleSafeClose,
  };
};

export default useModal;

