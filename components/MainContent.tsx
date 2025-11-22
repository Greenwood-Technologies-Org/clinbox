'use client';

interface MainContentProps {
  children: React.ReactNode;
  activeView: 'email' | 'calendar';
}

export default function MainContent({ children, activeView }: MainContentProps) {
  return (
    <div className="flex-[0.7] bg-white overflow-y-auto">
      <div className="flex items-center justify-center h-full">
        <h1 className="text-muted">{activeView === 'email' ? 'Email' : 'Calendar'}</h1>
      </div>
    </div>
  );
}
