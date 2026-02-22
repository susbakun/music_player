import { ReactNode, useEffect, useCallback } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function CustomModal({ isOpen, onClose, title, children }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex 
      items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-black 
        border border-white/10 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
