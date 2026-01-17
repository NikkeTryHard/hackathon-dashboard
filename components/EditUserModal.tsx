"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Shield, ShieldOff } from "lucide-react";

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

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

interface EditUserModalProps {
  user: User;
  currentUserId: string;
  onClose: () => void;
  onSave: (updatedUser: { id: string; name: string; isAdmin: boolean }) => void;
  onRegenerateKey: (userId: string) => Promise<void>;
}

export function EditUserModal({ user, currentUserId, onClose, onSave, onRegenerateKey }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isSelf = user.id === currentUserId;

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ id: user.id, name: name.trim(), isAdmin });
    } finally {
      setIsSaving(false);
    }
  }, [name, isAdmin, user.id, onSave]);

  const handleRegenerateKey = useCallback(async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateKey(user.id);
      setShowRegenerateConfirm(false);
    } finally {
      setIsRegenerating(false);
    }
  }, [user.id, onRegenerateKey]);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial="hidden" animate="visible" exit="hidden">
        {/* Backdrop */}
        <motion.div className="absolute inset-0 bg-void/80 backdrop-blur-sm" variants={backdropVariants} onClick={onClose} />

        {/* Modal */}
        <motion.div className="relative w-full max-w-md surface-floating p-6" variants={modalVariants}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Edit User</h2>
            <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-lg hover:bg-surface-1 text-text-ghost hover:text-text-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="edit-user-name" className="block text-xs font-medium text-text-tertiary uppercase tracking-widest mb-2">
                Name
              </label>
              <input id="edit-user-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Enter user name" />
            </div>

            {/* Admin Toggle */}
            <div>
              <label id="edit-user-role-label" className="block text-xs font-medium text-text-tertiary uppercase tracking-widest mb-2">
                Role
              </label>
              <button aria-labelledby="edit-user-role-label" onClick={() => !isSelf && setIsAdmin(!isAdmin)} disabled={isSelf} className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${isAdmin ? "bg-gold/10 border-gold/20 text-gold" : "bg-surface-0 border-border-dim text-text-secondary"} ${isSelf ? "opacity-50 cursor-not-allowed" : "hover:border-border-bright cursor-pointer"}`}>
                <div className="flex items-center gap-3">
                  {isAdmin ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                  <span className="font-medium">{isAdmin ? "Administrator" : "Regular User"}</span>
                </div>
                <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${isAdmin ? "bg-gold" : "bg-surface-2"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isAdmin ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </button>
              {isSelf && <p className="mt-2 text-xs text-text-ghost">You cannot change your own admin status</p>}
            </div>

            {/* Regenerate API Key */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary uppercase tracking-widest mb-2">API Key</label>
              {!showRegenerateConfirm ? (
                <button onClick={() => setShowRegenerateConfirm(true)} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-border-dim bg-surface-0 text-text-secondary hover:border-warning hover:text-warning transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate API Key</span>
                </button>
              ) : (
                <div className="p-4 rounded-lg border border-warning/20 bg-warning/10">
                  <p className="text-sm text-warning mb-3">This will invalidate the current API key. The user will need to update their configuration.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowRegenerateConfirm(false)} className="flex-1 btn-ghost" disabled={isRegenerating}>
                      Cancel
                    </button>
                    <button onClick={handleRegenerateKey} disabled={isRegenerating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-warning text-void font-medium transition-opacity disabled:opacity-50">
                      {isRegenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Confirm</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-border-dim">
            <button onClick={onClose} className="flex-1 btn-ghost">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!name.trim() || isSaving} className="flex-1 btn-primary disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
