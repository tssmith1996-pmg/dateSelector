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
  styleCard = new styleSettings();
  calendarCard = new calendarSettings();
  configCard = new LayoutSettings();
  dayCard = new daySettings();
  weekCard = new weekSettings();
  payCard = new paySettings();
  monthCard = new monthSettings();
  quarterCard = new quarterSettings();
  yearCard = new yearSettings();

  // Add formatting settings card to cards list in model
  cards: Array<FormattingSettingsCard> = [
    this.styleCard,
    this.calendarCard,
    this.configCard,
    this.dayCard,
    this.weekCard,
    this.payCard,
    this.monthCard,
    this.quarterCard,
    this.yearCard,
  ];
}

class styleSettings extends FormattingSettingsCard {
  name: string = "style";
  description: string = "Visual look and feel";
  displayName: string = "Style";
  analyticsPane: boolean = false;
  uid: string = "styleUid";

  // Slices
  themeFont = new formattingSettings.AutoDropdown({
    name: "themeFont",
    description: "Font for text on this slicer",
    displayName: "Theme Font",
    value: defaultSettings.styleSettings.themeFont,
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
    description: "Slider and increment step intervals when a page is loaded",
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

class configSettings extends FormattingSettingsGroup {
  enableSlider = new formattingSettings.ToggleSwitch({
    name: "enableSlider",
    description: "Show the button to toggle timeline",
    displayName: "Enable Timeline",
    value: defaultSettings.configSettings.enableSlider,
  });

  showSlider = new formattingSettings.ToggleSwitch({
    name: "showSlider",
    description: "Show the timeline by default",
    displayName: "Timeline",
    value: defaultSettings.configSettings.showSlider,
  });

  show2ndSlider = new formattingSettings.ToggleSwitch({
    name: "show2ndSlider",
    description:
      "Show 2 sliders for mixed granularity & clarification of year for months, month for weeks, etc.",
    displayName: "2 timeline sliders",
    value: defaultSettings.configSettings.show2ndSlider,
  });

  showHelpIcon = new formattingSettings.ToggleSwitch({
    name: "showHelpIcon",
    description: "Show help button for optional extended tooltips.",
    displayName: "Help Icon",
    value: defaultSettings.configSettings.showHelpIcon,
  });

  name: string = "config";
  description: string = "Timeline controls to show or hide";
  displayName: string = "Timeline Toggle";
  analyticsPane: boolean = false;
  uid: string = "timelineUid";
   topLevelSlice: formattingSettings.SimpleSlice = this.enableSlider;

  slices: Array<FormattingSettingsSlice> = [
    this.showSlider,
    this.show2ndSlider,
    this.showHelpIcon,
  ];
}
class currentSettings extends FormattingSettingsGroup {

  showCurrent = new formattingSettings.ToggleSwitch({
    name: "showCurrent",
    description:
      "Show the Current Period Bar selector for Today, this week, this month, this year, etc.",
    displayName: "Current Periods",
    value: defaultSettings.configSettings.showCurrent,
  });

  showIconText = new formattingSettings.ToggleSwitch({
    name: "showIconText",
    description: "Show the Current Period selector icon text",
    displayName: "Current Icon Text",
    value: defaultSettings.configSettings.showIconText,
  });

  showMore = new formattingSettings.ToggleSwitch({
    name: "showMore",
    description:
      "Show the Extended Period selector for YTD, YT last nonth, etc.",
    displayName: "Extended Periods",
    value: defaultSettings.configSettings.showMore,
  });

  name: string = "config2";
  description: string = "Show the Current Period Bar selector for Today, this week, this month, this year, etc.";
  displayName: string = "Current Periods";
  analyticsPane: boolean = false;
  uid: string = "currentUid";
   topLevelSlice: formattingSettings.SimpleSlice = this.showCurrent;

  slices: Array<FormattingSettingsSlice> = [
    this.showIconText,
    this.showMore,
  ];
}
class moveSettings extends FormattingSettingsGroup {

  showMove = new formattingSettings.ToggleSwitch({
    name: "showMove",
    description:
      "Show the arrows and step levels to quickly move or extend/reduce the selected period by a chosen step.",
    displayName: "Show move arrows",
    value: defaultSettings.configSettings.showMove,

  });
  showExpand = new formattingSettings.ToggleSwitch({
    name: "showExpand",
    description:
      "Show the arrows and step levels to quickly extend/reduce the selected period by a chosen step.",
    displayName: "Expand arrows",
    value: defaultSettings.configSettings.showExpand,

  });

  name: string = "config1";
  description: string = "Show move or extend selected range controls";
  displayName: string = "Move arrows";
  analyticsPane: boolean = true;
  uid: string = "moveUid";
   topLevelSlice: formattingSettings.SimpleSlice = this.showMove;
   slices: Array<FormattingSettingsSlice> = [this.showExpand];
}

// Formatting settings card
class LayoutSettings extends FormattingSettingsCompositeCard {
  name: string = "config";
  displayName: string = "Layout";
    // Formatting settings slice

  analyticsPane: boolean = false;
  visible: boolean = true;
  configGroup = new configSettings(Object());
  configMove = new moveSettings(Object());
  configCurrent = new currentSettings(Object());
  groups: Array<FormattingSettingsGroup> = [this.configCurrent,this.configMove,this.configGroup];
}

class daySettings extends FormattingSettingsCard {
  showDay = new formattingSettings.ToggleSwitch({
    name: "showDay",
    displayName: undefined,
    value: defaultSettings.granularity.daySettings.showDay,
  });

  fmtDay = new formattingSettings.AutoDropdown({
    name: "fmtDay",
    displayName: "Day format (Today)",
    description: "The timeline format for day step level",
    value: defaultSettings.granularity.daySettings.fmtDay,
  });

  daySkip = new formattingSettings.NumUpDown({
    name: "daySkip",
    displayName: "# Day labels to skip",
    description:
      "Timeline only shows markers on days skipped by the number - 0 shows today only",
    value: defaultSettings.granularity.daySettings.daySkip,
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

class weekSettings extends FormattingSettingsCard {
  showWeek = new formattingSettings.ToggleSwitch({
    name: "showWeek",
    displayName: undefined,
    value: defaultSettings.granularity.weekSettings.showWeek,
  });

  fmtWeek = new formattingSettings.AutoDropdown({
    name: "fmtWeek",
    displayName: "Week format",
    description: "The timeline format for week step level",
    value: defaultSettings.granularity.weekSettings.fmtWeek,
  });

  weekSkip = new formattingSettings.NumUpDown({
    name: "weekSkip",
    displayName: "# Week labels to skip",
    description:
      "Timeline only shows markers on weeks skipped by the number - 0 shows today only",
    value: defaultSettings.granularity.weekSettings.weekSkip,
  });

  weekStartDay = new formattingSettings.AutoDropdown({
    name: "weekStartDay",
    description: "The start day for each week step",
    displayName: "Week Start Day",
    value: defaultSettings.granularity.weekSettings.weekStartDay,
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

class paySettings extends FormattingSettingsCard {
  showPay = new formattingSettings.ToggleSwitch({
    name: "showPay",
    displayName: undefined,
    value: defaultSettings.granularity.paySettings.showPay,
  });

  fmtPay = new formattingSettings.AutoDropdown({
    name: "fmtPay",
    displayName: "Pay Period format",
    description: "The timeline format for pay step level",
    value: defaultSettings.granularity.paySettings.fmtPay,
  });

  paySkip = new formattingSettings.NumUpDown({
    name: "paySkip",
    displayName: "# Pay labels to skip",
    description:
      "Timeline only shows markers on pay days skipped by the number - 0 shows today only",
    value: defaultSettings.granularity.paySettings.paySkip,
  });

  payLength = new formattingSettings.NumUpDown({
    name: "payLength",
    displayName: "Pay period length",
    description: "Pay period length in days",
    value: defaultSettings.granularity.paySettings.payLength,
  });

  payRefDay = new formattingSettings.NumUpDown({
    name: "payRefDay",
    displayName: "Reference date DAY",
    description:
      "Pay period seed reference date from which to start the repeating period",
    value: defaultSettings.granularity.paySettings.payRefDay,
  });

  payRefMonth = new formattingSettings.AutoDropdown({
    name: "payRefMonth",
    displayName: "Reference date MONTH",
    description:
      "Pay period seed reference date's month from which to start the repeating period",
    value: defaultSettings.granularity.paySettings.payRefMonth,
  });

  payRefYear = new formattingSettings.NumUpDown({
    name: "payRefYear",
    displayName: "Reference date YEAR",
    description:
      "Pay period seed reference date's year from which to start the repeating period",
    value: defaultSettings.granularity.paySettings.payRefYear,
  });

  // feature doesn't work
  payRefDate = new formattingSettings.DatePicker({
    placeholder: "Pay Period Reference Date",
    name: "payRefDate",
    displayName: "Pay period start",
    description:
      "Pay period seed reference date from which to start the repeating period",
    value: defaultSettings.granularity.paySettings.payRefDate,
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

class monthSettings extends FormattingSettingsCard {
  showMonth = new formattingSettings.ToggleSwitch({
    name: "showMonth",
    displayName: undefined,
    value: defaultSettings.granularity.monthSettings.showMonth,
  });

  fmtMonth = new formattingSettings.AutoDropdown({
    name: "fmtMonth",
    displayName: "Month Period format",
    description: "The timeline format for month step level",
    value: defaultSettings.granularity.monthSettings.fmtMonth,
  });

  monthSkip = new formattingSettings.NumUpDown({
    name: "monthSkip",
    displayName: "# Month labels to skip",
    description:
      "Timeline only shows markers on months skipped by the number - 0 shows today only",
    value: defaultSettings.granularity.monthSettings.monthSkip,
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

class quarterSettings extends FormattingSettingsCard {
  showQuarter = new formattingSettings.ToggleSwitch({
    name: "showQuarter",
    displayName: undefined,
    value: defaultSettings.granularity.quarterSettings.showQuarter,
  });

  fmtQuarter = new formattingSettings.AutoDropdown({
    name: "fmtQuarter",
    displayName: "Quarter Period format",
    description: "The timeline format for quarter step level",
    value: defaultSettings.granularity.quarterSettings.fmtQuarter,
  });

  quarterSkip = new formattingSettings.NumUpDown({
    name: "quarterSkip",
    displayName: "# Quarter labels to skip",
    description:
      "Timeline only shows markers on quarter boundaries skipped by the number - 0 shows today only",
    value: defaultSettings.granularity.quarterSettings.quarterSkip,
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

class yearSettings extends FormattingSettingsCard {
  showYear = new formattingSettings.ToggleSwitch({
    name: "showYear",
    displayName: undefined,
    value: defaultSettings.granularity.yearSettings.showYear,
  });

  fmtYear = new formattingSettings.AutoDropdown({
    name: "fmtYear",
    displayName: "Year Period format",
    description: "The timeline format for year step level",
    value: defaultSettings.granularity.yearSettings.fmtYear,
  });

  yearSkip = new formattingSettings.NumUpDown({
    name: "yearSkip",
    displayName: "# Year labels to skip",
    description:
      "Timeline only shows markers on years skipped by the number - 0 shows today only",
    value: defaultSettings.granularity.yearSettings.yearSkip,
  });

  yearStartMonth = new formattingSettings.AutoDropdown({
    name: "yearStartMonth",
    description: "Set the start month for the [Fiscal] year",
    displayName: "Fiscal Year Start",
    value: defaultSettings.granularity.yearSettings.yearStartMonth,
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
