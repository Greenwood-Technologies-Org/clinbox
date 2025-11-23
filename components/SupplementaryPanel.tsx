'use client';

import { Sparkle, CircleCheck, CircleX, CirclePlus } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

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
}

interface SupplementaryPanelProps {
  children: React.ReactNode;
  selectedEmail: SelectedEmail | null;
}

export default function SupplementaryPanel({ children, selectedEmail }: SupplementaryPanelProps) {
  return (
    <div className="flex-1 bg-white border-l border-gray-200 overflow-y-auto">
      {selectedEmail?.sender ? (
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
                  <p className="text-sm text-gray-400 py-2">No quick actions available</p>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
