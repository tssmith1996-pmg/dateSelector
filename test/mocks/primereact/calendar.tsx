import React from "react";

export type CalendarPassThroughOptions = Record<string, unknown>;

export const Calendar = React.forwardRef<HTMLDivElement, Record<string, unknown>>((props, ref) => (
  <div ref={ref} data-mock="primereact-calendar" {...props} />
));

Calendar.displayName = "MockPrimeCalendar";

export default Calendar;
