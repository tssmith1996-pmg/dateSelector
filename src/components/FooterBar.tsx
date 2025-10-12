import React from 'react';

interface FooterBarProps {
  onApply: () => void;
  onClear: () => void;
  onToday: () => void;
  showQuickApply: boolean;
  showClear: boolean;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  onApply,
  onClear,
  onToday,
  showQuickApply,
  showClear,
}) => {
  return (
    <div className="pds-footer">
      {showQuickApply ? (
        <button type="button" className="pds-footerButton" onClick={onToday}>
          Today
        </button>
      ) : (
        <span />
      )}
      {showClear && (
        <button type="button" className="pds-footerButton" onClick={onClear}>
          Clear
        </button>
      )}
      <button type="button" className="pds-footerApply" onClick={onApply}>
        Apply
      </button>
    </div>
  );
};
