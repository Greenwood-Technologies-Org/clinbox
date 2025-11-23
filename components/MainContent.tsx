'use client';

import { Menu, PenLine, Search } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import { useState, useEffect } from 'react';

interface Email {
  id: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
  };
}

interface EmailData {
  [key: string]: {
    folder: string;
  };
}

interface MainContentProps {
  children: React.ReactNode;
  activeView: 'email' | 'calendar';
}

export default function MainContent({ children, activeView }: MainContentProps) {
  const [activeGroup, setActiveGroup] = useState<string>('Important');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const groups = ['Important', 'Critical', 'Urgent', 'IRB', 'Other'];

  useEffect(() => {
    const loadEmails = async () => {
      setLoading(true);
      try {
        // Load email data to get folder assignments
        const emailDataResponse = await fetch('/api/emails/email_data.json');
        const emailData: EmailData = await emailDataResponse.json();

        // Load all emails and filter by active group
        const emailPromises = Object.keys(emailData).map(async (filename) => {
          if (emailData[filename].folder === activeGroup) {
            const response = await fetch(`/api/emails/${filename}`);
            return response.json();
          }
          return null;
        });

        const allEmails = await Promise.all(emailPromises);
        const filteredEmails = allEmails.filter((email): email is Email => email !== null);
        
        // Sort by date (most recent first)
        filteredEmails.sort((a, b) => 
          parseInt(b.internalDate) - parseInt(a.internalDate)
        );
        
        setEmails(filteredEmails);
      } catch (error) {
        console.error('Error loading emails:', error);
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeView === 'email') {
      loadEmails();
    }
  }, [activeGroup, activeView]);

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Navigation Bar - Only show for email view */}
      {activeView === 'email' && (
        <div className="px-4 pt-4 pb-3 flex items-start justify-between shrink-0">
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
      <div className="flex-1 overflow-y-auto">
        {activeView === 'email' ? (
          loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No {activeGroup} Emails</p>
            </div>
          ) : (
            <div>
              {emails.map((email) => {
                const fromHeader = email.payload.headers.find(h => h.name === 'From');
                const subjectHeader = email.payload.headers.find(h => h.name === 'Subject');
                
                const from = fromHeader?.value || 'Unknown';
                const subject = subjectHeader?.value || 'No Subject';
                const dateObj = new Date(parseInt(email.internalDate));
                const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div
                    key={email.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 truncate">
                        {from.replace(/<.*>/, '').trim()}
                      </span>
                      <span className="text-gray-500 shrink-0 ml-4">
                        {date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-gray-400">Calendar</h1>
          </div>
        )}
      </div>
    </div>
  );
}
