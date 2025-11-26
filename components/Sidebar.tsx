'use client';

import { Mail, Calendar, TrendingUpDown, Workflow, FileText, Settings, HelpCircle } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface SidebarProps {
  activeView: 'email' | 'calendar' | 'docs' | 'workflows' | 'workflowsettings';
  setActiveView: (view: 'email' | 'calendar' | 'docs' | 'workflows' | 'workflowsettings') => void;
  onTutorialClick?: () => void;
}

export default function Sidebar({ activeView, setActiveView, onTutorialClick }: SidebarProps) {
  return (
    <div className="w-9 shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <div className="flex flex-col gap-3">
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
      </div>
      
      <div className="flex-1" />
      
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => setActiveView('workflowsettings')}
          className="hover:bg-gray-50 rounded-lg transition-colors"
          data-tutorial="workflows-button"
        >
          <TrendingUpDown {...getIconProps(activeView === 'workflowsettings')} />
        </button>
        <button 
          onClick={() => setActiveView('docs')}
          className="hover:bg-gray-50 rounded-lg transition-colors"
          data-tutorial="documents-button"
        >
          <FileText {...getIconProps(activeView === 'docs')} />
        </button>
        <button className="hover:bg-gray-50 rounded-lg transition-colors">
          <Settings {...getIconProps()} />
        </button>
        <button 
          onClick={onTutorialClick}
          className="hover:bg-gray-50 rounded-lg transition-colors"
        >
          <HelpCircle {...getIconProps()} />
        </button>
      </div>
    </div>
  );
}
