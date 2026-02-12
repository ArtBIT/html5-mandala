import { type ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
}

export function Toolbar({ children }: ToolbarProps) {
  return (
    <div className="h-12 border-b border-border flex items-center px-4 gap-6 bg-background">
      {children}
    </div>
  );
}

interface ToolbarSectionProps {
  children: ReactNode;
  title?: string;
}

export function ToolbarSection({ children, title }: ToolbarSectionProps) {
  return (
    <div className="flex items-center gap-2">
      {title && (
        <span className="text-sm text-muted-foreground mr-2">{title}</span>
      )}
      {children}
    </div>
  );
}

export function ToolbarSeparator() {
  return <div className="w-px h-6 bg-border" />;
}
