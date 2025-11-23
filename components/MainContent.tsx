'use client';

import { Menu, PenLine, Search, ArrowLeft, Paperclip } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import { useState, useEffect } from 'react';

interface Email {
  id: string;
  snippet: string;
  internalDate: string;
  filename?: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      partId: string;
      mimeType: string;
      filename: string;
      body: {
        data?: string;
        attachmentId?: string;
        size: number;
      };
      parts?: any[];
    }>;
  };
  threadEmails?: Email[];
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

interface MainContentProps {
  children: React.ReactNode;
  activeView: 'email' | 'calendar';
  onSelectEmail: (email: { filename?: string; sender?: { name: string; title: string; organization: string }; aiAnalysis?: { summary: string; quickActions?: string[] }; tasks?: string[] } | null) => void;
}

export default function MainContent({ children, activeView, onSelectEmail }: MainContentProps) {
  const [activeGroup, setActiveGroup] = useState<string>('Important');
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailData, setEmailData] = useState<EmailData>({});
  const [emailAIAnalysis, setEmailAIAnalysis] = useState<EmailAIAnalysis>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedEmailFilename, setSelectedEmailFilename] = useState<string | null>(null);
  const [openedEmail, setOpenedEmail] = useState<Email | null>(null);
  const groups = ['Important', 'Critical', 'Urgent', 'IRB', 'Other'];

  // Helper function to decode base64 email body
  const decodeEmailBody = (email: Email): string => {
    if (email.payload.parts) {
      for (const part of email.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          try {
            return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          } catch (e) {
            console.error('Error decoding email body:', e);
          }
        }
      }
    }
    return email.snippet;
  };

  // Helper function to get attachments from email
  const getAttachments = (email: Email): Array<{ filename: string; mimeType: string; size: number }> => {
    const attachments: Array<{ filename: string; mimeType: string; size: number }> = [];
    if (email.payload.parts) {
      email.payload.parts.forEach(part => {
        if (part.filename && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size
          });
        }
      });
    }
    return attachments;
  };

  useEffect(() => {
    const loadEmails = async () => {
      setLoading(true);
      setOpenedEmail(null); // Reset opened email when changing groups
      try {
        // Load email data to get folder assignments
        const emailDataResponse = await fetch('/api/emails/email_data.json');
        const emailDataJson: EmailData = await emailDataResponse.json();
        setEmailData(emailDataJson);

        // Load AI analysis data
        const aiAnalysisResponse = await fetch('/api/emails/email_ai_analysis.json');
        const aiAnalysisJson: EmailAIAnalysis = await aiAnalysisResponse.json();
        setEmailAIAnalysis(aiAnalysisJson);

        // Load all emails and filter by active group
        const emailPromises = Object.keys(emailDataJson).map(async (filename) => {
          if (emailDataJson[filename].folder === activeGroup) {
            const response = await fetch(`/api/emails/${filename}`);
            const emailContent = await response.json();
            // Attach the filename to the email object so we can look up metadata later
            return { ...emailContent, filename };
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
        
        // Select the first email by default
        if (filteredEmails.length > 0) {
          const firstEmail = filteredEmails[0];
          if (firstEmail.filename && emailDataJson[firstEmail.filename]?.sender) {
            setSelectedEmailFilename(firstEmail.filename);
            onSelectEmail({
              filename: firstEmail.filename,
              sender: emailDataJson[firstEmail.filename].sender,
              aiAnalysis: aiAnalysisJson[firstEmail.filename],
              tasks: emailDataJson[firstEmail.filename].tasks
            });
          }
        }
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
    <div className="w-full md:w-[66%] lg:w-[69%] xl:w-[73%] bg-white flex flex-col">
      {/* Navigation Bar - Only show for email view and when not viewing an opened email */}
      {activeView === 'email' && !openedEmail && (
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
          openedEmail ? (
            // Email Detail View
            <div className="px-8 py-6">
              {/* Back Button */}
              <button
                onClick={() => setOpenedEmail(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back to {activeGroup}</span>
              </button>

              {/* Email Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                  {openedEmail.payload.headers.find(h => h.name === 'Subject')?.value || 'No Subject'}
                </h1>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {openedEmail.filename && emailData[openedEmail.filename]?.sender 
                          ? emailData[openedEmail.filename].sender!.name.charAt(0).toUpperCase()
                          : openedEmail.payload.headers.find(h => h.name === 'From')?.value.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {openedEmail.filename && emailData[openedEmail.filename]?.sender 
                            ? emailData[openedEmail.filename].sender!.name
                            : openedEmail.payload.headers.find(h => h.name === 'From')?.value}
                        </p>
                        <p className="text-sm text-gray-600">
                          To: {openedEmail.payload.headers.find(h => h.name === 'To')?.value}
                        </p>
                      </div>
                    </div>
                    {openedEmail.payload.headers.find(h => h.name === 'Cc')?.value && (
                      <p className="text-sm text-gray-600 ml-13">
                        Cc: {openedEmail.payload.headers.find(h => h.name === 'Cc')?.value}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(parseInt(openedEmail.internalDate)).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="mb-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {decodeEmailBody(openedEmail)}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {getAttachments(openedEmail).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({getAttachments(openedEmail).length})
                  </h3>
                  <div className="space-y-2">
                    {getAttachments(openedEmail).map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                            <p className="text-xs text-gray-500">
                              {attachment.mimeType} • {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thread Emails (if any) */}
              {openedEmail.threadEmails && openedEmail.threadEmails.length > 1 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Thread ({openedEmail.threadEmails.length} messages)
                  </h3>
                  <div className="space-y-6">
                    {openedEmail.threadEmails.slice(1).map((threadEmail, index) => (
                      <div key={threadEmail.id} className="border-l-2 border-gray-200 pl-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                              {threadEmail.payload.headers.find(h => h.name === 'From')?.value.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {threadEmail.payload.headers.find(h => h.name === 'From')?.value}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(parseInt(threadEmail.internalDate)).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                          {decodeEmailBody(threadEmail)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
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
                  
                  // Set a new timeout for 0.5 seconds
                  const timeout = setTimeout(() => {
                    if (email.filename && emailData[email.filename]?.sender) {
                      setSelectedEmailFilename(email.filename);
                      onSelectEmail({
                        filename: email.filename,
                        sender: emailData[email.filename].sender,
                        aiAnalysis: emailAIAnalysis[email.filename],
                        tasks: emailData[email.filename].tasks
                      });
                    }
                  }, 100);
                  
                  setHoverTimeout(timeout);
                };
                
                const handleMouseLeave = () => {
                  // Clear the timeout if the user leaves before 0.5 seconds
                  if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    setHoverTimeout(null);
                  }
                };

                const handleClick = () => {
                  if (email.filename && emailData[email.filename]?.sender) {
                    setSelectedEmailFilename(email.filename);
                    setOpenedEmail(email); // Open the email in detail view
                    onSelectEmail({
                      filename: email.filename,
                      sender: emailData[email.filename].sender,
                      aiAnalysis: emailAIAnalysis[email.filename],
                      tasks: emailData[email.filename].tasks
                    });
                  } else {
                    onSelectEmail(null);
                  }
                };
                
                return (
                  <div
                    key={email.id}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
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
