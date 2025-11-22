'use client';

import { ParsedEmail } from '@/types/email';

interface EmailThreadProps {
  email: ParsedEmail;
  onClose: () => void;
}

export default function EmailThread({ email, onClose }: EmailThreadProps) {
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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + 
             ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
             ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  };

  const senderName = getSenderName(email.from);
  const senderEmail = getSenderEmail(email.from);

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Inbox</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Subject */}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
          {email.subject}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Roshan discusses {email.subject.toLowerCase()}
        </p>
      </div>

      {/* Thread Messages */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Individual Message */}
        <div className="mb-6">
          {/* Message Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shrink-0">
              {getInitials(senderName)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {senderName}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {senderEmail}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFullDate(email.date)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                to {email.to}
                {email.cc && <span className="ml-1">cc {email.cc}</span>}
              </div>
            </div>
          </div>

          {/* Message Body */}
          <div className="ml-14 text-gray-900 dark:text-gray-100 space-y-4">
            <p>
              Hello Hely and Nick,
            </p>
            <p>
              Thank you for letting me know. Could you please confirm the following?
            </p>
            <p>
              <strong>1)</strong> The credit check will be a soft check and <strong>won't negatively affect my credit score.</strong>
            </p>
            <p>
              <strong>2)</strong> I would only be responsible for my stay at this location Jan 1st - March 31st, 
              and would not be responsible for finding anyone to live at this location after March.
            </p>
            <p>
              <strong>3)</strong> Would I be subletting from Sunil, or would this be a lease takeover?
            </p>
            <p className="mt-4">
              Thanks!<br />
              Roshan
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ...
            </p>
          </div>

          {/* Attachments (if any) */}
          {email.hasAttachment && email.attachments && (
            <div className="ml-14 mt-4 space-y-2">
              {email.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Box */}
        <div className="mt-8 ml-14">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <input
              type="text"
              placeholder="@mention anyone and share conversation"
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
