'use client';

import { Mail, Calendar, ListTodo, Sparkle, TrendingUpDown, FileText, Settings, HelpCircle } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface SidebarProps {
  activeView: 'email' | 'calendar';
  setActiveView: (view: 'email' | 'calendar') => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <div className="w-9 shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setActiveView('email')}
          className="hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Mail {...getIconProps(activeView === 'email')} />
        </button>
        <button 
          onClick={() => setActiveView('calendar')}
          className="hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Calendar {...getIconProps(activeView === 'calendar')} />
        </button>
        <button className="hover:bg-gray-50 rounded-lg transition-colors">
          <ListTodo {...getIconProps()} />
        </button>
        <button className="hover:bg-gray-50 rounded-lg transition-colors">
          <Sparkle {...getIconProps()} />
        </button>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex flex-col gap-2">
        <button className="hover:bg-gray-50 rounded-lg transition-colors">
          <TrendingUpDown {...getIconProps()} />
        </button>
        <button className="hover:bg-gray-50 rounded-lg transition-colors">
          <FileText {...getIconProps()} />
        </button>
        <button className="hover:bg-gray-50 rounded-lg transition-colors">
          <Settings {...getIconProps()} />
        </button>
        <button className="hover:bg-gray-50 rounded-lg transition-colors">
          <HelpCircle {...getIconProps()} />
        </button>
      </div>
    </div>
  );
}
