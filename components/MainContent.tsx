'use client';

import { Menu, PenLine, Search } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import { useState } from 'react';

interface MainContentProps {
  children: React.ReactNode;
  activeView: 'email' | 'calendar';
}

export default function MainContent({ children, activeView }: MainContentProps) {
  const [activeGroup, setActiveGroup] = useState<string>('Important');
  const groups = ['Important', 'Critical', 'Urgent', 'IRB'];

  return (
    <div className="flex-[0.7] bg-white flex flex-col">
      {/* Navigation Bar - Only show for email view */}
      {activeView === 'email' && (
        <div className="px-4 pt-3 pb-3 flex items-start justify-between shrink-0">
          {/* Left: Hamburger Icon */}
          <button>
            <Menu {...getIconProps()} />
          </button>

          {/* Middle: Email Groups */}
          <div className="flex items-center gap-6">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`text-sm transition-colors ${
                  activeGroup === group
                    ? 'text-black font-medium'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Right: Pen and Search Icons */}
          <div className="flex items-center gap-3">
            <button>
              <PenLine {...getIconProps()} />
            </button>
            <button>
              <Search {...getIconProps()} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <h1 className="text-muted">{activeView === 'email' ? 'Email' : 'Calendar'}</h1>
      </div>
    </div>
  );
}
