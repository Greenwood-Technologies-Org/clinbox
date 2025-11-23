'use client';

import { ArrowLeft, CircleCheck, Bell, Download, Paperclip } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import { extractAttachmentsFromThread, type Attachment } from '@/lib/email-utils';
import { useState, useEffect } from 'react';

interface ThreadEmail {
  id: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      mimeType: string;
      filename?: string;
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
  onAttachmentsChange?: (attachments: Attachment[]) => void;
}

export default function OpenedEmail({ subject, filename, onBack, onAttachmentsChange }: OpenedEmailProps) {
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
          
          // Extract and pass attachments to parent
          if (onAttachmentsChange) {
            const attachments = extractAttachmentsFromThread(emailData.threadEmails);
            onAttachmentsChange(attachments);
          }
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

  const getFileType = (filename: string, mimeType: string): string => {
    // Try to get extension from filename first
    const filenameParts = filename.split('.');
    if (filenameParts.length > 1) {
      return filenameParts[filenameParts.length - 1].toUpperCase();
    }
    
    // Fallback to mime type mapping
    const mimeTypeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/zip': 'ZIP',
      'image/png': 'PNG',
      'image/jpeg': 'JPG',
      'text/plain': 'TXT',
    };
    
    return mimeTypeMap[mimeType] || 'FILE';
  };

  const getEmailAttachments = (email: ThreadEmail) => {
    const attachments: Array<{ filename: string; mimeType: string }> = [];
    if (email.payload.parts) {
      email.payload.parts.forEach(part => {
        if (part.filename && part.filename !== '' && 
            part.mimeType !== 'text/plain' && 
            part.mimeType !== 'text/html') {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType
          });
        }
      });
    }
    return attachments;
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
        <h2 className="font-medium text-gray-900 truncate px-4">
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
            {threadEmails.map((email, index) => {
              const fromHeader = email.payload.headers.find(h => h.name === 'From');
              const toHeader = email.payload.headers.find(h => h.name === 'To');
              const fromEmail = fromHeader?.value || 'Unknown';
              const toEmail = toHeader?.value || 'Unknown';
              
              const snippet = email.snippet || '';
              const dateObj = new Date(parseInt(email.internalDate));
              const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              const isLastMessage = index === threadEmails.length - 1;
              const isExpanded = expandedEmailIds.has(email.id) || isLastMessage;
              
              // Get message body
              let messageBody = '';
              if (email.payload.parts) {
                const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                  messageBody = decodeBase64(textPart.body.data);
                }
              }
              
              return (
                <div key={email.id} className="group">
                  {isExpanded && (
                    <div className="mx-6 border-t border-gray-200" />
                  )}
                  
                  {!isExpanded ? (
                    <div
                      onClick={() => toggleEmail(email.id)}
                      className="px-6 py-2 cursor-pointer min-w-0 relative"
                    >
                      <div className="mx-6 border-t border-gray-200 opacity-0 group-hover:opacity-100 absolute top-0 left-0 right-0" />
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
                      <div className="mx-6 border-b border-gray-200 opacity-0 group-hover:opacity-100 absolute bottom-0 left-0 right-0" />
                    </div>
                  ) : (
                    <div
                      onClick={() => !isLastMessage && toggleEmail(email.id)}
                      className={`px-6 py-4 ${!isLastMessage ? 'cursor-pointer' : ''}`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Left: From to To */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{fromEmail}</span>
                          <span className="mx-1 font-medium">to</span>
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
                      
                      {/* Attachments */}
                      {(() => {
                        const attachments = getEmailAttachments(email);
                        if (attachments.length > 0) {
                          return (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Paperclip className="w-4 h-4" />
                                <h4 className="text-sm font-medium">Attachments</h4>
                              </div>
                              <div className="space-y-2">
                                {attachments.map((attachment, attachIndex) => (
                                  <div 
                                    key={attachIndex} 
                                    className="bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition-colors cursor-pointer"
                                  >
                                    {/* Filename */}
                                    <div className="text-sm text-gray-900 font-medium mb-2 truncate">
                                      {attachment.filename}
                                    </div>
                                    
                                    {/* File type tag and download icon */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                                        {getFileType(attachment.filename, attachment.mimeType)}
                                      </span>
                                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  {isExpanded && !isLastMessage && (
                    <div className="mx-6 border-b border-gray-200" />
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
