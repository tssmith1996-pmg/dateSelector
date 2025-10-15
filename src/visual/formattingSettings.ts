import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import type { ILocalizedItemMember } from "powerbi-visuals-utils-formattingmodel/lib/FormattingSettingsInterfaces";

const { SimpleCard, ItemDropdown, NumUpDown, ColorPicker, ToggleSwitch, Model } =
  formattingSettings;

export const PRESET_ITEMS = [
  { value: "today", displayNameKey: "preset_today", displayName: "Today" },
  { value: "yesterday", displayNameKey: "preset_yesterday", displayName: "Yesterday" },
  { value: "last7", displayNameKey: "preset_last7", displayName: "Last 7 days" },
  { value: "last30", displayNameKey: "preset_last30", displayName: "Last 30 days" },
  { value: "lastWeek", displayNameKey: "preset_lastWeek", displayName: "Last week" },
  { value: "thisMonth", displayNameKey: "preset_thisMonth", displayName: "This month" },
  { value: "lastMonth", displayNameKey: "preset_lastMonth", displayName: "Last month" },
  { value: "mtd", displayNameKey: "preset_mtd", displayName: "Month to date" },
  { value: "qtd", displayNameKey: "preset_qtd", displayName: "Quarter to date" },
  { value: "ytd", displayNameKey: "preset_ytd", displayName: "Year to date" },
  { value: "lastYear", displayNameKey: "preset_lastYear", displayName: "Last year" },
  { value: "custom", displayNameKey: "preset_custom", displayName: "Custom" },
];

export const PILL_STYLE_ITEMS = [
  { value: "compact", displayNameKey: "pill_style_compact", displayName: "Compact" },
  { value: "expanded", displayNameKey: "pill_style_expanded", displayName: "Expanded" },
];

export interface WeekStartDropdownItem extends ILocalizedItemMember {
  value: string;
  displayName?: string;
}

export const WEEK_START_ITEMS: WeekStartDropdownItem[] = [
  { value: "0", displayNameKey: "weekday_sun", displayName: "Sunday" },
  { value: "1", displayNameKey: "weekday_mon", displayName: "Monday" },
  { value: "2", displayNameKey: "weekday_tue", displayName: "Tuesday" },
  { value: "3", displayNameKey: "weekday_wed", displayName: "Wednesday" },
  { value: "4", displayNameKey: "weekday_thu", displayName: "Thursday" },
  { value: "5", displayNameKey: "weekday_fri", displayName: "Friday" },
  { value: "6", displayNameKey: "weekday_sat", displayName: "Saturday" },
];

export interface LocaleDropdownItem extends ILocalizedItemMember {
  value: string;
  displayName?: string;
}

export const LOCALE_ITEMS: LocaleDropdownItem[] = [
  { value: "en-AU", displayNameKey: "locale_en_AU", displayName: "English (Australia)" },
  { value: "en-US", displayNameKey: "locale_en_US", displayName: "English (United States)" },
  { value: "en-GB", displayNameKey: "locale_en_GB", displayName: "English (United Kingdom)" },
  { value: "fr-FR", displayNameKey: "locale_fr_FR", displayName: "French (France)" },
  { value: "de-DE", displayNameKey: "locale_de_DE", displayName: "German (Germany)" },
  { value: "es-ES", displayNameKey: "locale_es_ES", displayName: "Spanish (Spain)" },
  { value: "it-IT", displayNameKey: "locale_it_IT", displayName: "Italian (Italy)" },
  { value: "ja-JP", displayNameKey: "locale_ja_JP", displayName: "Japanese (Japan)" },
  { value: "zh-CN", displayNameKey: "locale_zh_CN", displayName: "Chinese (China)" },
];

export class DefaultsCardSettings extends SimpleCard {
  public name = "defaults";
  public displayNameKey = "format_defaults_displayName";
  public displayName = "Defaults";

  public defaultPreset = new ItemDropdown({
    name: "defaultPreset",
    displayNameKey: "format_defaults_defaultPreset",
    displayName: "Default preset",
    items: PRESET_ITEMS,
    value: PRESET_ITEMS[2],
  });

  public weekStartsOn = new ItemDropdown({
    name: "weekStartsOn",
    displayNameKey: "format_defaults_weekStartsOn",
    displayName: "Week starts on",
    items: WEEK_START_ITEMS,
    value: WEEK_START_ITEMS[1],
  });

  public locale = new ItemDropdown({
    name: "locale",
    displayNameKey: "format_defaults_locale",
    displayName: "Locale",
    items: LOCALE_ITEMS,
    value: LOCALE_ITEMS[0],
  });

  public slices = [this.defaultPreset, this.weekStartsOn, this.locale];
}

export class PillCardSettings extends SimpleCard {
  public name = "pill";
  public displayNameKey = "format_pill_displayName";
  public displayName = "Pill";

  public pillStyle = new ItemDropdown({
    name: "pillStyle",
    displayNameKey: "format_pill_pillStyle",
    displayName: "Pill style",
    items: PILL_STYLE_ITEMS,
    value: PILL_STYLE_ITEMS[0],
  });

  public showPresetLabels = new ToggleSwitch({
    name: "showPresetLabels",
    displayNameKey: "format_pill_showPresetLabels",
    displayName: "Show preset labels",
    value: true,
  });

  public pillBackgroundColor = new ColorPicker({
    name: "pillBackgroundColor",
    displayNameKey: "format_pill_background",
    displayName: "Pill background",
    value: { value: "#ffffff" },
  });

  public pillBorderColor = new ColorPicker({
    name: "pillBorderColor",
    displayNameKey: "format_pill_border",
    displayName: "Pill border",
    value: { value: "" },
  });

  public pillTextColor = new ColorPicker({
    name: "pillTextColor",
    displayNameKey: "format_pill_text",
    displayName: "Pill text",
    value: { value: "#000000" },
  });

  public pillFontSize = new NumUpDown({
    name: "pillFontSize",
    displayNameKey: "format_pill_fontSize",
    displayName: "Pill font size",
    value: 12,
    options: {
      minValue: { value: 6, type: powerbi.visuals.ValidatorType.Min },
      maxValue: { value: 48, type: powerbi.visuals.ValidatorType.Max },
    },
  });

  public pillMinWidth = new NumUpDown({
    name: "pillMinWidth",
    displayNameKey: "format_pill_minWidth",
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
  public displayNameKey = "format_buttons_displayName";
  public displayName = "Buttons";

  public showQuickApply = new ToggleSwitch({
    name: "showQuickApply",
    displayNameKey: "format_buttons_showQuickApply",
    displayName: "Show Today quick apply",
    value: false,
  });

  public showClear = new ToggleSwitch({
    name: "showClear",
    displayNameKey: "format_buttons_showClear",
    displayName: "Show Clear",
    value: true,
  });

  public slices = [this.showQuickApply, this.showClear];
}

export class PresetDateSlicerFormattingSettingsModel extends Model {
  public defaults = new DefaultsCardSettings();
  public pill = new PillCardSettings();
  public buttons = new ButtonsCardSettings();

  public cards = [this.defaults, this.pill, this.buttons];
}

export type PresetDateSlicerFormattingSettings = PresetDateSlicerFormattingSettingsModel;
