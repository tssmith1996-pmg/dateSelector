import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import type { ILocalizedItemMember } from "powerbi-visuals-utils-formattingmodel/lib/FormattingSettingsInterfaces";

const { SimpleCard, ItemDropdown, NumUpDown, ColorPicker, ToggleSwitch, Model } =
  formattingSettings;

export const PRESET_ITEMS = [
  { value: "today", displayNameKey: "preset_today" },
  { value: "yesterday", displayNameKey: "preset_yesterday" },
  { value: "last7", displayNameKey: "preset_last7" },
  { value: "last30", displayNameKey: "preset_last30" },
  { value: "lastWeek", displayNameKey: "preset_lastWeek" },
  { value: "thisMonth", displayNameKey: "preset_thisMonth" },
  { value: "lastMonth", displayNameKey: "preset_lastMonth" },
  { value: "mtd", displayNameKey: "preset_mtd" },
  { value: "qtd", displayNameKey: "preset_qtd" },
  { value: "ytd", displayNameKey: "preset_ytd" },
  { value: "lastYear", displayNameKey: "preset_lastYear" },
  { value: "custom", displayNameKey: "preset_custom" },
];

export const PILL_STYLE_ITEMS = [
  { value: "compact", displayNameKey: "pill_style_compact" },
  { value: "expanded", displayNameKey: "pill_style_expanded" },
];

export type WeekStartDropdownItem = ILocalizedItemMember & { value: string };

export const WEEK_START_ITEMS: WeekStartDropdownItem[] = [
  { value: "0", displayNameKey: "weekday_sun" },
  { value: "1", displayNameKey: "weekday_mon" },
  { value: "2", displayNameKey: "weekday_tue" },
  { value: "3", displayNameKey: "weekday_wed" },
  { value: "4", displayNameKey: "weekday_thu" },
  { value: "5", displayNameKey: "weekday_fri" },
  { value: "6", displayNameKey: "weekday_sat" },
];

export type LocaleDropdownItem = ILocalizedItemMember & { value: string };

export const LOCALE_ITEMS: LocaleDropdownItem[] = [
  { value: "en-AU", displayNameKey: "locale_en_AU" },
  { value: "en-US", displayNameKey: "locale_en_US" },
  { value: "en-GB", displayNameKey: "locale_en_GB" },
  { value: "fr-FR", displayNameKey: "locale_fr_FR" },
  { value: "de-DE", displayNameKey: "locale_de_DE" },
  { value: "es-ES", displayNameKey: "locale_es_ES" },
  { value: "it-IT", displayNameKey: "locale_it_IT" },
  { value: "ja-JP", displayNameKey: "locale_ja_JP" },
  { value: "zh-CN", displayNameKey: "locale_zh_CN" },
];

export class DefaultsCardSettings extends SimpleCard {
  public name = "defaults";
  public displayNameKey = "format_defaults_displayName";

  public defaultPreset = new ItemDropdown({
    name: "defaultPreset",
    displayNameKey: "format_defaults_defaultPreset",
    items: PRESET_ITEMS,
    value: PRESET_ITEMS[2],
  });

  public weekStartsOn = new ItemDropdown({
    name: "weekStartsOn",
    displayNameKey: "format_defaults_weekStartsOn",
    items: WEEK_START_ITEMS,
    value: WEEK_START_ITEMS[1],
  });

  public locale = new ItemDropdown({
    name: "locale",
    displayNameKey: "format_defaults_locale",
    items: LOCALE_ITEMS,
    value: LOCALE_ITEMS[0],
  });

  public slices = [this.defaultPreset, this.weekStartsOn, this.locale];
}

export class PillCardSettings extends SimpleCard {
  public name = "pill";
  public displayNameKey = "format_pill_displayName";

  public pillStyle = new ItemDropdown({
    name: "pillStyle",
    displayNameKey: "format_pill_pillStyle",
    items: PILL_STYLE_ITEMS,
    value: PILL_STYLE_ITEMS[0],
  });

  public showPresetLabels = new ToggleSwitch({
    name: "showPresetLabels",
    displayNameKey: "format_pill_showPresetLabels",
    value: true,
  });

  public pillBackgroundColor = new ColorPicker({
    name: "pillBackgroundColor",
    displayNameKey: "format_pill_background",
    value: { value: "" },
  });

  public pillBorderColor = new ColorPicker({
    name: "pillBorderColor",
    displayNameKey: "format_pill_border",
    value: { value: "" },
  });

  public pillTextColor = new ColorPicker({
    name: "pillTextColor",
    displayNameKey: "format_pill_text",
    value: { value: "" },
  });

  public pillFontSize = new NumUpDown({
    name: "pillFontSize",
    displayNameKey: "format_pill_fontSize",
    value: 12,
    options: {
      minValue: { value: 6, type: powerbi.visuals.ValidatorType.Min },
      maxValue: { value: 48, type: powerbi.visuals.ValidatorType.Max },
    },
  });

  public pillMinWidth = new NumUpDown({
    name: "pillMinWidth",
    displayNameKey: "format_pill_minWidth",
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

  public showQuickApply = new ToggleSwitch({
    name: "showQuickApply",
    displayNameKey: "format_buttons_showQuickApply",
    value: false,
  });

  public showClear = new ToggleSwitch({
    name: "showClear",
    displayNameKey: "format_buttons_showClear",
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
