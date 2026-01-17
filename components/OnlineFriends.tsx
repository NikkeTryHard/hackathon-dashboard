"use client";

import { memo } from "react";
import { Users } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface OnlineFriendsProps {
  friends: Friend[];
}

function OnlineFriendsComponent({ friends }: OnlineFriendsProps) {
  const onlineCount = friends.filter((f) => f.isOnline).length;

  return (
    <div className="surface-elevated p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10">
            <Users className="w-4 h-4 text-gold" />
          </div>
          <span className="text-sm font-medium text-text-primary">Crew Status</span>
        </div>
        <span className="badge">
          {onlineCount}/{friends.length} online
        </span>
      </div>

      <div className="space-y-2">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-0 border border-border-dim hover:border-border transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-sm font-medium text-text-secondary border border-border">{friend.name[0]}</div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-1 ${friend.isOnline ? "bg-success" : "bg-text-ghost"}`} />
              </div>
              <span className="text-sm font-medium text-text-primary">{friend.name}</span>
            </div>
            <span className="text-xs text-text-ghost">{friend.isOnline ? <span className="text-success font-medium">active</span> : friend.lastSeen || "offline"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const OnlineFriends = memo(OnlineFriendsComponent);
