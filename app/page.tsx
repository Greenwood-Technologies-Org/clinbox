'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import EmailPreview from '@/components/EmailPreview';
import SenderPanel from '@/components/SenderPanel';
import EmailThread from '@/components/EmailThread';
import { ParsedEmail } from '@/types/email';
import { loadEmails } from '@/lib/email-utils';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('inbox');
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openEmailId, setOpenEmailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load emails on mount
  useEffect(() => {
    loadEmails().then(loadedEmails => {
      setEmails(loadedEmails);
      setLoading(false);
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events if an email is open
      if (openEmailId) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, emails.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (emails[selectedIndex]) {
          setOpenEmailId(emails[selectedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emails, selectedIndex, openEmailId]);

  const selectedEmail = emails[selectedIndex] || null;
  const openEmail = emails.find(e => e.id === openEmailId) || null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Categories */}
              <nav className="hidden md:flex items-center space-x-1">
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm font-medium">
                  Important <span className="ml-1 text-gray-500 dark:text-gray-400">842</span>
                </button>
                <button className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm font-medium">
                  Calendar <span className="ml-1 text-gray-500 dark:text-gray-500">706</span>
                </button>
                <button className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm font-medium">
                  News
                </button>
                <button className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm font-medium">
                  Other
                </button>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Email List and Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {openEmail ? (
            <>
              {/* Email Thread View */}
              <EmailThread
                email={openEmail}
                onClose={() => setOpenEmailId(null)}
              />
              {/* Sender Panel */}
              <SenderPanel email={openEmail} />
            </>
          ) : (
            <>
              {/* Email List */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                {emails.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No emails found
                  </div>
                ) : (
                  emails.map((email, index) => (
                    <EmailPreview
                      key={email.id}
                      email={email}
                      isSelected={index === selectedIndex}
                      isOpen={email.id === openEmailId}
                      onClick={() => setOpenEmailId(email.id)}
                      onHover={() => setSelectedIndex(index)}
                    />
                  ))
                )}
              </div>

              {/* Sender Panel */}
              <SenderPanel email={selectedEmail} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
