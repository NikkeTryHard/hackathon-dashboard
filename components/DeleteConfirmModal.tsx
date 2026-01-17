"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
  },
};

interface DeleteConfirmModalProps {
  userName: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ userName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm]);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial="hidden" animate="visible" exit="hidden">
        {/* Backdrop */}
        <motion.div className="absolute inset-0 bg-void/80 backdrop-blur-sm" variants={backdropVariants} onClick={onCancel} />

        {/* Modal */}
        <motion.div className="relative w-full max-w-sm surface-floating p-6" variants={modalVariants}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/10">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">Delete User</h2>
            </div>
            <button onClick={onCancel} aria-label="Close modal" className="p-2 rounded-lg hover:bg-surface-1 text-text-ghost hover:text-text-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-text-secondary">
              Are you sure you want to delete <span className="font-semibold text-text-primary">{userName}</span>?
            </p>
            <p className="mt-2 text-sm text-text-ghost">This action cannot be undone. All associated data will be permanently removed.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={isDeleting} className="flex-1 btn-ghost">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={isDeleting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-error text-white font-medium transition-all hover:bg-error/90 disabled:opacity-50">
              {isDeleting ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
