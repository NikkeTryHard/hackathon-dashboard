"use client";

import { motion } from "framer-motion";
import { Users, Circle } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface OnlineFriendsProps {
  friends: Friend[];
}

export function OnlineFriends({ friends }: OnlineFriendsProps) {
  const onlineCount = friends.filter((f) => f.isOnline).length;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-cyan" />
          <span className="font-mono text-sm">crew.status</span>
        </div>
        <span className="text-xs text-gray-500">
          {onlineCount}/{friends.length} online
        </span>
      </div>

      <div className="space-y-3">
        {friends.map((friend, i) => (
          <motion.div key={friend.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-sm">{friend.name[0]}</div>
                <Circle className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${friend.isOnline ? "fill-neon-green text-neon-green" : "fill-gray-600 text-gray-600"}`} />
              </div>
              <span className="text-sm">{friend.name}</span>
            </div>
            <span className="text-xs text-gray-500">{friend.isOnline ? <span className="text-neon-green">active</span> : friend.lastSeen || "offline"}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
