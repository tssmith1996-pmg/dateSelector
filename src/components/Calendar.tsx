import classNames from 'classnames';
import React from 'react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { DateRange } from '../logic/state';
import { clipToBounds, endOfLocalDay, startOfLocalDay } from '../logic/dateUtils';

interface CalendarProps {
  id: string;
  range: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale: string;
  title: string;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
  disabled: boolean;
}

const ISO_DATE = 'yyyy-MM-dd';

export const Calendar: React.FC<CalendarProps> = ({
  id,
  range,
  onChange,
  minDate,
  maxDate,
  weekStartsOn,
  locale,
  title,
}) => {
  const [visibleMonth, setVisibleMonth] = React.useState(() =>
    startOfMonth(range.end),
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragAnchor, setDragAnchor] = React.useState<Date | null>(null);
  const [pendingFocus, setPendingFocus] = React.useState<Date | null>(null);
  const dayRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  React.useEffect(() => {
    setVisibleMonth((current) => {
      if (isSameMonth(range.end, current)) {
        return current;
      }
      return startOfMonth(range.end);
    });
  }, [range.end]);

  React.useEffect(() => {
    if (!isDragging) {
      setDragAnchor(null);
    }
  }, [isDragging]);

  React.useEffect(() => {
    if (!pendingFocus) {
      return;
    }
    const key = format(pendingFocus, ISO_DATE);
    const button = dayRefs.current.get(key);
    if (button) {
      button.focus({ preventScroll: true });
      setPendingFocus(null);
    }
  }, [pendingFocus, visibleMonth, range]);

  React.useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handlePointerUp, true);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp, true);
    };
  }, [isDragging]);

  const minBound = minDate ? startOfLocalDay(minDate) : undefined;
  const maxBound = maxDate ? endOfLocalDay(maxDate) : undefined;

  const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn });
  const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn });

  const days: DayCell[] = [];
  let cursor = start;
  while (!isAfter(cursor, end)) {
    const inMonth = isSameMonth(cursor, visibleMonth);
    const disabled =
      (minBound && isBefore(cursor, minBound)) ||
      (maxBound && isAfter(cursor, maxBound));
    days.push({
      date: cursor,
      inMonth,
      disabled,
    });
    cursor = addDays(cursor, 1);
  }

  dayRefs.current.clear();

  const monthFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale || 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [locale]);

  const weekdayFormatter = React.useMemo(() => {
    const reference = startOfWeek(new Date(2021, 5, 6), { weekStartsOn });
    const formatter = new Intl.DateTimeFormat(locale || 'en-US', {
      weekday: 'short',
    });
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(addDays(reference, index)),
    );
  }, [locale, weekStartsOn]);

  const dayFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale || 'en-US', {
      dateStyle: 'full',
    });
  }, [locale]);

  const selectRange = React.useCallback(
    (nextRange: DateRange) => {
      const clipped = clipToBounds(nextRange, minBound, maxBound);
      onChange(clipped);
    },
    [maxBound, minBound, onChange],
  );

  const handleDaySelection = React.useCallback(
    (day: Date) => {
      if (dragAnchor) {
        const startDate = isBefore(day, dragAnchor) ? day : dragAnchor;
        const endDate = isAfter(day, dragAnchor) ? day : dragAnchor;
        selectRange({ start: startDate, end: endDate });
        setDragAnchor(null);
        setIsDragging(false);
      } else {
        setDragAnchor(day);
        selectRange({ start: day, end: day });
      }
    },
    [dragAnchor, selectRange],
  );

  const handleDayClick = (day: Date, disabled: boolean) => {
    if (disabled) {
      return;
    }
    handleDaySelection(day);
  };

  const handlePointerDown = (day: Date, disabled: boolean) => (event: React.PointerEvent) => {
    if (disabled) {
      return;
    }
    event.preventDefault();
    setIsDragging(true);
    setDragAnchor(day);
    selectRange({ start: day, end: day });
  };

  const handlePointerEnter = (day: Date, disabled: boolean) => () => {
    if (!isDragging || disabled || !dragAnchor) {
      return;
    }
    const startDate = isBefore(day, dragAnchor) ? day : dragAnchor;
    const endDate = isAfter(day, dragAnchor) ? day : dragAnchor;
    selectRange({ start: startDate, end: endDate });
  };

  const handleKeyDown = (day: Date, disabled: boolean) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    let target: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        target = addDays(day, -1);
        break;
      case 'ArrowRight':
        target = addDays(day, 1);
        break;
      case 'ArrowUp':
        target = addDays(day, -7);
        break;
      case 'ArrowDown':
        target = addDays(day, 7);
        break;
      case 'Home':
        target = startOfWeek(day, { weekStartsOn });
        break;
      case 'End':
        target = endOfWeek(day, { weekStartsOn });
        break;
      case 'PageUp':
        target = addMonths(day, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        target = addMonths(day, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        handleDaySelection(day);
        return;
      }
      default:
        return;
    }

    if (target) {
      event.preventDefault();
      setVisibleMonth(startOfMonth(target));
      setPendingFocus(target);
    }
  };

  const goToPreviousMonth = () => {
    setVisibleMonth((current) => addMonths(current, -1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((current) => addMonths(current, 1));
  };

  const rangeStart = startOfLocalDay(range.start);
  const rangeEnd = endOfLocalDay(range.end);

  let focusAssigned = false;

  return (
    <div className="pds-calendar" aria-labelledby={`${id}-heading`}>
      <div className="pds-calendarHeader">
        <button type="button" className="pds-navButton" onClick={goToPreviousMonth} aria-label="Previous month">
          ◄
        </button>
        <h3 id={`${id}-heading`} className="pds-calendarTitle">
          <span className="pds-calendarMonth">{monthFormatter.format(visibleMonth)}</span>
          <span className="pds-calendarSubtitle">{title}</span>
        </h3>
        <button type="button" className="pds-navButton" onClick={goToNextMonth} aria-label="Next month">
          ▶
        </button>
      </div>
      <table className="pds-calendarGrid" role="grid" aria-labelledby={`${id}-heading`}>
        <thead>
          <tr>
            {weekdayFormatter.map((label, index) => (
              <th key={index} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: days.length / 7 }, (_, weekIndex) => (
            <tr key={weekIndex} role="row">
              {days.slice(weekIndex * 7, weekIndex * 7 + 7).map(({ date, inMonth, disabled }, columnIndex) => {
                const iso = format(date, ISO_DATE);
                const isStart = isSameDay(date, rangeStart);
                const isEnd = isSameDay(date, rangeEnd);
                const inRange = isWithinInterval(date, { start: rangeStart, end: rangeEnd });
                const isToday = isSameDay(date, startOfLocalDay(new Date()));
                let isFocus = false;
                if (!focusAssigned && isEnd) {
                  isFocus = true;
                } else if (!focusAssigned && isStart) {
                  isFocus = true;
                } else if (
                  !focusAssigned &&
                  inMonth &&
                  !disabled &&
                  weekIndex === 0 &&
                  columnIndex === 0
                ) {
                  isFocus = true;
                }

                const tabIndex = isFocus ? 0 : -1;
                if (isFocus) {
                  focusAssigned = true;
                }

                return (
                  <td key={iso} role="gridcell">
                    <button
                      ref={(element) => {
                        if (!element) {
                          dayRefs.current.delete(iso);
                        } else {
                          dayRefs.current.set(iso, element);
                        }
                      }}
                      id={`${id}-${iso}`}
                      className={classNames('pds-dayButton', {
                        'pds-dayOutside': !inMonth,
                        'pds-dayDisabled': disabled,
                        'pds-dayInRange': inRange,
                        'pds-dayStart': isStart,
                        'pds-dayEnd': isEnd,
                        'pds-dayToday': isToday,
                      })}
                      type="button"
                      tabIndex={tabIndex}
                      onClick={() => handleDayClick(date, disabled)}
                      onPointerDown={handlePointerDown(date, disabled)}
                      onPointerEnter={handlePointerEnter(date, disabled)}
                      onKeyDown={handleKeyDown(date, disabled)}
                      aria-pressed={inRange}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={dayFormatter.format(date)}
                      disabled={disabled}
                    >
                      {format(date, 'd')}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
