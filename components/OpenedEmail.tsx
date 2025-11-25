'use client';

import { ArrowLeft, ArrowUp, ArrowDown, CircleCheck, Bell, Download, Paperclip } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import { useState, useEffect } from 'react';

interface ThreadMessage {
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[];
  subject: string;
  timestamp: string;
  body: string;
  attachments: string[];
  message_id: number;
  in_reply_to: number | null;
}

interface Attachment {
  filename: string;
  mimeType: string;
}

interface OpenedEmailProps {
  subject: string;
  filename?: string;
  onBack: () => void;
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  canNavigateUp?: boolean;
  canNavigateDown?: boolean;
}

export default function OpenedEmail({ subject, filename, onBack, onAttachmentsChange, onNavigateUp, onNavigateDown, canNavigateUp = false, canNavigateDown = false }: OpenedEmailProps) {
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadThreadMessages = async () => {
      if (!filename) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/emails/${filename}`);
        const threadData = await response.json();
        
        if (Array.isArray(threadData)) {
          setThreadMessages(threadData);
          
          // Extract and pass attachments to parent
          if (onAttachmentsChange) {
            const allAttachments: Attachment[] = [];
            threadData.forEach((message: ThreadMessage) => {
              message.attachments.forEach((attachment: string) => {
                allAttachments.push({
                  filename: attachment,
                  mimeType: 'application/octet-stream' // Default mime type
                });
              });
            });
            onAttachmentsChange(allAttachments);
          }
        }
      } catch (error) {
        console.error('Error loading thread messages:', error);
        setThreadMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadThreadMessages();
  }, [filename]);

  const toggleMessage = (messageId: number) => {
    setExpandedMessageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
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

  const getMessageAttachments = (message: ThreadMessage) => {
    return message.attachments.map((attachment: string) => ({
      filename: attachment,
      mimeType: 'application/octet-stream' // Default mime type
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 flex items-center justify-between shrink-0">
        {/* Left: Back Arrow and Navigation */}
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft {...getIconProps()} />
          </button>
          <button 
            onClick={onNavigateUp}
            disabled={!canNavigateUp}
            className={!canNavigateUp ? 'opacity-30 cursor-not-allowed' : ''}
          >
            <ArrowUp {...getIconProps()} />
          </button>
          <button 
            onClick={onNavigateDown}
            disabled={!canNavigateDown}
            className={!canNavigateDown ? 'opacity-30 cursor-not-allowed' : ''}
          >
            <ArrowDown {...getIconProps()} />
          </button>
        </div>

        {/* Middle: Subject */}
        <h2 className="font-medium text-gray-900 truncate px-4">
          {subject}
        </h2>

        {/* Right: Icons */}
        <div className="flex items-center gap-3">
          <button>
            <Bell {...getIconProps()} />
          </button>
          <button>
            <CircleCheck {...getIconProps()} />
          </button>
        </div>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : threadMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages</p>
          </div>
        ) : (
          <div>
            {threadMessages.map((message, index) => {
              const fromEmail = message.from_address;
              const toEmails = message.to_addresses.join(', ');
              const ccEmails = message.cc_addresses.length > 0 ? `, ${message.cc_addresses.join(', ')}` : '';
              
              const snippet = message.body.substring(0, 100) + (message.body.length > 100 ? '...' : '');
              const dateObj = new Date(message.timestamp);
              const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              const isLastMessage = index === threadMessages.length - 1;
              const isExpanded = expandedMessageIds.has(message.message_id) || isLastMessage;
              
              return (
                <div key={`${message.message_id}-${index}`} className="group">
                  {isExpanded && (
                    <div className="mx-6 border-t border-gray-200" />
                  )}
                  
                  {!isExpanded ? (
                    <div
                      onClick={() => toggleMessage(message.message_id)}
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
                      onClick={() => !isLastMessage && toggleMessage(message.message_id)}
                      className={`px-6 py-4 ${!isLastMessage ? 'cursor-pointer' : ''}`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Left: From to To */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{fromEmail}</span>
                          <span className="mx-1 font-medium">to</span>
                          <span className="font-medium">{toEmails}{ccEmails}</span>
                        </div>
                        
                        {/* Right: Date */}
                        <div className="text-sm text-gray-600">
                          {date}
                        </div>
                      </div>
                      
                      {/* Message Content */}
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {message.body}
                      </div>
                      
                      {/* Attachments */}
                      {(() => {
                        const attachments = getMessageAttachments(message);
                        if (attachments.length > 0) {
                          return (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Paperclip className="w-4 h-4" />
                                <h4 className="text-sm font-medium">Attachments</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {attachments.map((attachment, attachIndex) => (
                                  <div 
                                    key={attachIndex} 
                                    className="bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition-colors w-64"
                                    onClick={(e) => e.stopPropagation()}
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
                                      <button 
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Download functionality can be added here later
                                        }}
                                      >
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
