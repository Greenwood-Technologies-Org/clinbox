'use client';

import { Mail, Calendar, ListTodo, Sparkle, TrendingUpDown, FileText, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-9 bg-white border-r border-gray-200 flex flex-col items-center">
      <div className="h-3" />
      <div className="flex flex-col gap-2">
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Mail className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Calendar className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ListTodo className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Sparkle className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex flex-col gap-2">
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <TrendingUpDown className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <FileText className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5 text-foreground" strokeWidth={1.25} />
        </button>
      </div>
      <div className="h-3" />
    </div>
  );
}
