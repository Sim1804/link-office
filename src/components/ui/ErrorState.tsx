import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

export function ErrorState({ 
  title = "Une erreur est survenue", 
  description = "Nous n'avons pas pu charger ces données. Veuillez réessayer ultérieurement.", 
  icon: Icon = AlertCircle,
  action
}: ErrorStateProps) {
  return (
    <div className="empty-state" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <div className="empty-state-icon" style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '50%' }}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-1)', marginBottom: 'var(--space-8)', marginTop: 'var(--space-16)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-2)', maxWidth: '400px', lineHeight: 1.5, marginBottom: action ? 'var(--space-24)' : 0 }}>
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
