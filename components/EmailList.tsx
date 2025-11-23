'use client';

import { Menu, PenLine, Search } from 'lucide-react';
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
  onSelectEmail: (email: { filename?: string; sender?: { name: string; title: string; organization: string }; aiAnalysis?: { summary: string; quickActions?: string[] }; tasks?: string[] } | null) => void;
  onEmailHover: (email: { filename?: string; sender?: { name: string; title: string; organization: string }; aiAnalysis?: { summary: string; quickActions?: string[] }; tasks?: string[] } | null) => void;
  onSetSelectedFilename: (filename: string | null) => void;
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
  onSetSelectedFilename
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
      {emails.map((email) => {
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
          const timeout = setTimeout(() => {
            if (email.filename && emailData[email.filename]?.sender) {
              onEmailHover({
                filename: email.filename,
                sender: emailData[email.filename].sender,
                aiAnalysis: emailAIAnalysis[email.filename],
                tasks: emailData[email.filename].tasks
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
            key={email.id}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              if (email.filename && emailData[email.filename]?.sender) {
                onSetSelectedFilename(email.filename);
                onSelectEmail({
                  filename: email.filename,
                  sender: emailData[email.filename].sender,
                  aiAnalysis: emailAIAnalysis[email.filename],
                  tasks: emailData[email.filename].tasks
                });
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
    </>
  );
}
