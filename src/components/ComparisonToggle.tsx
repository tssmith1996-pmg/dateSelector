import React from 'react';

interface ComparisonToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ComparisonToggle: React.FC<ComparisonToggleProps> = ({
  checked,
  onChange,
  disabled,
}) => {
  return (
    <label className="pds-toggle">
      <span className="pds-toggleLabel">Comparison</span>
      <span className="pds-toggleControl">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-label="Toggle comparison range"
          disabled={disabled}
        />
        <span aria-hidden="true" className="pds-toggleTrack">
          <span className="pds-toggleThumb" />
        </span>
      </span>
    </label>
  );
};
