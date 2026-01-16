"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Shield, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { UserKeyCard } from "@/components/UserKeyCard";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  apiKey: string;
  requests: number;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [newUserName, setNewUserName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get raw API key from localStorage
  const getRawApiKey = () => {
    const rawKey = localStorage.getItem("hackathon-raw-key");
    if (rawKey) return rawKey;

    const stored = localStorage.getItem("hackathon-user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.apiKey || "";
    }
    return "";
  };

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const apiKey = getRawApiKey();
      const res = await fetch("/api/users", {
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user && !user.isAdmin) {
      router.push("/");
      return;
    }
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user, authLoading, router, fetchUsers]);

  if (authLoading || !user || !user.isAdmin) return null;

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;

    try {
      setError(null);
      const apiKey = getRawApiKey();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ name: newUserName }),
      });

      if (!res.ok) {
        throw new Error("Failed to create user");
      }

      const newUser = await res.json();
      setUsers([newUser, ...users]);
      setNewUserName("");
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure? This will revoke their access.")) return;

    try {
      setError(null);
      const apiKey = getRawApiKey();
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10 border border-info/20">
            <Shield className="w-5 h-5 text-info" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-text-ghost">~/</span>
            <span className="text-gold">admin</span>
          </h1>
        </div>
        <p className="text-sm text-text-tertiary">Manage API keys for your hackathon crew.</p>
      </motion.div>

      {error && <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">{error}</div>}

      {/* Add user section */}
      <div className="surface-elevated p-5 border-info/20">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold flex items-center gap-2 text-text-primary">
            <Key className="w-4 h-4 text-info" />
            API Keys
          </h3>
          <div className="flex gap-2">
            <button onClick={fetchUsers} className="btn-ghost text-sm" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            )}
          </div>
        </div>

        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className="mb-5 p-4 bg-surface-0 rounded-lg border border-border-dim">
            <label className="block text-sm text-text-tertiary mb-2">Friend&apos;s name</label>
            <div className="flex gap-3">
              <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Dave" className="input-field flex-1" autoFocus />
              <button onClick={handleCreateUser} disabled={!newUserName.trim()} className="btn-primary disabled:opacity-50">
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewUserName("");
                }}
                className="px-4 py-2 rounded-lg bg-surface-1 border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <UserKeyCard key={u.id} user={u} onDelete={u.id !== user.id ? () => handleDeleteUser(u.id) : undefined} />
            ))}
            {users.length === 0 && <div className="text-center py-8 text-text-tertiary">No users yet. Click &quot;Add User&quot; to create one.</div>}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="surface-elevated p-5">
        <h3 className="font-semibold mb-3 text-text-primary">How it works</h3>
        <ul className="text-sm text-text-tertiary space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-gold">1.</span>
            <span>Create a key for each friend</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold">2.</span>
            <span>Share the key with them (securely!)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold">3.</span>
            <span>They use it to login here and configure Claude Code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold">4.</span>
            <span>Usage is tracked per key automatically</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
