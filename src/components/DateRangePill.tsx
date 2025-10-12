import classNames from 'classnames';
import React from 'react';

interface DateRangePillProps {
  label: string;
  comparisonLabel?: string;
  onOpen: () => void;
  pillStyle: 'compact' | 'expanded';
  disabled?: boolean;
  isOpen?: boolean;
}

export const DateRangePill: React.FC<DateRangePillProps> = ({
  label,
  comparisonLabel,
  onOpen,
  pillStyle,
  disabled,
  isOpen,
}) => {
  const text = comparisonLabel
    ? `${label} — vs — ${comparisonLabel}`
    : label;

  return (
    <button
      className={classNames('pds-pill', {
        'pds-pillExpanded': pillStyle === 'expanded',
      })}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={isOpen ?? false}
      disabled={disabled}
      title={text}
    >
      <span className="pds-pillText" aria-live="polite">
        {text}
      </span>
      <span aria-hidden="true" className="pds-pillIcon">
        ▾
      </span>
    </button>
  );
};
