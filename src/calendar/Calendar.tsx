import * as React from "react";
import styles from "../styles/calendar.module.css";
import { CalendarGrid } from "./CalendarGrid";
import {
  CalendarLocalization,
  DateFieldScope,
  DateRange,
  HolidayDescriptor,
  SelectionMode,
} from "../types";
import { formatDateRange } from "../dateMath";

export interface CalendarProps {
  ranges: DateRange[];
  selectionMode: SelectionMode;
  allowMultiple: boolean;
  firstDayOfWeek: number;
  scope?: DateFieldScope;
  localization: CalendarLocalization;
  onChange: (ranges: DateRange[]) => void;
  onHoverRange?: (range: DateRange | null) => void;
  holidays: HolidayDescriptor[];
  weekendStyleEnabled: boolean;
  weekendColor: string;
  holidayColor: string;
  fontFamily: string;
  fontSize: number;
  cellPadding: number;
  borderRadius: number;
  todayOutline: boolean;
}

const getInitialMonth = (ranges: DateRange[]): Date => {
  if (ranges.length > 0) {
    return new Date(ranges[0].start.getFullYear(), ranges[0].start.getMonth(), 1);
  }
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

export const Calendar: React.FC<CalendarProps> = ({
  ranges,
  selectionMode,
  allowMultiple,
  firstDayOfWeek,
  scope,
  localization,
  onChange,
  holidays,
  weekendStyleEnabled,
  weekendColor,
  holidayColor,
  fontFamily,
  fontSize,
  cellPadding,
  borderRadius,
  todayOutline,
}) => {
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => getInitialMonth(ranges));
  const [anchorDate, setAnchorDate] = React.useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = React.useState<Date | null>(null);

  const minDate = scope?.min;
  const maxDate = scope?.max;

  React.useEffect(() => {
    if (ranges.length > 0) {
      setVisibleMonth(new Date(ranges[0].start.getFullYear(), ranges[0].start.getMonth(), 1));
    }
  }, [ranges]);

  const updateRanges = React.useCallback(
    (next: DateRange) => {
      let nextRanges = allowMultiple ? [...ranges] : [];
      if (!allowMultiple) {
        nextRanges = [next];
      } else {
        const existingIndex = nextRanges.findIndex(
          (range) =>
            range.start.toDateString() === next.start.toDateString() &&
            range.end.toDateString() === next.end.toDateString()
        );
        if (existingIndex >= 0) {
          nextRanges.splice(existingIndex, 1);
        } else {
          nextRanges.push(next);
        }
      }
      onChange(nextRanges);
    },
    [allowMultiple, ranges, onChange]
  );

  const computeRangeFromSelection = (start: Date, end: Date): DateRange => {
    const normalizedStart = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (normalizedEnd < normalizedStart) {
      return { start: normalizedEnd, end: normalizedStart };
    }
    return { start: normalizedStart, end: normalizedEnd };
  };

  const handleDaySelected = (date: Date) => {
    if (selectionMode === "single") {
      updateRanges({ start: date, end: date });
      setAnchorDate(null);
      return;
    }
    if (selectionMode === "startOnly") {
      updateRanges({ start: date, end: date });
      setAnchorDate(null);
      return;
    }
    if (selectionMode === "endOnly") {
      updateRanges({ start: date, end: date });
      setAnchorDate(null);
      return;
    }

    if (!anchorDate) {
      setAnchorDate(date);
      setFocusedDate(date);
      return;
    }
    const range = computeRangeFromSelection(anchorDate, date);
    updateRanges(range);
    setAnchorDate(null);
  };

  const handleKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!focusedDate) {
      return;
    }
    const key = event.key;
    let delta = 0;
    if (key === "ArrowRight") delta = 1;
    if (key === "ArrowLeft") delta = -1;
    if (key === "ArrowUp") delta = -7;
    if (key === "ArrowDown") delta = 7;
    if (key === "PageUp") delta = -30;
    if (key === "PageDown") delta = 30;

    if (delta !== 0) {
      event.preventDefault();
      const next = new Date(focusedDate);
      next.setDate(next.getDate() + delta);
      setFocusedDate(next);
      if (next.getMonth() !== visibleMonth.getMonth()) {
        setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
      }
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      handleDaySelected(focusedDate);
    }

    if (key === "Escape") {
      setAnchorDate(null);
    }
  };

  const monthLabel = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    });
    return formatter.format(visibleMonth);
  }, [visibleMonth]);

  return (
    <div
      className={styles.calendar}
      style={{ fontFamily, fontSize }}
      role="application"
      aria-label={localization.aria.calendar}
      onKeyDown={handleKeyboard}
      tabIndex={0}
      onFocus={() => {
        if (!focusedDate) {
          const fallback = ranges[0]?.start ?? new Date();
          setFocusedDate(new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()));
        }
      }}
    >
      <div className={styles.calendarHeader}>
        <button
          type="button"
          className={styles.navButton}
          aria-label={localization.aria.previousMonth}
          onClick={() =>
            setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
          }
        >
          ‹
        </button>
        <div className={styles.monthLabel}>{monthLabel}</div>
        <button
          type="button"
          className={styles.navButton}
          aria-label={localization.aria.nextMonth}
          onClick={() =>
            setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
          }
        >
          ›
        </button>
      </div>
      <CalendarGrid
        month={visibleMonth}
        firstDayOfWeek={firstDayOfWeek}
        ranges={ranges}
        anchorDate={anchorDate}
        focusedDate={focusedDate}
        onFocusDate={setFocusedDate}
        onSelectDate={handleDaySelected}
        minDate={minDate}
        maxDate={maxDate}
        localization={localization}
        holidays={holidays}
        weekendStyleEnabled={weekendStyleEnabled}
        weekendColor={weekendColor}
        holidayColor={holidayColor}
        cellPadding={cellPadding}
        borderRadius={borderRadius}
        todayOutline={todayOutline}
      />
      {ranges.length > 0 && (
        <div className={styles.rangeSummary} aria-live="polite">
          {ranges.map((range, index) => (
            <div key={`${range.start.toISOString()}-${index}`}>{formatDateRange(range)}</div>
          ))}
        </div>
      )}
    </div>
  );
};
