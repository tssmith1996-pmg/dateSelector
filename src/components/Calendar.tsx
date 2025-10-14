import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  endOfDay,
  getMonthMatrix,
  getToday,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  moveMonth,
  normalizeRange,
  startOfDay,
  startOfMonth,
  toISODate,
} from "../date";
import { DateRange } from "../types/dateRange";
import "../styles/calendar.css";

export type CalendarProps = {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  locale: string;
  dataMin?: Date;
  dataMax?: Date;
  weekStartsOn?: number;
};

export const Calendar: React.FC<CalendarProps> = ({ range, onRangeChange, locale, dataMin, dataMax, weekStartsOn }) => {
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(range.from));
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const [focusDate, setFocusDate] = useState<Date>(() => range.from);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const monthTitleFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }), [locale]);
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const fullDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [locale],
  );

  const fromTime = range.from.getTime();
  const toTime = range.to.getTime();
  const rangeRef = useRef(range);
  rangeRef.current = range;

  useEffect(() => {
    setVisibleMonth((current) => {
      const { from, to } = rangeRef.current;
      if (isSameMonth(from, current) || isSameMonth(to, current)) {
        return current;
      }
      return startOfMonth(from);
    });
  }, [fromTime, toTime]);

  useEffect(() => {
    setFocusDate(range.from);
  }, [range]);

  useEffect(() => {
    const label = monthTitleFormatter.format(visibleMonth);
    if (containerRef.current) {
      containerRef.current.setAttribute("aria-label", `Calendar for ${label}`);
    }
  }, [visibleMonth, monthTitleFormatter]);

  const startDay = typeof weekStartsOn === "number" ? weekStartsOn : 1;

  const monthMatrix = useMemo(() => getMonthMatrix(visibleMonth, startDay), [visibleMonth, startDay]);

  const today = useMemo(() => getToday(), []);

  const handleDayCommit = (date: Date) => {
    const normalizedDate = startOfDay(date);
    const inBounds = isDateSelectable(normalizedDate, dataMin, dataMax);
    if (!inBounds) {
      return;
    }

    if (pendingStart) {
      const nextRange = normalizeRange(pendingStart, normalizedDate);
      setPendingStart(null);
      onRangeChange(nextRange);
      return;
    }

    setPendingStart(normalizedDate);
    onRangeChange(normalizeRange(normalizedDate, normalizedDate));
  };

  const handleDayHover = (date: Date) => {
    if (!pendingStart) {
      return;
    }
    const normalizedDate = startOfDay(date);
    if (!isDateSelectable(normalizedDate, dataMin, dataMax)) {
      return;
    }
    const nextRange = normalizeRange(pendingStart, normalizedDate);
    onRangeChange(nextRange);
  };

  const handleKeyNavigation = (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
    let next = date;
    if (event.key === "ArrowRight") {
      next = addDaysClamped(date, 1, dataMin, dataMax);
    } else if (event.key === "ArrowLeft") {
      next = addDaysClamped(date, -1, dataMin, dataMax);
    } else if (event.key === "ArrowUp") {
      next = addDaysClamped(date, -7, dataMin, dataMax);
    } else if (event.key === "ArrowDown") {
      next = addDaysClamped(date, 7, dataMin, dataMax);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      setVisibleMonth(moveMonth(visibleMonth, event.shiftKey ? -12 : -1));
      return;
    } else if (event.key === "PageDown") {
      event.preventDefault();
      setVisibleMonth(moveMonth(visibleMonth, event.shiftKey ? 12 : 1));
      return;
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusDate(range.from);
      return;
    } else if (event.key === "End") {
      event.preventDefault();
      setFocusDate(range.to);
      return;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleDayCommit(date);
      return;
    } else if (event.key === "Escape") {
      event.preventDefault();
      setPendingStart(null);
      onRangeChange(range);
      return;
    }
    if (next !== date) {
      event.preventDefault();
      setFocusDate(next);
      if (!isSameMonth(next, visibleMonth)) {
        setVisibleMonth(startOfMonth(next));
      }
    }
  };

  const handlePrevMonth = () => {
    setVisibleMonth(addMonths(visibleMonth, -1));
  };

  const handleNextMonth = () => {
    setVisibleMonth(addMonths(visibleMonth, 1));
  };

  return (
    <div className="calendar" ref={containerRef} role="application">
      <div className="calendar__header">
        <button type="button" className="calendar__nav" onClick={handlePrevMonth} aria-label="Previous month">
          ‹
        </button>
        <div className="calendar__title">{monthTitleFormatter.format(visibleMonth)}</div>
        <button type="button" className="calendar__nav" onClick={handleNextMonth} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="calendar__weekdays" role="row">
        {monthMatrix[0].map((date) => {
          const label = weekdayFormatter.format(date);
          return (
            <div key={`weekday-${label}`} className="calendar__weekday" role="columnheader" aria-label={label}>
              {label.slice(0, 2)}
            </div>
          );
        })}
      </div>
      <div className="calendar__grid" role="grid">
        {monthMatrix.map((week, rowIndex) => (
          <div key={`row-${rowIndex}`} className="calendar__row" role="row">
            {week.map((date) => {
              const disabled = !isDateSelectable(date, dataMin, dataMax);
              const selectedStart = isSameDay(date, range.from);
              const selectedEnd = isSameDay(date, range.to);
              const inRange = !selectedStart && !selectedEnd && isWithinDraftRange(date, range);
              const outside = !isSameMonth(date, visibleMonth);
              const isTodayFlag = isSameDay(date, today);

              const classes = ["calendar__day"];
              if (selectedStart) classes.push("calendar__day--start");
              if (selectedEnd) classes.push("calendar__day--end");
              if (inRange) classes.push("calendar__day--in-range");
              if (disabled) classes.push("calendar__day--disabled");
              if (outside) classes.push("calendar__day--outside");
              if (isTodayFlag) classes.push("calendar__day--today");
              if (isSameDay(focusDate, date)) classes.push("calendar__day--focus");

              return (
                <button
                  type="button"
                  key={toISODate(date)}
                  className={classes.join(" ")}
                  role="gridcell"
                  aria-selected={selectedStart || selectedEnd || inRange}
                  aria-label={fullDateFormatter.format(date)}
                  onClick={() => handleDayCommit(date)}
                  onFocus={() => setFocusDate(date)}
                  onKeyDown={(event) => handleKeyNavigation(event, date)}
                  onMouseEnter={() => handleDayHover(date)}
                  disabled={disabled}
                >
                  <span>{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

function isDateSelectable(date: Date, min?: Date, max?: Date) {
  if (min && isBefore(endOfDay(date), min)) {
    return false;
  }
  if (max && isAfter(startOfDay(date), max)) {
    return false;
  }
  return true;
}

function isWithinDraftRange(date: Date, range: DateRange) {
  const time = date.getTime();
  return time > range.from.getTime() && time < range.to.getTime();
}

function addDaysClamped(date: Date, amount: number, min?: Date, max?: Date) {
  const target = new Date(date);
  target.setDate(target.getDate() + amount);
  const normalized = startOfDay(target);
  if (!isDateSelectable(normalized, min, max)) {
    return date;
  }
  return normalized;
}

