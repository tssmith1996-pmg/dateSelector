import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

const { SimpleCard, ItemDropdown, NumUpDown, TextInput, ColorPicker, ToggleSwitch, Model } =
  formattingSettings;

export const PRESET_ITEMS = [
  { value: "today", displayName: "Today" },
  { value: "yesterday", displayName: "Yesterday" },
  { value: "last7", displayName: "Last 7 days" },
  { value: "last30", displayName: "Last 30 days" },
  { value: "thisMonth", displayName: "This month" },
  { value: "lastMonth", displayName: "Last month" },
  { value: "qtd", displayName: "Quarter to date" },
  { value: "ytd", displayName: "Year to date" },
  { value: "lastYear", displayName: "Last year" },
  { value: "custom", displayName: "Custom" },
];

export const PILL_STYLE_ITEMS = [
  { value: "compact", displayName: "Compact" },
  { value: "expanded", displayName: "Expanded" },
];

export class DefaultsCardSettings extends SimpleCard {
  public name = "defaults";
  public displayName = "Defaults";

  public defaultPreset = new ItemDropdown({
    name: "defaultPreset",
    displayName: "Default preset",
    items: PRESET_ITEMS,
    value: PRESET_ITEMS[2],
  });

  public weekStartsOn = new NumUpDown({
    name: "weekStartsOn",
    displayName: "Week starts on",
    value: 1,
    options: {
      minValue: { value: 0, type: powerbi.visuals.ValidatorType.Min },
      maxValue: { value: 6, type: powerbi.visuals.ValidatorType.Max },
    },
  });

  public locale = new TextInput({
    name: "locale",
    displayName: "Locale",
    value: "",
    placeholder: "en-US",
  });

  public slices = [this.defaultPreset, this.weekStartsOn, this.locale];
}

export class LimitsCardSettings extends SimpleCard {
  public name = "limits";
  public displayName = "Limits";

  public minDate = new TextInput({
    name: "minDate",
    displayName: "Minimum date",
    value: "",
    placeholder: "YYYY-MM-DD",
  });

  public maxDate = new TextInput({
    name: "maxDate",
    displayName: "Maximum date",
    value: "",
    placeholder: "YYYY-MM-DD",
  });

  public slices = [this.minDate, this.maxDate];
}

export class PillCardSettings extends SimpleCard {
  public name = "pill";
  public displayName = "Pill";

  public pillStyle = new ItemDropdown({
    name: "pillStyle",
    displayName: "Pill style",
    items: PILL_STYLE_ITEMS,
    value: PILL_STYLE_ITEMS[0],
  });

  public showPresetLabels = new ToggleSwitch({
    name: "showPresetLabels",
    displayName: "Show preset labels",
    value: true,
  });

  public pillBackgroundColor = new ColorPicker({
    name: "pillBackgroundColor",
    displayName: "Pill background",
    value: { value: "" },
  });

  public pillBorderColor = new ColorPicker({
    name: "pillBorderColor",
    displayName: "Pill border",
    value: { value: "" },
  });

  public pillTextColor = new ColorPicker({
    name: "pillTextColor",
    displayName: "Pill text",
    value: { value: "" },
  });

  public pillFontSize = new NumUpDown({
    name: "pillFontSize",
    displayName: "Pill font size",
    value: 12,
    options: {
      minValue: { value: 6, type: powerbi.visuals.ValidatorType.Min },
      maxValue: { value: 48, type: powerbi.visuals.ValidatorType.Max },
    },
  });

  public pillMinWidth = new NumUpDown({
    name: "pillMinWidth",
    displayName: "Pill minimum width",
    value: 260,
    options: {
      minValue: { value: 120, type: powerbi.visuals.ValidatorType.Min },
      maxValue: { value: 640, type: powerbi.visuals.ValidatorType.Max },
    },
  });

  public slices = [
    this.pillStyle,
    this.showPresetLabels,
    this.pillBackgroundColor,
    this.pillBorderColor,
    this.pillTextColor,
    this.pillFontSize,
    this.pillMinWidth,
  ];
}

export class ButtonsCardSettings extends SimpleCard {
  public name = "buttons";
  public displayName = "Buttons";

  public showQuickApply = new ToggleSwitch({
    name: "showQuickApply",
    displayName: "Show Today quick apply",
    value: false,
  });

  public showClear = new ToggleSwitch({
    name: "showClear",
    displayName: "Show Clear",
    value: true,
  });

  public slices = [this.showQuickApply, this.showClear];
}

export class PresetDateSlicerFormattingSettingsModel extends Model {
  public defaults = new DefaultsCardSettings();
  public limits = new LimitsCardSettings();
  public pill = new PillCardSettings();
  public buttons = new ButtonsCardSettings();

  public cards = [this.defaults, this.limits, this.pill, this.buttons];
}

export type PresetDateSlicerFormattingSettings = PresetDateSlicerFormattingSettingsModel;
