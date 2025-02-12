import { valueFormatter as vf } from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = vf.IValueFormatter;
import { IFilterColumnTarget } from "powerbi-models";

export interface VisualState {
  viewport: ViewportData;
  settings: dateCardProps;
  category: CategoryData;
}

export interface ViewportData {
  width: number;
  height: number;
}

export interface CategoryData {
  displayName: string;
  count: number;
  rangeValues: dateRange;
  maxWidth: number;
  formatter: IValueFormatter;
  filterTarget: IFilterColumnTarget;
}

export interface Settings {
  general?: {
    dates?: dateRange; // date range object representing the selected date range
    rangeScope?: dateRange; // date range object representing the scope of available dates to choose from
    landingOff?: boolean; // boolean value indicating whether to display landing page
    filter?: any;
  };
  styleSettings?: {
    fmtDate?: string;
    themeColor?: string;
    themeMode?: any;
    themeFont?: string;
    fontFamily?: string;
    fontSize?: string;
    fontBold?: boolean;
    fontUnderline?: boolean;
    fontItalic?: boolean;
    fontColor?: string;
  };
  calendarSettings?: {
    singleDay?: boolean;
    limitToScope?: boolean;
    startRange?: string;
    stepInit?: string;
    payLength?: number;
    fmtDate?: string;
  };
  layoutSettings?: {
    timelineSettings: {
      enableSlider?: boolean;
      showSlider?: boolean;
      show2ndSlider?: boolean;
    };
    currentSettings: {
      showCurrent?: boolean;
      showIconText?: boolean;
      showMore?: boolean;
    };
    moveSettings: {
      showMove?: boolean;
      showExpand?: boolean;
    };
    helpSettings: {
      showHelpIcon?: boolean;
    };
  };
  period?: {
    daySettings?: {
      showDay?: boolean;
      fmtDay?: string;
      daySkip?: number;
    };
    weekSettings?: {
      showWeek?: boolean;
      weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      weekSkip?: number;
      fmtWeek?: string;
    };
    paySettings?: {
      showPay?: boolean;
      paySkip?: number;
      payLength?: number;
      fmtPay?: string;
      payRefDay?: number;
      payRefYear?: number;
      payRefMonth?: number;
      payRefDate?: Date;
    };
    monthSettings?: {
      showMonth?: boolean;
      monthSkip?: number;
      fmtMonth?: string;
    };
    quarterSettings?: {
      showQuarter?: boolean;
      fmtQuarter?: string;
      quarterSkip?: number;
    };
    yearSettings?: {
      showYear?: boolean;
      fmtYear?: string;
      yearStartMonth?: number;
      yearSkip?: number;
    };
  };
  action?: {
    handleVal?: (val: any) => void;
    onFilterChanged?: (val: dateRange) => void;
    setStepValue?: (value: string) => void;
    setStepOpen?: (value: boolean) => void;
    toggleSlider?: () => void;

  };
}

export interface dateCardProps {

  // date range object representing the selected date range
  dates?: dateRange;

  // date range object representing the scope of available dates to choose from
  rangeScope?: dateRange;

  // boolean value indicating whether to display landing page
  landingOff?: boolean;

  startRange?: string;
  // boolean value indicating whether to display step controls for selecting dates
  stepViz?: step<boolean>;

  // string value representing the format of the granularity display for the step controls
  stepFmt?: step<string>;

  // number value representing the number of steps to skip in the step controls
  stepSkip?: step<number>;

  // string value representing the initial granularity display format for the step controls
  stepInit?: string;

  // string value representing the period of the step controls
  stepPeriod?: string;

  // boolean value indicating whether to display visualization options for the date range
  showMore?: boolean;

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
  themeMode?: any; //'light' | 'dark'

  // boolean value indicating whether to show the help icon
  showHelpIcon?: boolean;

  // boolean value indicating whether to show the icon text
  showIconText?: boolean;

  // boolean value indicating whether to constrain to a single day
  singleDay?: boolean;

  // boolean value indicating whether to constrain slelction to date range scope
  limitToScope?: boolean;

  // boolean value indicating whether to show arrows to move/expand by period step
  showMove?: boolean;

  // boolean value indicating whether to show arrows to expand by period step
  showExpand?: boolean;

  // boolean value indicating whether to show timeline toggle button
  enableSlider?: boolean;

  stepOpen?: boolean;
  stepValue?: string;
  current?: any;
  // function to handle the selected value(s)
  handleVal?: (val: any) => void;
  handleClick?: () => void;
  onFilterChanged?: (val: dateRange) => void;
  setStepValue?: (value: string) => void;
  setStepOpen?: (value: boolean) => void;

  //extras for topRow
  openSlider?: boolean;
  toggleSlider?: () => void;

}

export interface topRowProps {
  props: dateCardProps;
  openSlider: boolean;
  landingOff?: boolean;
  toggleSlider: () => void;
  dates?: dateRange;
  rangeScope?: dateRange;
  payProps?: pay;
  handleVal?: (val) => void;
  stepViz?: step<boolean>;
  stepOpen: boolean;
  stepValue: string;
  handleClick: () => void;
  setStepValue: (value: string) => void;
  setStepOpen: (value: boolean) => void;
  showMore: boolean;
  showCurrent: boolean;
  showIconText: boolean;
  current: any;
  singleDay?: boolean;
  limitToScope?: boolean;
  showMove?: boolean;
  showExpand?: boolean;
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
  limitToScope?: boolean;
  showExpand?: boolean;
}

export interface stepProps {
  // value: string;
  stepViz?: step<boolean>;
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
  stepViz?: step<boolean>;
  showCurrent?: boolean;
  stepValue?: string;
  showIconText?: boolean;
  showMore?: boolean;
  current: any;
  handleVal?: (val: any) => void;
  handleStep?: (newValue: string) => void;
  handleViz?: (viz: boolean) => void;
  singleDay?: boolean;
  limitToScope?: boolean;
}

export interface DateRangeProps {
  dates: dateRange;
  rangeScope?: dateRange;
  handleVal?: (val) => void;
  fmtDate?: string;
  singleDay?: boolean;
  limitToScope?: boolean;
}

export interface SliderProps {
  dates?: dateRange;
  rangeScope?: dateRange;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  yearStartMonth?: number;
  stepValue?: string;
  payProps?: pay;
  stepFmt?: step<string>;
  stepSkip?: step<number>;
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

export interface step<T> {
  day: T;
  week: T;
  pay: T;
  month: T;
  quarter: T;
  year: T;
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
