'use client';

import { ArrowLeft, CircleCheck, Bell } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import { useState, useEffect } from 'react';

interface ThreadEmail {
  id: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
  };
}

interface OpenedEmailProps {
  subject: string;
  filename?: string;
  onBack: () => void;
}

export default function OpenedEmail({ subject, filename, onBack }: OpenedEmailProps) {
  const [threadEmails, setThreadEmails] = useState<ThreadEmail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadThreadEmails = async () => {
      if (!filename) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/emails/${filename}`);
        const emailData = await response.json();
        
        if (emailData.threadEmails) {
          setThreadEmails(emailData.threadEmails);
        }
      } catch (error) {
        console.error('Error loading thread emails:', error);
        setThreadEmails([]);
      } finally {
        setLoading(false);
      }
    };

    loadThreadEmails();
  }, [filename]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 flex items-center justify-between shrink-0">
        {/* Left: Back Arrow */}
        <button onClick={onBack}>
          <ArrowLeft {...getIconProps()} />
        </button>

        {/* Middle: Subject */}
        <h2 className="text-sm font-medium text-gray-900 truncate px-4">
          {subject}
        </h2>

        {/* Right: Icons */}
        <div className="flex items-center gap-3">
          <button>
            <CircleCheck {...getIconProps()} />
          </button>
          <button>
            <Bell {...getIconProps()} />
          </button>
        </div>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : threadEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages</p>
          </div>
        ) : (
          <div>
            {threadEmails.map((email) => {
              const fromHeader = email.payload.headers.find(h => h.name === 'From');
              const fromEmail = fromHeader?.value || 'Unknown';
              
              const snippet = email.snippet || '';
              const dateObj = new Date(parseInt(email.internalDate));
              const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              return (
                <div
                  key={email.id}
                  className="px-6 py-2 hover:bg-gray-100 cursor-pointer transition-colors min-w-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Sender Email - Fixed width */}
                    <div className="w-[20%] shrink-0">
                      <span className="text-sm font-medium text-gray-900 truncate block">
                        {fromEmail}
                      </span>
                    </div>
                    
                    {/* Message Preview - Flexible width */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        <span className="text-gray-500">{snippet}</span>
                      </div>
                    </div>
                    
                    {/* Date - Fixed width */}
                    <div className="w-16 shrink-0 text-right">
                      <span className="text-sm text-gray-600">
                        {date}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
