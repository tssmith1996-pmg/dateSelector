/*
 *  Power BI Visualization Settings
 *  Date Range Selector
 */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
import FormattingSettingsGroup = formattingSettings.Group;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

import { defaultSettings } from "./initstate";

export class VisualSettingsModel extends FormattingSettingsModel {
  // Building visual formatting settings card
  styleSettings = new styleSettings();
  calendarSettings = new calendarSettings();
  layoutSettings = new layoutSettings();
  // daySettings = new daySettings();
  // weekSettings = new weekSettings();
  // paySettings = new paySettings();
  // monthSettings = new monthSettings();
  // quarterSettings = new quarterSettings();
  // yearSettings = new yearSettings();
  periodSettings = new periodSettings();

  // Add formatting settings card to cards list in model
  cards: Array<FormattingSettingsCard> = [
    this.styleSettings,
    this.calendarSettings,
    this.layoutSettings,
    this.periodSettings,

    // this.daySettings,
    // this.weekSettings,
    // this.paySettings,
    // this.monthSettings,
    // this.quarterSettings,
    // this.yearSettings,
  ];
}

class styleSettings extends FormattingSettingsCard {
  name: string = "style";
  description: string = "Visual look and feel";
  displayName: string = "Style";
  analyticsPane: boolean = false;
  uid: string = "styleUid";

  // Slices
  themeFont = new formattingSettings.FontPicker({
    name: "themeFont",
    description: "Font for text on this slicer",
    displayName: "Theme Font",
    value: "wf_standard-font, helvetica, arial, sans-serif",
  });
  fontSize = new formattingSettings.AutoDropdown({
    name: "fontSize",
    description: "Font size for text on this slicer",
    displayName: "Font Size",
    value: defaultSettings.styleSettings.fontSize,
  });
  themeMode = new formattingSettings.AutoDropdown({
    name: "themeMode",
    description: "Theme mode dark background",
    displayName: "Mode",
    value: defaultSettings.styleSettings.themeMode,
  });
  themeColor = new formattingSettings.ColorPicker({
    name: "themeColor",
    displayName: "Theme color",
    value: { value: defaultSettings.styleSettings.themeColor },
  });

  // not implemented
  fmtDate = new formattingSettings.AutoDropdown({
    name: "fmtDate",
    description: "Date format of the input fields",
    displayName: "Date Input Format",
    value: defaultSettings.styleSettings.fmtDate,
  });

  slices: Array<FormattingSettingsSlice> = [
    this.themeFont,
    this.fontSize,
    this.themeColor,
    this.themeMode,
  ];
}

class calendarSettings extends FormattingSettingsCard {
  name: string = "calendar";
  description: string =
    "Calendar stuff like Year Setup (Financial/Calendar), Week start day, etc.";
  displayName: string = "Range options";
  analyticsPane: boolean = false;
  uid: string = "calendarUid";

  startRange = new formattingSettings.AutoDropdown({
    name: "startRange",
    description:
      "Default date range when a page is loaded - predominant unless 'Sync'",
    displayName: "Start Range",
    value: defaultSettings.calendarSettings.startRange,
  });
  // Slices
  stepInit = new formattingSettings.AutoDropdown({
    name: "stepInit",
    description:
      "Timeline and increment step label intervals when a page is loaded",
    displayName: "Step Level",
    value: defaultSettings.calendarSettings.stepInit,
  });

  singleDay = new formattingSettings.ToggleSwitch({
    name: "singleDay",
    description:
      "Allow only single day selection (or beginning of period where day steps are not selected).",
    displayName: "Single Day Only",
    value: defaultSettings.calendarSettings.singleDay,
  });

  slices: Array<FormattingSettingsSlice> = [
    this.singleDay,
    this.startRange,
    this.stepInit,
  ];
}

class timelineSettings extends FormattingSettingsGroup {
  enableSlider = new formattingSettings.ToggleSwitch({
    name: "enableSlider",
    description: "Show the button to toggle timeline",
    displayName: "Enable Timeline",
    value: defaultSettings.layoutSettings.timelineSettings.enableSlider,
  });

  showSlider = new formattingSettings.ToggleSwitch({
    name: "showSlider",
    description: "Show the timeline at startup",
    displayName: "Show Timeline",
    value: defaultSettings.layoutSettings.timelineSettings.showSlider,
  });

  show2ndSlider = new formattingSettings.ToggleSwitch({
    name: "show2ndSlider",
    description:
      "Show 2 scales for mixed period & clarification of year for months, month for weeks, etc.",
    displayName: "2nd timeline scale",
    value: defaultSettings.layoutSettings.timelineSettings.show2ndSlider,
  });

  name: string = "timeline";
  description: string = "Timeline controls to show or hide";
  displayName: string = "Timeline Toggle";
  analyticsPane: boolean = false;
  uid: string = "timelineUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.enableSlider;

  slices: Array<FormattingSettingsSlice> = [
    this.showSlider,
    this.show2ndSlider,
    // this.showHelpIcon,
  ];
}
class currentSettings extends FormattingSettingsGroup {
  showCurrent = new formattingSettings.ToggleSwitch({
    name: "showCurrent",
    description:
      "Show the Current Period Bar selector for Today, this week, this month, this year, etc.",
    displayName: "Current Periods",
    value: defaultSettings.layoutSettings.currentSettings.showCurrent,
  });

  showIconText = new formattingSettings.ToggleSwitch({
    name: "showIconText",
    description: "Show the Current Period selector icon text",
    displayName: "Current Icon Text",
    value: defaultSettings.layoutSettings.currentSettings.showIconText,
  });

  showMore = new formattingSettings.ToggleSwitch({
    name: "showMore",
    description:
      "Show the Extended Period selector for YTD, YT last nonth, etc.",
    displayName: "Extended Periods",
    value: defaultSettings.layoutSettings.currentSettings.showMore,
  });

  name: string = "current";
  description: string =
    "Show the Current Period Bar selector for Today, this week, this month, this year, etc.";
  displayName: string = "Current Periods";
  analyticsPane: boolean = false;
  uid: string = "currentUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showCurrent;

  slices: Array<FormattingSettingsSlice> = [this.showIconText, this.showMore];
}
class moveSettings extends FormattingSettingsGroup {
  showMove = new formattingSettings.ToggleSwitch({
    name: "showMove",
    description:
      "Show the arrows and step levels to quickly move or extend/reduce the selected period by a chosen step.",
    displayName: "Show move arrows",
    value: defaultSettings.layoutSettings.moveSettings.showMove,
  });
  showExpand = new formattingSettings.ToggleSwitch({
    name: "showExpand",
    description:
      "Show the arrows and step levels to quickly extend/reduce the selected period by a chosen step.",
    displayName: "Extend  << >>",
    value: defaultSettings.layoutSettings.moveSettings.showExpand,
  });

  name: string = "move";
  description: string = "Show move or extend selected range controls";
  displayName: string = "Move arrows";
  analyticsPane: boolean = true;
  uid: string = "moveUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showMove;
  slices: Array<FormattingSettingsSlice> = [this.showExpand];
}

class helpSettings extends FormattingSettingsCard {
  showHelpIcon = new formattingSettings.ToggleSwitch({
    name: "showHelpIcon",
    description: "Show help button for optional extended tooltips.",
    displayName: "Help Toggle",
    value: defaultSettings.layoutSettings.helpSettings.showHelpIcon,
  });

  name: string = "layout";
  displayName: string = "Assist";
  // Formatting settings slice
  analyticsPane: boolean = false;
  visible: boolean = true;

  slices: Array<FormattingSettingsSlice> = [this.showHelpIcon];
}

// Formatting settings card
class layoutSettings extends FormattingSettingsCompositeCard {
  name: string = "layout";
  displayName: string = "Layout";
  // Formatting settings slice
  analyticsPane: boolean = false;
  visible: boolean = true;

  layoutTimeline = new timelineSettings(Object());
  layoutMove = new moveSettings(Object());
  layoutCurrent = new currentSettings(Object());
  layoutHelp = new helpSettings();
  groups: Array<FormattingSettingsGroup> = [
    this.layoutCurrent,
    this.layoutMove,
    this.layoutTimeline,
    this.layoutHelp,
  ];
}

class daySettings extends FormattingSettingsGroup {
  showDay = new formattingSettings.ToggleSwitch({
    name: "showDay",
    displayName: undefined,
    value: defaultSettings.period.daySettings.showDay,
  });

  fmtDay = new formattingSettings.AutoDropdown({
    name: "fmtDay",
    displayName: "Day format (Today)",
    description: "The timeline format for day step level",
    value: defaultSettings.period.daySettings.fmtDay,
  });

  daySkip = new formattingSettings.NumUpDown({
    name: "daySkip",
    displayName: "Day label intervals",
    description:
      "Timeline only shows markers on days skipped by the number - 0 shows today only",
    value: defaultSettings.period.daySettings.daySkip,
  });

  name: string = "day";
  description: string =
    "Show the Today button on the Step Bar & Current Period Bar";
  displayName: string = "Day";
  analyticsPane: boolean = false;
  uid: string = "dayUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showDay;

  slices: Array<FormattingSettingsSlice> = [this.daySkip, this.fmtDay];
}

class weekSettings extends FormattingSettingsGroup {
  showWeek = new formattingSettings.ToggleSwitch({
    name: "showWeek",
    displayName: undefined,
    value: defaultSettings.period.weekSettings.showWeek,
  });

  fmtWeek = new formattingSettings.AutoDropdown({
    name: "fmtWeek",
    displayName: "Week format",
    description: "The timeline format for week step level",
    value: defaultSettings.period.weekSettings.fmtWeek,
  });

  weekSkip = new formattingSettings.NumUpDown({
    name: "weekSkip",
    displayName: "Week label intervals",
    description:
      "Timeline only shows markers on weeks skipped by the number - 0 shows today only",
    value: defaultSettings.period.weekSettings.weekSkip,
  });

  weekStartDay = new formattingSettings.AutoDropdown({
    name: "weekStartDay",
    description: "The start day for each week step",
    displayName: "Week Start Day",
    value: defaultSettings.period.weekSettings.weekStartDay,
  });

  name: string = "week";
  description: string =
    "Show the Week buttons on the Step Bar & Current Period Bar";
  displayName: string = "Week";
  analyticsPane: boolean = false;
  uid: string = "weekUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showWeek;

  slices: Array<FormattingSettingsSlice> = [
    this.weekStartDay,
    this.weekSkip,
    this.fmtWeek,
  ];
}

class paySettings extends FormattingSettingsGroup {
  showPay = new formattingSettings.ToggleSwitch({
    name: "showPay",
    displayName: undefined,
    value: defaultSettings.period.paySettings.showPay,
  });

  fmtPay = new formattingSettings.AutoDropdown({
    name: "fmtPay",
    displayName: "Pay Period format",
    description: "The timeline format for pay step level",
    value: defaultSettings.period.paySettings.fmtPay,
  });

  paySkip = new formattingSettings.NumUpDown({
    name: "paySkip",
    displayName: "Pay label intervals",
    description:
      "Timeline only shows markers on pay days skipped by the number - 0 shows today only",
    value: defaultSettings.period.paySettings.paySkip,
  });

  payLength = new formattingSettings.NumUpDown({
    name: "payLength",
    displayName: "Pay period length",
    description: "Pay period length in days",
    value: defaultSettings.period.paySettings.payLength,
  });

  payRefDay = new formattingSettings.NumUpDown({
    name: "payRefDay",
    displayName: "Reference date DAY",
    description:
      "Pay period seed reference date from which to start the repeating period",
    value: defaultSettings.period.paySettings.payRefDay,
  });

  payRefMonth = new formattingSettings.AutoDropdown({
    name: "payRefMonth",
    displayName: "Reference date MONTH",
    description:
      "Pay period seed reference date's month from which to start the repeating period",
    value: defaultSettings.period.paySettings.payRefMonth,
  });

  payRefYear = new formattingSettings.NumUpDown({
    name: "payRefYear",
    displayName: "Reference date YEAR",
    description:
      "Pay period seed reference date's year from which to start the repeating period",
    value: defaultSettings.period.paySettings.payRefYear,
  });

  // feature doesn't work
  payRefDate = new formattingSettings.DatePicker({
    placeholder: "Pay Period Reference Date",
    name: "payRefDate",
    displayName: "Pay period start",
    description:
      "Pay period seed reference date from which to start the repeating period",
    value: defaultSettings.period.paySettings.payRefDate,
  });

  name: string = "pay";
  description: string =
    "Show the Pay buttons on the Step Bar & Current Period Bar";
  displayName: string = "Pay";
  analyticsPane: boolean = false;
  uid: string = "payUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showPay;

  slices: Array<FormattingSettingsSlice> = [
    this.paySkip,
    this.fmtPay,
    this.payLength,
    this.payRefYear,
    this.payRefMonth,
    this.payRefDay,
  ];
}

class monthSettings extends FormattingSettingsGroup {
  showMonth = new formattingSettings.ToggleSwitch({
    name: "showMonth",
    displayName: undefined,
    value: defaultSettings.period.monthSettings.showMonth,
  });

  fmtMonth = new formattingSettings.AutoDropdown({
    name: "fmtMonth",
    displayName: "Month Period format",
    description: "The timeline format for month step level",
    value: defaultSettings.period.monthSettings.fmtMonth,
  });

  monthSkip = new formattingSettings.NumUpDown({
    name: "monthSkip",
    displayName: "Month label intervals",
    description:
      "Timeline only shows markers on months skipped by the number - 0 shows today only",
    value: defaultSettings.period.monthSettings.monthSkip,
  });

  name: string = "month";
  description: string =
    "Show the Month buttons on the Step Bar & Current Period Bar";
  displayName: string = "Month";
  analyticsPane: boolean = false;
  uid: string = "monthUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showMonth;

  slices: Array<FormattingSettingsSlice> = [this.monthSkip, this.fmtMonth];
}

class quarterSettings extends FormattingSettingsGroup {
  showQuarter = new formattingSettings.ToggleSwitch({
    name: "showQuarter",
    displayName: undefined,
    value: defaultSettings.period.quarterSettings.showQuarter,
  });

  fmtQuarter = new formattingSettings.AutoDropdown({
    name: "fmtQuarter",
    displayName: "Quarter Period format",
    description: "The timeline format for quarter step level",
    value: defaultSettings.period.quarterSettings.fmtQuarter,
  });

  quarterSkip = new formattingSettings.NumUpDown({
    name: "quarterSkip",
    displayName: "Quarter label intervals",
    description:
      "Timeline only shows markers on quarter boundaries skipped by the number - 0 shows today only",
    value: defaultSettings.period.quarterSettings.quarterSkip,
  });

  name: string = "quarter";
  description: string =
    "Show the Quarter buttons on the Step Bar & Current Period Bar";
  displayName: string = "Quarter";
  analyticsPane: boolean = false;
  uid: string = "quarterUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showQuarter;

  slices: Array<FormattingSettingsSlice> = [this.quarterSkip, this.fmtQuarter];
}

class yearSettings extends FormattingSettingsGroup {
  showYear = new formattingSettings.ToggleSwitch({
    name: "showYear",
    displayName: undefined,
    value: defaultSettings.period.yearSettings.showYear,
  });

  fmtYear = new formattingSettings.AutoDropdown({
    name: "fmtYear",
    displayName: "Year Period format",
    description: "The timeline format for year step level",
    value: defaultSettings.period.yearSettings.fmtYear,
  });

  yearSkip = new formattingSettings.NumUpDown({
    name: "yearSkip",
    displayName: "Year label intervals",
    description:
      "Timeline only shows markers on years skipped by the number - 0 shows today only",
    value: defaultSettings.period.yearSettings.yearSkip,
  });

  yearStartMonth = new formattingSettings.AutoDropdown({
    name: "yearStartMonth",
    description: "Set the start month for the [Fiscal] year",
    displayName: "Fiscal Year Start",
    value: defaultSettings.period.yearSettings.yearStartMonth,
  });

  name: string = "year";
  description: string =
    "Show the Year buttons on the Step Bar & Current Period Bar";
  displayName: string = "Year";
  analyticsPane: boolean = false;
  uid: string = "yearUid";
  topLevelSlice: formattingSettings.SimpleSlice = this.showYear;

  slices: Array<FormattingSettingsSlice> = [
    this.yearStartMonth,
    this.yearSkip,
    this.fmtYear,
  ];
}

class periodSettings extends FormattingSettingsCompositeCard {
  name: string = "period";
  displayName: string = "Granularity";
  // Formatting settings slice
  analyticsPane: boolean = false;
  visible: boolean = true;

  periodDay                         = new daySettings(Object());
  periodWeek                        = new weekSettings(Object());
  periodPay                         = new paySettings(Object());
  periodMonth                       = new monthSettings(Object());
  periodQuarter                     = new quarterSettings(Object());
  periodYear                        = new yearSettings(Object());
  groups: Array<FormattingSettingsGroup> = [
this.periodDay,
this.periodWeek,
this.periodPay,
this.periodMonth,
this.periodQuarter,
this.periodYear
  ];
}
