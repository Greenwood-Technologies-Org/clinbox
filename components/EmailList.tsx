'use client';

import { Menu, PenLine, Search, Paperclip } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface Thread {
  filename: string;
  messages: Array<{
    from_address: string;
    to_addresses: string[];
    cc_addresses: string[];
    subject: string;
    timestamp: string;
    body: string;
    attachments: string[];
    message_id: number;
    in_reply_to: number | null;
  }>;
}

interface ThreadData {
  folder: string;
  senders: Array<{
    name: string;
    title: string;
    organization: string;
  }>;
  tasks: string[];
  hasAttachments: boolean;
}

interface ThreadAIAnalysis {
  summary: string;
  quickActions: any[];
  workflow: {
    workflowId: string;
    status: string;
    steps: Array<{
      name: string;
      result: string;
      reasoning: string;
    }>;
  };
}

interface EmailListProps {
  threads: Thread[];
  threadData: ThreadData[];
  threadAIAnalysis: ThreadAIAnalysis[];
  selectedThreadFilename: string | null;
  loading: boolean;
  activeGroup: string;
  onActiveGroupChange: (group: string) => void;
  onSelectEmail: (email: { filename?: string; sender?: { name: string; title: string; organization: string; email?: string }; aiAnalysis?: { summary: string; quickActions?: Array<string | { action: string; emails?: Array<{ to: string; subject: string; body: string; references: string[] }> }> }; tasks?: string[]; hasAttachments?: boolean; attachments?: Array<{ filename: string; mimeType: string }> } | null) => void;
  onThreadHover: (thread: { filename?: string; sender?: { name: string; title: string; organization: string; email?: string }; aiAnalysis?: { summary: string; quickActions?: Array<string | { action: string; emails?: Array<{ to: string; subject: string; body: string; references: string[] }> }> }; tasks?: string[]; hasAttachments?: boolean; attachments?: Array<{ filename: string; mimeType: string }> } | null) => void;
  onSetSelectedFilename: (filename: string | null) => void;
  onOpenThread: (subject: string) => void;
  loadThreadAttachments: (filename: string) => Promise<Array<{ filename: string; mimeType: string }>>;
}

export default function EmailList({ 
  threads, 
  threadData, 
  threadAIAnalysis, 
  selectedThreadFilename,
  loading,
  activeGroup,
  onActiveGroupChange,
  onSelectEmail,
  onThreadHover,
  onSetSelectedFilename,
  onOpenThread,
  loadThreadAttachments
}: EmailListProps) {
  let hoverTimeout: NodeJS.Timeout | null = null;
  const groups = ['Critical', 'Urgent', 'Important', 'IRB', 'Other'];

  // Helper function to extract index from filename (e.g., "thread_000.json" -> 0)
  const getThreadIndex = (filename: string): number => {
    const match = filename.match(/thread_(\d+)\.json/);
    return match ? parseInt(match[1], 10) : -1;
  };

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
        ) : threads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No {activeGroup} Threads</p>
          </div>
        ) : (
          <div>
      {threads.map((thread, index) => {
        // Use sender metadata if available, otherwise fall back to parsing from first message
        let senderName = 'Unknown';
        const threadIndex = thread.filename ? getThreadIndex(thread.filename) : -1;
        if (thread.filename && threadIndex >= 0 && threadData[threadIndex]?.senders) {
          senderName = threadData[threadIndex].senders[0]?.name || 'Unknown';
        } else if (thread.messages.length > 0) {
          senderName = thread.messages[0].from_address;
        }
        
        const subject = thread.messages[0]?.subject || 'No Subject';
        const snippet = thread.messages[0]?.body?.substring(0, 100) || '';
        const dateObj = new Date(thread.messages[0]?.timestamp || '');
        const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const handleMouseEnter = () => {
          // Clear any existing timeout
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
          }
          
          // Set a new timeout for 0.1 seconds
          const timeout = setTimeout(async () => {
            const threadIndex = thread.filename ? getThreadIndex(thread.filename) : -1;
            if (thread.filename && threadIndex >= 0 && threadData[threadIndex]?.senders) {
              const attachments = await loadThreadAttachments(thread.filename);
              onThreadHover({
                filename: thread.filename,
                sender: {
                  name: threadData[threadIndex].senders[0]?.name || 'Unknown',
                  title: threadData[threadIndex].senders[0]?.title || '',
                  organization: threadData[threadIndex].senders[0]?.organization || '',
                  email: thread.messages[0]?.from_address
                },
                aiAnalysis: threadAIAnalysis[threadIndex],
                tasks: threadData[threadIndex].tasks,
                hasAttachments: threadData[threadIndex].hasAttachments,
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
            key={thread.filename || `thread-${index}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={async () => {
              const threadIndex = thread.filename ? getThreadIndex(thread.filename) : -1;
              if (thread.filename && threadIndex >= 0 && threadData[threadIndex]?.senders) {
                const attachments = await loadThreadAttachments(thread.filename);
                
                onSetSelectedFilename(thread.filename);
                onSelectEmail({
                  filename: thread.filename,
                  sender: {
                    name: threadData[threadIndex].senders[0]?.name || 'Unknown',
                    title: threadData[threadIndex].senders[0]?.title || '',
                    organization: threadData[threadIndex].senders[0]?.organization || '',
                    email: thread.messages[0]?.from_address
                  },
                  aiAnalysis: threadAIAnalysis[threadIndex],
                  tasks: threadData[threadIndex].tasks,
                  hasAttachments: threadData[threadIndex].hasAttachments,
                  attachments: attachments
                });
                onOpenThread(subject);
              } else {
                onSelectEmail(null);
              }
            }}
            className={`px-6 py-2 hover:bg-gray-100 cursor-pointer transition-colors min-w-0 ${
              thread.filename === selectedThreadFilename ? 'bg-gray-100' : ''
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
                {thread.filename && threadIndex >= 0 && threadData[threadIndex]?.hasAttachments && (
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
