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
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
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
  const [expandedEmailIds, setExpandedEmailIds] = useState<Set<string>>(new Set());

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

  const toggleEmail = (emailId: string) => {
    setExpandedEmailIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const decodeBase64 = (data: string): string => {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
      return '';
    }
  };

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
              const toHeader = email.payload.headers.find(h => h.name === 'To');
              const fromEmail = fromHeader?.value || 'Unknown';
              const toEmail = toHeader?.value || 'Unknown';
              
              const snippet = email.snippet || '';
              const dateObj = new Date(parseInt(email.internalDate));
              const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              const isExpanded = expandedEmailIds.has(email.id);
              
              // Get message body
              let messageBody = '';
              if (email.payload.parts) {
                const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                  messageBody = decodeBase64(textPart.body.data);
                }
              }
              
              return (
                <div key={email.id}>
                  {isExpanded && (
                    <div className="border-t border-gray-200" />
                  )}
                  
                  {!isExpanded ? (
                    <div
                      onClick={() => toggleEmail(email.id)}
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
                  ) : (
                    <div
                      onClick={() => toggleEmail(email.id)}
                      className="px-6 py-4 bg-gray-50 cursor-pointer"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Left: From to To */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{fromEmail}</span>
                          <span className="mx-2">to</span>
                          <span className="font-medium">{toEmail}</span>
                        </div>
                        
                        {/* Right: Date */}
                        <div className="text-sm text-gray-600">
                          {date}
                        </div>
                      </div>
                      
                      {/* Message Content */}
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {messageBody || snippet}
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="border-b border-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
