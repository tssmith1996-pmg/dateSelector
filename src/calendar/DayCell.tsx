import * as React from "react";
import styles from "../styles/calendar.module.css";
import classNames from "classnames";

export interface DayCellProps {
  date: Date;
  label: string;
  ariaLabel: string;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  disabled: boolean;
  isSelected: boolean;
  isAnchor: boolean;
  isFocused: boolean;
  isToday: boolean;
  weekendStyleEnabled: boolean;
  weekendColor: string;
  holidayColor: string;
  holidayLabel?: string;
  cellPadding: number;
  borderRadius: number;
  todayOutline: boolean;
  onSelect: () => void;
  onFocus: () => void;
}

export const DayCell: React.FC<DayCellProps> = ({
  label,
  ariaLabel,
  isCurrentMonth,
  isWeekend,
  disabled,
  isSelected,
  isAnchor,
  isFocused,
  isToday,
  weekendStyleEnabled,
  weekendColor,
  holidayColor,
  holidayLabel,
  cellPadding,
  borderRadius,
  todayOutline,
  onSelect,
  onFocus,
}) => {
  const className = classNames(styles.dayCell, {
    [styles.dayCellOutside]: !isCurrentMonth,
    [styles.dayCellWeekend]: isWeekend && weekendStyleEnabled,
    [styles.dayCellSelected]: isSelected,
    [styles.dayCellAnchor]: isAnchor,
    [styles.dayCellToday]: isToday,
    [styles.dayCellDisabled]: disabled,
    [styles.dayCellFocused]: isFocused,
  });

  const style: React.CSSProperties = {
    padding: cellPadding,
    borderRadius,
    outline: todayOutline && isToday ? `2px solid ${holidayColor}` : undefined,
    backgroundColor:
      weekendStyleEnabled && isWeekend && !isSelected ? weekendColor : undefined,
  };

  const handleClick = () => {
    if (!disabled) {
      onSelect();
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      onFocus();
    }
  };

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={handleClick}
      onFocus={handleFocus}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      data-holiday={holidayLabel ?? undefined}
      data-weekend-color={weekendColor}
    >
      <span className={styles.dayLabel}>{label}</span>
      {holidayLabel && (
        <span className={styles.holidayDot} style={{ backgroundColor: holidayColor }}>
          <span className={styles.srOnly}>{holidayLabel}</span>
        </span>
      )}
    </button>
  );
};
