'use client';

import { ParsedEmail } from '@/types/email';

interface EmailPreviewProps {
  email: ParsedEmail;
  isSelected: boolean;
  isOpen: boolean;
  onClick: () => void;
  onHover: () => void;
}

export default function EmailPreview({ email, isSelected, isOpen, onClick, onHover }: EmailPreviewProps) {
  // Extract sender name from email address
  const getSenderName = (from: string) => {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1] : from.split('@')[0];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get category badge
  const getCategoryBadge = () => {
    if (email.labels.includes('CATEGORY_PROMOTIONS')) {
      return <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-0.5 rounded">pitch</span>;
    }
    if (email.labels.includes('IMPORTANT')) {
      return <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">pitch</span>;
    }
    return null;
  };

  return (
    <div
      className={`
        border-b border-gray-200 dark:border-gray-800 px-4 py-3 cursor-pointer
        transition-colors
        ${isSelected ? 'bg-gray-100 dark:bg-gray-800 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}
        ${isOpen ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        ${email.isUnread ? 'font-medium' : 'font-normal'}
      `}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <div className="flex items-start space-x-3">
        {/* Unread indicator */}
        {email.isUnread && (
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
        )}

        {/* Email content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <span className={`text-sm truncate ${email.isUnread ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
              {getSenderName(email.from)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
              {formatDate(email.date)}
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-1">
            {getCategoryBadge()}
            <span className={`text-sm truncate ${email.isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {email.subject}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {email.snippet}
          </p>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-2 shrink-0">
          {email.hasAttachment && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
          {email.isStarred && (
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
