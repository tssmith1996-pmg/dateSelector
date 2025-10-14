import powerbi from "powerbi-visuals-api";
import { PresetLabelKey, VisualStrings } from "../types/localization";

const PRESET_RESOURCE_KEYS: Record<PresetLabelKey, string> = {
  today: "preset_today",
  yesterday: "preset_yesterday",
  last7: "preset_last7",
  last30: "preset_last30",
  lastWeek: "preset_lastWeek",
  thisMonth: "preset_thisMonth",
  lastMonth: "preset_lastMonth",
  mtd: "preset_mtd",
  qtd: "preset_qtd",
  ytd: "preset_ytd",
  lastYear: "preset_lastYear",
  custom: "preset_custom",
};

function resolveString(
  localizationManager: powerbi.extensibility.ILocalizationManager,
  key: string,
  fallback: string,
): string {
  try {
    const localized = localizationManager.getDisplayName(key);
    if (localized && localized !== key) {
      return localized;
    }
    return localized || fallback;
  } catch (error) {
    return fallback;
  }
}

export function getVisualStrings(localizationManager: powerbi.extensibility.ILocalizationManager): VisualStrings {
  const presetLabels = Object.entries(PRESET_RESOURCE_KEYS).reduce<Record<PresetLabelKey, string>>(
    (acc, [presetId, resourceKey]) => {
      const typedKey = presetId as PresetLabelKey;
      acc[typedKey] = resolveString(localizationManager, resourceKey, presetId);
      return acc;
    },
    {} as Record<PresetLabelKey, string>,
  );

  return {
    landing: {
      title: resolveString(localizationManager, "visual_landing_title", "Preset Date Slicer"),
      instructions: resolveString(
        localizationManager,
        "visual_landing_instructions",
        "Add a Date field to get started.",
      ),
      action: resolveString(
        localizationManager,
        "visual_landing_action",
        "Select a Date column in the Fields pane.",
      ),
    },
    pill: {
      ariaLabel: resolveString(
        localizationManager,
        "visual_pill_ariaLabel",
        "Open date range picker",
      ),
      disabledMessage: resolveString(
        localizationManager,
        "visual_pill_disabledMessage",
        "Interactions are disabled for this visual.",
      ),
    },
    popover: {
      heading: resolveString(localizationManager, "visual_popover_heading", "Date range"),
      presetLabel: resolveString(localizationManager, "visual_popover_presetLabel", "Preset"),
      presetAriaLabel: resolveString(
        localizationManager,
        "visual_popover_presetAriaLabel",
        "Date preset",
      ),
      quickApply: resolveString(localizationManager, "visual_popover_quickApply", "Today"),
      clear: resolveString(localizationManager, "visual_popover_clear", "Clear"),
      apply: resolveString(localizationManager, "visual_popover_apply", "Apply"),
    },
    presets: {
      appliedBadge: resolveString(localizationManager, "visual_presets_appliedBadge", "Applied"),
      listAriaLabel: resolveString(localizationManager, "visual_presets_listAria", "Date presets"),
    },
    calendar: {
      previousMonth: resolveString(localizationManager, "visual_calendar_prevMonth", "Previous month"),
      nextMonth: resolveString(localizationManager, "visual_calendar_nextMonth", "Next month"),
      ariaLabelTemplate: resolveString(
        localizationManager,
        "visual_calendar_ariaLabel",
        "Calendar for {0}",
      ),
    },
    dialog: {
      title: resolveString(localizationManager, "visual_dialog_title", "Select date range"),
    },
    tooltip: {
      label: resolveString(localizationManager, "visual_tooltip_label", "Selected range"),
    },
    presetLabels,
  };
}

export function formatTemplate(template: string, ...values: Array<string | number>): string {
  return values.reduce<string>((result, value, index) => {
    const token = `{${index}}`;
    return result.split(token).join(String(value));
  }, template);
}
