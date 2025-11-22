'use client';

import { ParsedEmail } from '@/types/email';

interface SenderPanelProps {
  email: ParsedEmail | null;
}

export default function SenderPanel({ email }: SenderPanelProps) {
  if (!email) {
    return (
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hidden xl:block">
        <div className="text-center text-gray-400 dark:text-gray-600 mt-20">
          Select an email to view details
        </div>
      </div>
    );
  }

  // Extract sender info
  const getSenderName = (from: string) => {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1] : from.split('@')[0];
  };

  const getSenderEmail = (from: string) => {
    const match = from.match(/<(.+?)>/);
    return match ? match[1] : from;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const senderName = getSenderName(email.from);
  const senderEmail = getSenderEmail(email.from);

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 overflow-y-auto hidden xl:block">
      {/* Sender Avatar and Name */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-semibold mx-auto mb-3">
          {getInitials(senderName)}
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {senderName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {senderEmail}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mb-6">
        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
          REFER
        </button>
        <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors">
          no thanks
        </button>
      </div>

      {/* Email Details */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Mail
          </h4>
          <div className="space-y-2">
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {email.subject}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatFullDate(email.date)}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-gray-500 dark:text-gray-400 w-16 shrink-0">From:</span>
              <span className="text-gray-900 dark:text-gray-100">{email.from}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 dark:text-gray-400 w-16 shrink-0">To:</span>
              <span className="text-gray-900 dark:text-gray-100">{email.to}</span>
            </div>
            {email.cc && (
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 w-16 shrink-0">Cc:</span>
                <span className="text-gray-900 dark:text-gray-100">{email.cc}</span>
              </div>
            )}
          </div>
        </div>

        {/* Labels */}
        {email.labels.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Labels
            </h4>
            <div className="flex flex-wrap gap-2">
              {email.labels.map((label) => (
                <span
                  key={label}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {email.hasAttachment && email.attachments && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Attachments
            </h4>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Working Info (if available) */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Context
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Working at {senderEmail.split('@')[1]}
          </p>
        </div>
      </div>
    </div>
  );
}
