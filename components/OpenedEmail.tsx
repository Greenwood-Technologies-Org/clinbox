'use client';

interface OpenedEmailProps {
  subject: string;
}

export default function OpenedEmail({ subject }: OpenedEmailProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-xl text-gray-900">{subject}</p>
    </div>
  );
}
