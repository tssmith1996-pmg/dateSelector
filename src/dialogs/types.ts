export type SerializableRange = {
  from: string;
  to: string;
};

export type DateRangeDialogInitialState = {
  range: SerializableRange;
  presetId: string;
  dataMin?: string;
  dataMax?: string;
  presetIds?: string[];
  locale?: string;
  weekStartsOn?: number;
  showPresetLabels?: boolean;
  showQuickApply?: boolean;
  showClear?: boolean;
  defaultPresetId?: string;
  defaultRange?: SerializableRange;
  strings: import("../types/localization").VisualStrings;
};

export type DateRangeDialogResult = {
  range: SerializableRange;
  presetId: string;
};
