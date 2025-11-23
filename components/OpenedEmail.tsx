'use client';

import { ArrowLeft, CircleCheck, Clock4 } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface OpenedEmailProps {
  subject: string;
  onBack: () => void;
}

export default function OpenedEmail({ subject, onBack }: OpenedEmailProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 flex items-center justify-between shrink-0">
        {/* Left: Back Arrow */}
        <button onClick={onBack}>
          <ArrowLeft {...getIconProps()} />
        </button>

        {/* Middle: Subject */}
        <h2 className="text-sm font-medium text-gray-900 truncate px-4">
          {subject}
        </h2>

        {/* Right: Icons */}
        <div className="flex items-center gap-3">
          <button>
            <CircleCheck {...getIconProps()} />
          </button>
          <button>
            <Clock4 {...getIconProps()} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl text-gray-900">{subject}</p>
      </div>
    </div>
  );
}
