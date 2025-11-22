'use client';

import { Mail } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <button className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <Mail className="w-6 h-6 text-foreground" />
      </button>
    </div>
  );
}
