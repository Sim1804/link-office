import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

export function EmptyState({ 
  title = "Aucune donnée disponible", 
  description = "Les informations apparaîtront ici dès que les premières données seront disponibles.", 
  icon: Icon = Sparkles,
  action
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-1)', marginBottom: 'var(--space-8)' }}>
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
