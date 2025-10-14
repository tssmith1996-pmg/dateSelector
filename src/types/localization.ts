export type PresetLabelKey =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "mtd"
  | "qtd"
  | "ytd"
  | "lastYear"
  | "custom";

export type VisualStrings = {
  landing: {
    title: string;
    instructions: string;
    action: string;
  };
  pill: {
    ariaLabel: string;
    disabledMessage: string;
  };
  manualEntry: {
    startLabel: string;
    endLabel: string;
    formatHint: string;
    invalidDate: string;
  };
  popover: {
    heading: string;
    presetLabel: string;
    presetAriaLabel: string;
    quickApply: string;
    clear: string;
    apply: string;
  };
  presets: {
    appliedBadge: string;
    listAriaLabel: string;
  };
  calendar: {
    previousMonth: string;
    nextMonth: string;
    ariaLabelTemplate: string;
  };
  dialog: {
    title: string;
  };
  tooltip: {
    label: string;
  };
  presetLabels: Record<PresetLabelKey, string>;
};
