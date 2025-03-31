import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  hasFilter?: boolean;
  onClearFilter?: () => void;
  filterDescription?: string;
}

export function EmptyState({
  title,
  description,
  icon = <Plus className="empty-state-icon" />,
  actionLabel,
  onAction,
  hasFilter = false,
  onClearFilter,
  filterDescription,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {hasFilter ? (
        <>
          <p>
            {title}
            {filterDescription && ` ${filterDescription}`}
            {onClearFilter && (
              <Button 
                variant="link" 
                onClick={onClearFilter}
                className="p-0 ml-1"
              >
                setze alle Filter zurück
              </Button>
            )}
            .
          </p>
        </>
      ) : (
        <>
          {icon}
          <p>{title}</p>
          {description && <p className="text-sm opacity-80">{description}</p>}
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="btn-accent mt-2"
            >
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}