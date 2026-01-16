"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { UserKeyCard } from "@/components/UserKeyCard";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// Mock data - replace with your backend API
const MOCK_USERS = [
  {
    id: "1",
    name: "Louis",
    apiKey: "sk-hackathon-louis-abc123def456",
    requests: 387,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    name: "Alice",
    apiKey: "sk-hackathon-alice-xyz789ghi012",
    requests: 423,
    createdAt: "2 days ago",
  },
  {
    id: "3",
    name: "Bob",
    apiKey: "sk-hackathon-bob-jkl345mno678",
    requests: 153,
    createdAt: "1 day ago",
  },
  {
    id: "4",
    name: "Charlie",
    apiKey: "sk-hackathon-charlie-pqr901stu234",
    requests: 284,
    createdAt: "1 day ago",
  },
];

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState(MOCK_USERS);
  const [newUserName, setNewUserName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (!isLoading && user && !user.isAdmin) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.isAdmin) return null;

  const generateKey = () => {
    const safeName = newUserName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    return `sk-hackathon-${safeName}-${randomPart}`;
  };

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;

    const newUser = {
      id: Date.now().toString(),
      name: newUserName,
      apiKey: generateKey(),
      requests: 0,
      createdAt: "just now",
    };

    setUsers([...users, newUser]);
    setNewUserName("");
    setIsCreating(false);

    // TODO: Call your backend API to persist
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure? This will revoke their access.")) {
      setUsers(users.filter((u) => u.id !== id));
      // TODO: Call your backend API to delete
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

      {/* Add user section */}
      <div className="surface-elevated p-5 border-info/20">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold flex items-center gap-2 text-text-primary">
            <Key className="w-4 h-4 text-info" />
            API Keys
          </h3>
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>

        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className="mb-5 p-4 bg-surface-0 rounded-lg border border-border-dim">
            <label className="block text-sm text-text-tertiary mb-2">Friend&apos;s name</label>
            <div className="flex gap-3">
              <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Dave" className="input flex-1" autoFocus />
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

        <div className="space-y-3">
          {users.map((u) => (
            <UserKeyCard key={u.id} user={u} onDelete={u.id !== user.id ? handleDeleteUser : undefined} />
          ))}
        </div>
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
            <span>Usage is tracked per key in your backend</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
