import * as React from "react";
import styles from "../styles/calendar.module.css";
import { DayCell } from "./DayCell";
import {
  CalendarLocalization,
  DateRange,
  HolidayDescriptor,
} from "../types";

export interface CalendarGridProps {
  month: Date;
  firstDayOfWeek: number;
  ranges: DateRange[];
  anchorDate: Date | null;
  focusedDate: Date | null;
  onFocusDate: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  localization: CalendarLocalization;
  holidays: HolidayDescriptor[];
  weekendStyleEnabled: boolean;
  weekendColor: string;
  holidayColor: string;
  cellPadding: number;
  borderRadius: number;
  todayOutline: boolean;
}

interface DayDescriptor {
  date: Date;
  isCurrentMonth: boolean;
}

const daysInMonth = (month: Date, firstDayOfWeek: number): DayDescriptor[] => {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstDay = firstOfMonth.getDay();
  const days: DayDescriptor[] = [];
  const startOffset = (firstDay - firstDayOfWeek + 7) % 7;
  for (let index = -startOffset; index < 42 - startOffset; index += 1) {
    const date = new Date(firstOfMonth);
    date.setDate(firstOfMonth.getDate() + index);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month.getMonth(),
    });
  }
  return days;
};

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();

const withinRange = (date: Date, range: DateRange) => {
  const target = date.getTime();
  return target >= range.start.getTime() && target <= range.end.getTime();
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  month,
  firstDayOfWeek,
  ranges,
  anchorDate,
  focusedDate,
  onFocusDate,
  onSelectDate,
  minDate,
  maxDate,
  localization,
  holidays,
  weekendStyleEnabled,
  weekendColor,
  holidayColor,
  cellPadding,
  borderRadius,
  todayOutline,
}) => {
  const today = normalizeDate(new Date());
  const days = React.useMemo(() => daysInMonth(month, firstDayOfWeek), [month, firstDayOfWeek]);
  const holidayMap = React.useMemo(() => {
    const map = new Map<string, string | undefined>();
    holidays.forEach((holiday) => {
      map.set(holiday.date, holiday.label);
    });
    return map;
  }, [holidays]);

  const orderedWeekdays = React.useMemo(() => {
    const days = [...localization.shortWeekdays];
    const start = firstDayOfWeek % 7;
    return [...days.slice(start), ...days.slice(0, start)];
  }, [localization.shortWeekdays, firstDayOfWeek]);

  return (
    <div className={styles.grid} role="grid">
      <div className={styles.weekHeader} role="row">
        {orderedWeekdays.map((weekday) => (
          <div className={styles.weekHeaderCell} role="columnheader" key={weekday}>
            {weekday}
          </div>
        ))}
      </div>
      <div className={styles.gridBody}>
        {days.map((day) => {
          const normalized = normalizeDate(day.date);
          const iso = normalized.toISOString().substring(0, 10);
          const isWeekend = normalized.getDay() === 0 || normalized.getDay() === 6;
          const disabled =
            (minDate && normalized < normalizeDate(minDate)) ||
            (maxDate && normalized > normalizeDate(maxDate));
          const isSelected = ranges.some((range) => withinRange(normalized, range));
          const isAnchor = anchorDate ? sameDay(normalizeDate(anchorDate), normalized) : false;
          const isFocused = focusedDate ? sameDay(normalizeDate(focusedDate), normalized) : false;
          const holidayLabel = holidayMap.get(iso);

          return (
            <DayCell
              key={iso}
              date={normalized}
              label={normalized.getDate().toString()}
              isCurrentMonth={day.isCurrentMonth}
              isWeekend={isWeekend}
              disabled={disabled}
              isSelected={isSelected}
              isAnchor={isAnchor}
              isFocused={isFocused}
              isToday={sameDay(today, normalized)}
              weekendStyleEnabled={weekendStyleEnabled}
              weekendColor={weekendColor}
              holidayColor={holidayColor}
              holidayLabel={holidayLabel}
              cellPadding={cellPadding}
              borderRadius={borderRadius}
              todayOutline={todayOutline}
              onFocus={() => onFocusDate(normalized)}
              onSelect={() => onSelectDate(normalized)}
              ariaLabel={new Intl.DateTimeFormat("en", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(normalized)}
            />
          );
        })}
      </div>
    </div>
  );
};
