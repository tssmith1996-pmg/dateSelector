export interface dateCardProps {
  // date range object representing the selected date range
  dates?: dateRange;

  // date range object representing the scope of available dates to choose from
  rangeScope?: dateRange;

  // boolean value indicating whether to display step controls for selecting dates
  stepViz?: stepBool;

  // boolean value indicating whether to display visualization options for the date range
  vizOpt?: boolean;

  // string value representing the format of the granularity display for the step controls
  stepFmt?: stepString;

  // number value representing the number of steps to skip in the step controls
  stepSkip?: stepNum;

  // string value representing the initial granularity display format for the step controls
  stepInit?: string;

  // string value representing the period of the step controls
  stepPeriod?: string;

  // payment-related object representing payment-related properties
  payProps?: pay;

  // string value representing the date format to use
  fmtDate?: string;

  // number value representing the day of the week to start the calendar on
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  // number value representing the month to start the year on
  yearStartMonth?: number;

  // boolean value indicating whether to show the date range slider
  showSlider?: boolean;

  // boolean value indicating whether to show a second date range slider
  show2ndSlider?: boolean;

  // boolean value indicating whether to show the current date range
  showCurrent?: boolean;

  // string value representing the theme color to use
  themeColor?: string;

  // value representing the theme font to use
  themeFont?: any;

  // value representing the input font size to use
  fontSize?: string;

  // value representing the theme font size to use
  themeFontSize?: number;

  // value representing the theme mode to use
  themeMode?: any //'light' | 'dark'

  // boolean value indicating whether to show the help icon
  showHelpIcon?: boolean;

  // function to handle the selected value(s)
  handleVal?: (val) => void;

  // boolean value indicating whether to show the icon text
  showIconText?: boolean;
  // boolean value indicating whether to constrain to a single day
  singleDay?: boolean;
  // boolean value indicating whether to show arrows to move/extend by period step
  showMove?: boolean;
  // boolean value indicating whether to show timeline toggle button
  enableSlider?: boolean;
}

export interface topRowProps {
  openSlider: boolean;
  toggleSlider: () => void;
  dates?: dateRange;
  rangeScope?: dateRange;
  payProps?: pay;
  handleVal?: (val) => void;
  stepViz?: stepBool;
  stepOpen: boolean;
  stepValue: string;
  handleClick: () => void;
  setStepValue: (value: string) => void;
  setStepOpen: (value: boolean) => void;
  vizOpt: boolean;
  showCurrent: boolean;
  showIconText: boolean;
  current: any;
  singleDay?: boolean;
  showMove?: boolean;
  enableSlider?: boolean;
}

export interface DateMoveProps {
  dates?: dateRange;
  rangeScope?: dateRange;
  stepValue?: string;
  payProps?: pay;
  bf?: string;
  viz?: boolean;
  vertical?: boolean;
  reverse?: boolean;
  render?: number;
  handleVal?: (val) => void;
  singleDay?: boolean;
}

export interface stepProps {
  // value: string;
  stepViz?: stepBool;
  stepValue?: string;
  payProps?: pay;
  viz?: boolean;
  handleStep?: (newValue: string) => void;
  handleViz?: (viz: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface UseCurrentProps {
  rangeScope?: dateRange;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  yearStartMonth?: number;
  payProps?: pay;
  stepViz?: stepBool;
  showCurrent?: boolean;
  stepValue?: string;
  showIconText?: boolean;
  vizOpt?: boolean;
  current: any;
  handleVal?: (val: any) => void;
  handleStep?: (newValue: string) => void;
  handleViz?: (viz: boolean) => void;
  singleDay?: boolean;
}

export interface DateRangeProps {
  dates: dateRange;
  rangeScope?: dateRange;
  handleVal?: (val) => void;
  fmtDate?: string;
  singleDay?: boolean;
}

export interface SliderProps {
  dates?: dateRange;
  rangeScope?: dateRange;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  yearStartMonth?: number;
  stepValue?: string;
  payProps?: pay;
  stepFmt?: stepString;
  stepSkip?: stepNum;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleVal?: (val) => void;
  toggleSlider?: () => void;
  show2ndSlider?: boolean;
  handleStep?: (val) => void;
  singleDay?: boolean;
}

export interface dateRange {
  start: Date;
  end: Date;
}

export interface stepBool {
  day: boolean;
  week: boolean;
  pay: boolean;
  month: boolean;
  quarter: boolean;
  year: boolean;
}

interface stepString {
  day: string;
  week: string;
  pay: string;
  month: string;
  quarter: string;
  year: string;
}

interface stepNum {
  day: number;
  week: number;
  pay: number;
  month: number;
  quarter: number;
  year: number;
}

interface pay {
  desc: string;
  ref: Date;
  len: number;
}

export interface current {
  tip: string;
  show: boolean;
  thisPeriod: string;
  thisRange: any;
  icon: JSX.Element;
}
