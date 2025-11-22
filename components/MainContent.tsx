'use client';

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  return (
    <div className="flex-[0.7] bg-white overflow-y-auto">
      {children}
    </div>
  );
}
