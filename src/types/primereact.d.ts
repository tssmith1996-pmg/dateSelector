declare module "primereact/calendar" {
  import * as React from "react";

  export interface CalendarPassThroughOptions {
    [key: string]: unknown;
    dayLabel?: (options: any) => Record<string, unknown>;
  }

  export interface CalendarProps {
    value?: unknown;
    onChange?: (event: any) => void;
    onViewDateChange?: (event: any) => void;
    selectionMode?: string;
    numberOfMonths?: number;
    inline?: boolean;
    locale?: string;
    minDate?: Date;
    maxDate?: Date;
    pt?: CalendarPassThroughOptions;
    panelClassName?: string;
    showOtherMonths?: boolean;
    selectOtherMonths?: boolean;
  }

  export class Calendar extends React.Component<CalendarProps> {}
}

declare module "primereact/api" {
  export function addLocale(locale: string, options: Record<string, unknown>): void;
}

declare module "primereact/ts-helpers" {
  export type FormEvent<T> = { value?: T };
}
