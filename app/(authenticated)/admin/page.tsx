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
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "sk-hackathon-";
    result += newUserName.toLowerCase() + "-";
    for (let i = 0; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-neon-purple" />
          <h1 className="text-2xl font-bold">
            <span className="text-gray-500">~/</span>
            <span className="neon-green">admin</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Manage API keys for your hackathon crew.</p>
      </motion.div>

      {/* Add user section */}
      <div className="card p-4 border border-neon-purple/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Key className="w-4 h-4 text-neon-purple" />
            API Keys
          </h3>
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm hover:bg-neon-green/20 transition-colors">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>

        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 p-4 bg-dark-bg rounded-lg">
            <label className="block text-sm text-gray-400 mb-2">Friend&apos;s name</label>
            <div className="flex gap-2">
              <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Dave" className="flex-1 bg-dark-card border border-dark-border rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-neon-green transition-colors" autoFocus />
              <button onClick={handleCreateUser} disabled={!newUserName.trim()} className="px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green text-sm hover:bg-neon-green/30 transition-colors disabled:opacity-50">
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewUserName("");
                }}
                className="px-4 py-2 rounded-lg bg-dark-card text-gray-400 text-sm hover:bg-dark-border transition-colors"
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
      <div className="card p-4 border border-dark-border">
        <h3 className="font-bold mb-2 text-sm">How it works</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>* Create a key for each friend</li>
          <li>* Share the key with them (securely!)</li>
          <li>* They use it to login here and configure Claude Code</li>
          <li>* Usage is tracked per key in your backend</li>
        </ul>
      </div>
    </div>
  );
}
