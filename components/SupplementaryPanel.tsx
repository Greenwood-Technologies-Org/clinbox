'use client';

import { Sparkle, CircleCheck, CircleX, CirclePlus, ListTodo, Mail, X, Paperclip, Download, Copy } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import type { Attachment } from '@/lib/email-utils';
import { useState, useEffect } from 'react';
import ChatPanel from './ChatPanel';

interface SelectedEmail {
  filename?: string;
  sender?: {
    name: string;
    title: string;
    organization: string;
    email?: string;
  };
  aiAnalysis?: {
    summary: string;
    quickActions?: string[];
  };
  tasks?: string[];
  attachments?: Attachment[];
}

interface SupplementaryPanelProps {
  children?: React.ReactNode;
  selectedEmail: SelectedEmail | null;
  selectedDocument?: {
    id: string;
    name: string;
    description: string;
    modified: string;
    version: string;
    type: string;
  } | null;
  selectedWorkflow?: {
    id: string;
    name: string;
    description: string;
    modified: string;
    requiresApproval: string;
    integrations: string[];
  } | null;
  selectedWorkflowEvent?: {
    id: string;
    workflowId: string;
    workflowName: string;
    eventDescription: string;
    date: string;
    status: string;
  } | null;
  activeView?: 'email' | 'calendar' | 'docs' | 'workflows' | 'workflowsettings';
  showAllTasks?: boolean;
  onToggleAllTasks?: () => void;
  showChat?: boolean;
  onToggleChat?: () => void;
}

interface EmailData {
  [key: string]: {
    folder: string;
    sender?: {
      name: string;
      title: string;
      organization: string;
      email?: string;
    };
    tasks?: string[];
  };
}

export default function SupplementaryPanel({ 
  children, 
  selectedEmail, 
  selectedDocument,
  selectedWorkflow,
  selectedWorkflowEvent,
  activeView,
  showAllTasks = false,
  onToggleAllTasks,
  showChat = false,
  onToggleChat
}: SupplementaryPanelProps) {
  const [allTasks, setAllTasks] = useState<string[]>([]);

  useEffect(() => {
    const loadAllTasks = async () => {
      try {
        const response = await fetch('/api/emails/email_data.json');
        const emailData: EmailData = await response.json();
        
        // Collect all tasks from all emails
        const tasks: string[] = [];
        Object.values(emailData).forEach((email) => {
          if (email.tasks && email.tasks.length > 0) {
            tasks.push(...email.tasks);
          }
        });
        
        setAllTasks(tasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    if (showAllTasks) {
      loadAllTasks();
    }
  }, [showAllTasks]);

  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
  };

  const getFileType = (attachment: Attachment): string => {
    // Try to get extension from filename first
    const filenameParts = attachment.filename.split('.');
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
    
    return mimeTypeMap[attachment.mimeType] || 'FILE';
  };

  // Determine what content to show
  const renderContent = () => {
    if (showChat) {
      return (
        <div className="flex flex-col h-full">
          {/* Chat Panel Header */}
          <div className="py-3 px-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-medium text-gray-900">
                Chat
              </h1>
              <button onClick={onToggleChat}>
                <X {...getIconProps()} />
              </button>
            </div>
          </div>
          {/* Chat Panel Content */}
          <ChatPanel onClose={onToggleChat} />
        </div>
      );
    }

    if (showAllTasks) {
      return (
        <div className="py-3 px-4">
          {/* Tasks Panel Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-medium text-gray-900">
                All Tasks
              </h1>
              <button onClick={onToggleAllTasks}>
                <X {...getIconProps()} />
              </button>
            </div>
            <div className="border-b border-gray-200"></div>
          </div>

          {/* All Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                <h3 className="font-medium">Tasks</h3>
              </div>
              <button>
                <CirclePlus {...getIconProps()} />
              </button>
            </div>
            <div className="space-y-2">
              {allTasks.length > 0 ? (
                allTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-sm text-gray-700">{task}</span>
                    <div className="flex items-center gap-2">
                      <button className="hover:text-black text-gray-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="hover:text-green-600 text-gray-400 transition-colors">
                        <CircleCheck className="w-4 h-4" />
                      </button>
                      <button className="hover:text-red-600 text-gray-400 transition-colors">
                        <CircleX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 py-2">No tasks</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'workflows') {
      return (
        <div className="py-3 px-4">
          {selectedWorkflowEvent && (
            <div>
              <h1 className="text-xl font-medium text-gray-900 mb-2">
                {selectedWorkflowEvent.workflowName}
              </h1>
              <div className="border-b border-gray-200 mb-4"></div>
              <div>
                <h3 className="font-medium mb-2">Event Description</h3>
                <p className="text-sm text-gray-600">
                  {selectedWorkflowEvent.eventDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeView === 'workflowsettings') {
      return (
        <div className="py-3 px-4">
          {selectedWorkflow && (
            <div>
              <button className="w-full px-4 py-2 mb-4 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                Edit
              </button>
              <div className="border-b border-gray-200 mb-4"></div>
              <div className="mb-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-600">
                  {selectedWorkflow.description}
                </p>
              </div>
              <div className="border-b border-gray-200 mb-4"></div>
              <div>
                <h3 className="font-medium mb-2">Integrations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkflow.integrations.map((integration, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                    >
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeView === 'docs') {
      return (
        <div className="py-3 px-4">
          {selectedDocument && (
            <div>
              <button className="w-full px-4 py-2 mb-4 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                Update
              </button>
              <div className="border-b border-gray-200 mb-4"></div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-600">
                {selectedDocument.description}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (selectedEmail?.sender) {
      return (
        <div className="py-3 px-4">
          {/* Sender Information */}
          <div className="mb-6">
            <h1 className="text-xl font-medium text-gray-900 mb-2">
              {selectedEmail.sender.name}
            </h1>
            <p className="text-sm text-gray-600">
              {selectedEmail.sender.title}
            </p>
            <p className="text-sm text-gray-600">
              {selectedEmail.sender.organization}
            </p>
            {selectedEmail.sender.email && (
              <div className="flex items-center gap-1.5 mt-1 mb-4">
                <p className="text-xs text-gray-500">
                  {selectedEmail.sender.email}
                </p>
                <button 
                  onClick={() => copyEmailToClipboard(selectedEmail.sender?.email || '')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy email"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
            {!selectedEmail.sender.email && <div className="mb-4"></div>}
            <div className="border-b border-gray-200"></div>
          </div>

          {/* AI Section */}
          <div className="space-y-6">
            {/* AI Summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkle className="w-4 h-4" />
                <h3 className="font-medium">Summary</h3>
              </div>
              <p className="text-sm text-gray-600">
                {selectedEmail.aiAnalysis?.summary || 'No summary available'}
              </p>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkle className="w-4 h-4" />
                  <h3 className="font-medium">Quick Actions</h3>
                </div>
                <button>
                  <CirclePlus {...getIconProps()} />
                </button>
              </div>
              <div className="space-y-2">
                {selectedEmail.aiAnalysis?.quickActions && selectedEmail.aiAnalysis.quickActions.length > 0 ? (
                  selectedEmail.aiAnalysis.quickActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-sm text-gray-700">{action}</span>
                      <div className="flex items-center gap-2">
                        <button className="hover:text-green-600 text-gray-400 transition-colors">
                          <CircleCheck className="w-4 h-4" />
                        </button>
                        <button className="hover:text-red-600 text-gray-400 transition-colors">
                          <CircleX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 py-2">No quick actions</p>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200"></div>

            {/* Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4" />
                  <h3 className="font-medium">Tasks</h3>
                </div>
                <button>
                  <CirclePlus {...getIconProps()} />
                </button>
              </div>
              <div className="space-y-2">
                {selectedEmail.tasks && selectedEmail.tasks.length > 0 ? (
                  selectedEmail.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-sm text-gray-700">{task}</span>
                      <div className="flex items-center gap-2">
                        <button className="hover:text-green-600 text-gray-400 transition-colors">
                          <CircleCheck className="w-4 h-4" />
                        </button>
                        <button className="hover:text-red-600 text-gray-400 transition-colors">
                          <CircleX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 py-2">No tasks</p>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200"></div>

            {/* Attachments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4" />
                <h3 className="font-medium">Attachments</h3>
              </div>
              <div className="space-y-2">
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 ? (
                  selectedEmail.attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {/* Filename */}
                      <div className="text-sm text-gray-900 font-medium mb-2 truncate">
                        {attachment.filename}
                      </div>
                      
                      {/* File type tag and download icon */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                          {getFileType(attachment)}
                        </span>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 py-2">No attachments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="flex-1 bg-white border-l border-gray-200 relative flex flex-col">
      {renderContent()}
      
      {/* Floating Action Buttons */}
      {!showChat && (
        <div className="fixed bottom-3 right-3 flex gap-3">
          <button onClick={onToggleAllTasks}>
            <ListTodo {...getIconProps()} />
          </button>
          <button onClick={onToggleChat}>
            <Sparkle {...getIconProps()} />
          </button>
        </div>
      )}
    </div>
  );
}
