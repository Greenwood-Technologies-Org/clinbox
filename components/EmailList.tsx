'use client';

import { Menu, PenLine, Search, Paperclip } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface Email {
  id: string;
  snippet: string;
  internalDate: string;
  filename?: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
  };
}

interface EmailData {
  [key: string]: {
    folder: string;
    sender?: {
      name: string;
      title: string;
      organization: string;
    };
    tasks?: string[];
    hasAttachments?: boolean;
  };
}

interface EmailAIAnalysis {
  [key: string]: {
    summary: string;
    quickActions?: string[];
  };
}

interface EmailListProps {
  emails: Email[];
  emailData: EmailData;
  emailAIAnalysis: EmailAIAnalysis;
  selectedEmailFilename: string | null;
  loading: boolean;
  activeGroup: string;
  onActiveGroupChange: (group: string) => void;
  onSelectEmail: (email: { filename?: string; sender?: { name: string; title: string; organization: string; email?: string }; aiAnalysis?: { summary: string; quickActions?: string[] }; tasks?: string[]; hasAttachments?: boolean; attachments?: Array<{ filename: string; mimeType: string }> } | null) => void;
  onEmailHover: (email: { filename?: string; sender?: { name: string; title: string; organization: string; email?: string }; aiAnalysis?: { summary: string; quickActions?: string[] }; tasks?: string[]; hasAttachments?: boolean; attachments?: Array<{ filename: string; mimeType: string }> } | null) => void;
  onSetSelectedFilename: (filename: string | null) => void;
  onOpenEmail: (subject: string) => void;
  loadThreadAttachments: (filename: string) => Promise<Array<{ filename: string; mimeType: string }>>;
}

export default function EmailList({ 
  emails, 
  emailData, 
  emailAIAnalysis, 
  selectedEmailFilename,
  loading,
  activeGroup,
  onActiveGroupChange,
  onSelectEmail,
  onEmailHover,
  onSetSelectedFilename,
  onOpenEmail,
  loadThreadAttachments
}: EmailListProps) {
  let hoverTimeout: NodeJS.Timeout | null = null;
  const groups = ['Important', 'Critical', 'Urgent', 'IRB', 'Other'];

  return (
    <>
      {/* Navigation Bar */}
      <div className="px-4 pt-4 pb-6 flex items-start justify-between shrink-0">
        {/* Left: Hamburger Icon */}
        <button>
          <Menu {...getIconProps()} />
        </button>

        {/* Middle: Email Groups */}
        <div className="flex items-center gap-6">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => onActiveGroupChange(group)}
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

      {/* Email List Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No {activeGroup} Emails</p>
          </div>
        ) : (
          <div>
      {emails.map((email, index) => {
        const subjectHeader = email.payload.headers.find(h => h.name === 'Subject');
        
        // Use sender metadata if available, otherwise fall back to parsing From header
        let senderName = 'Unknown';
        if (email.filename && emailData[email.filename]?.sender) {
          senderName = emailData[email.filename].sender!.name;
        } else {
          const fromHeader = email.payload.headers.find(h => h.name === 'From');
          const fromValue = fromHeader?.value || 'Unknown';
          const nameMatch = fromValue.match(/^([^<]+)/);
          senderName = nameMatch ? nameMatch[1].trim() : fromValue;
        }
        
        const subject = subjectHeader?.value || 'No Subject';
        const snippet = email.snippet || '';
        const dateObj = new Date(parseInt(email.internalDate));
        const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const handleMouseEnter = () => {
          // Clear any existing timeout
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
          }
          
          // Set a new timeout for 0.1 seconds
          const timeout = setTimeout(async () => {
            if (email.filename && emailData[email.filename]?.sender) {
              // Extract sender email from thread
              const response = await fetch(`/api/emails/${email.filename}`);
              const emailThreadData = await response.json();
              const { extractSenderEmailFromThread } = await import('@/lib/email-utils');
              const senderEmail = emailThreadData.threadEmails ? extractSenderEmailFromThread(emailThreadData.threadEmails) : undefined;
              
              const attachments = await loadThreadAttachments(email.filename);
              onEmailHover({
                filename: email.filename,
                sender: {
                  ...emailData[email.filename].sender!,
                  email: senderEmail
                },
                aiAnalysis: emailAIAnalysis[email.filename],
                tasks: emailData[email.filename].tasks,
                hasAttachments: emailData[email.filename].hasAttachments,
                attachments: attachments
              });
            }
          }, 100);
          
          hoverTimeout = timeout;
        };
        
        const handleMouseLeave = () => {
          // Clear the timeout if the user leaves before 0.1 seconds
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
          }
        };
        
        return (
          <div
            key={email.filename || email.id || `email-${index}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={async () => {
              if (email.filename && emailData[email.filename]?.sender) {
                const subjectHeader = email.payload.headers.find(h => h.name === 'Subject');
                const subject = subjectHeader?.value || 'No Subject';
                
                // Extract sender email from thread
                const response = await fetch(`/api/emails/${email.filename}`);
                const emailThreadData = await response.json();
                const { extractSenderEmailFromThread } = await import('@/lib/email-utils');
                const senderEmail = emailThreadData.threadEmails ? extractSenderEmailFromThread(emailThreadData.threadEmails) : undefined;
                
                const attachments = await loadThreadAttachments(email.filename);
                
                onSetSelectedFilename(email.filename);
                onSelectEmail({
                  filename: email.filename,
                  sender: {
                    ...emailData[email.filename].sender!,
                    email: senderEmail
                  },
                  aiAnalysis: emailAIAnalysis[email.filename],
                  tasks: emailData[email.filename].tasks,
                  hasAttachments: emailData[email.filename].hasAttachments,
                  attachments: attachments
                });
                onOpenEmail(subject);
              } else {
                onSelectEmail(null);
              }
            }}
            className={`px-6 py-2 hover:bg-gray-100 cursor-pointer transition-colors min-w-0 ${
              email.filename === selectedEmailFilename ? 'bg-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Sender Name - Fixed 20% width */}
              <div className="w-[13%] shrink-0">
                <span className="text-sm font-medium text-gray-900 truncate block">
                  {senderName}
                </span>
              </div>
              
              {/* Subject and Preview - Flexible width */}
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">
                  <span className="text-gray-900 font-medium">{subject}</span>
                  <span className="text-gray-500">  |  {snippet}</span>
                </div>
              </div>
              
              {/* Attachment icon and Date - Fixed width */}
              <div className="flex items-center gap-2 shrink-0 justify-end">
                {email.filename && emailData[email.filename]?.hasAttachments && (
                  <Paperclip className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-600 w-16 text-right">
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
    </>
  );
}
