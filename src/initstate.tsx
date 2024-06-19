import { Settings, dateCardProps } from "./interface";
//import { defaultSettings } from "./vinitsettings";
import { startOfYear, startOfToday, endOfYear } from "date-fns";

export const defaultSettings: Settings = {
  styleSettings: {
    fmtDate: "d-MM-yyyy",
    themeColor: "#607d8b",
    themeMode: "light",
    themeFont: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
    fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
    fontSize: "12",
    fontBold: false,
    fontUnderline: false,
    fontItalic: false,
    fontColor: "#000000",
  },
  calendarSettings: {
    singleDay: false,
    startRange: "sync",
    stepInit: "day",
    payLength: 14,
    fmtDate: "EEE, d MMM yy",
  },
  configSettings: {
    enableSlider: true,
    showSlider: false,
    show2ndSlider: true,
    showCurrent: true,
    showIconText: false,
    showMore: false,
    showMove: true,
    showExpand: true,
    showHelpIcon: false,
  },
  granularity: {
    daySettings: {
      showDay: true,
      fmtDay: "d-MMM",
      daySkip: 0,
    },
    weekSettings: {
      showWeek: true,
      weekStartDay: 1,
      weekSkip: 4,
      fmtWeek: "w",
    },
    paySettings: {
      showPay: false,
      paySkip: 4,
      payLength: 14,
      fmtPay: "d-MMM",
      payRefDay: new Date().getDate(),
      payRefYear: new Date().getFullYear(),
      payRefMonth: new Date().getMonth(),
      payRefDate: startOfToday(),
    },
    monthSettings: {
      showMonth: true,
      monthSkip: 1,
      fmtMonth: "MMMMM",
    },
    quarterSettings: {
      showQuarter: false,
      fmtQuarter: "QQQ",
      quarterSkip: 1,
    },
    yearSettings: {
      showYear: true,
      fmtYear: "yyyy",
      yearStartMonth: 0,
      yearSkip: 1,
    },
  },
};

const { granularity, calendarSettings, styleSettings, configSettings } =
  defaultSettings;

  const {
  daySettings,
  weekSettings,
  paySettings,
  monthSettings,
  quarterSettings,
  yearSettings,
} = granularity;

export const initialState: dateCardProps = {
  landingOn: true,
  rangeScope: {
    start: startOfYear(startOfToday()),
    end: endOfYear(startOfToday()),
  },
  weekStartDay: weekSettings.weekStartDay, // 0 = Sun
  yearStartMonth: yearSettings.yearStartMonth, // 0 = Jan
  stepInit: calendarSettings.stepInit,
  stepSkip: {
    day: daySettings.daySkip,
    week: weekSettings.weekSkip,
    pay: paySettings.paySkip,
    month: monthSettings.monthSkip,
    quarter: quarterSettings.quarterSkip,
    year: yearSettings.yearSkip,
  },
  stepViz: {
    day: daySettings.showDay,
    week: weekSettings.showWeek,
    pay: paySettings.showPay,
    month: monthSettings.showMonth,
    quarter: quarterSettings.showQuarter,
    year: yearSettings.showYear,
  },
  stepFmt: {
    day: daySettings.fmtDay,
    week: weekSettings.fmtWeek,
    pay: paySettings.fmtPay,
    month: monthSettings.fmtMonth,
    quarter: quarterSettings.fmtQuarter,
    year: yearSettings.fmtYear,
  },
  payProps: {
    desc: "Pay-Period",
    ref: new Date(
      paySettings.payRefYear,
      paySettings.payRefMonth,
      paySettings.payRefDay
    ),
    len: paySettings.payLength,
  },
  themeColor: styleSettings.themeColor,
  themeFont: styleSettings.themeFont,
  themeMode: styleSettings.themeMode,
  fontSize: styleSettings.fontSize,
  showCurrent: configSettings.showCurrent,
  showHelpIcon: configSettings.showHelpIcon,
  vizOpt: configSettings.showMore,
  showIconText: configSettings.showIconText,
  singleDay: calendarSettings.singleDay,
  showSlider: configSettings.showSlider,
  show2ndSlider: configSettings.show2ndSlider,
  showMove: configSettings.showMove,
  enableSlider: configSettings.enableSlider,
};
