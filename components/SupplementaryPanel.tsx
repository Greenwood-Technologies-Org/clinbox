'use client';

import { Sparkle, CircleCheck, CircleX, CirclePlus, ListTodo, Mail, X, Paperclip } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import type { Attachment } from '@/lib/email-utils';
import { useState, useEffect } from 'react';

interface SelectedEmail {
  filename?: string;
  sender?: {
    name: string;
    title: string;
    organization: string;
  };
  aiAnalysis?: {
    summary: string;
    quickActions?: string[];
  };
  tasks?: string[];
  attachments?: Attachment[];
}

interface SupplementaryPanelProps {
  children: React.ReactNode;
  selectedEmail: SelectedEmail | null;
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

export default function SupplementaryPanel({ children, selectedEmail }: SupplementaryPanelProps) {
  const [showTasksPanel, setShowTasksPanel] = useState(false);
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

    if (showTasksPanel) {
      loadAllTasks();
    }
  }, [showTasksPanel]);
  return (
    <div className="flex-1 bg-white border-l border-gray-200 overflow-y-auto relative">
      {showTasksPanel ? (
        <div className="py-3 px-4">
          {/* Tasks Panel Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-medium text-gray-900">
                All Tasks
              </h1>
              <button onClick={() => setShowTasksPanel(false)}>
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
      ) : selectedEmail?.sender ? (
        <div className="py-3 px-4">
          {/* Sender Information */}
          <div className="mb-6">
            <h1 className="text-xl font-medium text-gray-900 mb-2">
              {selectedEmail.sender.name}
            </h1>
            <p className="text-sm text-gray-600">
              {selectedEmail.sender.title}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {selectedEmail.sender.organization}
            </p>
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
                    <div key={index} className="py-2">
                      <span className="text-sm text-gray-700">{attachment.filename}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 py-2">No attachments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-3 right-3 flex gap-3">
        <button onClick={() => setShowTasksPanel(!showTasksPanel)}>
          <ListTodo {...getIconProps()} />
        </button>
        <button>
          <Sparkle {...getIconProps()} />
        </button>
      </div>
    </div>
  );
}
