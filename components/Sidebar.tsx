'use client';

import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'inbox', label: 'Inbox', count: 842 },
  { id: 'starred', label: 'Starred', count: null },
  { id: 'drafts', label: 'Drafts', count: null },
  { id: 'sent', label: 'Sent', count: null },
  { id: 'done', label: 'Done', count: null },
  { id: 'archived', label: 'Auto Archived', count: null },
  { id: 'scheduled', label: 'Scheduled', count: null },
  { id: 'reminders', label: 'Reminders', count: null },
  { id: 'snippets', label: 'Snippets', count: null },
  { id: 'spam', label: 'Spam', count: null },
  { id: 'trash', label: 'Trash', count: null },
];

const autoLabels = [
  { id: 'interviews', label: 'Interviews' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'news', label: 'News' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'social', label: 'Social' },
];

export default function Sidebar({ isOpen, onClose, currentSection, onSectionChange }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full overflow-y-auto">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                R
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  roshan.kern@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <nav className="p-2">
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-md
                    text-sm font-medium transition-colors
                    ${currentSection === section.id
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <span>{section.label}</span>
                  {section.count !== null && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {section.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Auto Labels */}
            <div className="mt-6">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>Auto Labels</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="space-y-1 mt-1">
                {autoLabels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => {
                      onSectionChange(label.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`
                      w-full flex items-center px-6 py-2 rounded-md
                      text-sm transition-colors
                      ${currentSection === label.id
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {label.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
