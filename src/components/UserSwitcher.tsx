'use client';

import { useAppStore } from '@/store/useAppStore';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function UserSwitcher() {
  const { currentUser, users, setCurrentUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
      >
        <span className="text-sm">Switch User (Demo)</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Demo Users
            </p>
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  setCurrentUser(user);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  user.id === currentUser.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">
                  {user.role} • {user.department}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
