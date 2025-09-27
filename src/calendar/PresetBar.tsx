import * as React from "react";
import styles from "../styles/buttons.module.css";
import { PresetDefinition } from "../types";

export interface PresetBarProps {
  presets: PresetDefinition[];
  selectedKey?: string;
  onSelect: (preset: PresetDefinition) => void;
  onClear: () => void;
  errors: Record<string, string | undefined>;
  orientation?: "horizontal" | "vertical";
  showClear?: boolean;
}

interface PresetGroup {
  key: string;
  label?: string;
  items: PresetDefinition[];
}

const groupPresets = (presets: PresetDefinition[]): PresetGroup[] => {
  const map = new Map<string, PresetGroup>();
  presets.forEach((preset) => {
    const groupKey = preset.group ?? "__ungrouped";
    if (!map.has(groupKey)) {
      map.set(groupKey, {
        key: groupKey,
        label: preset.group,
        items: [],
      });
    }
    map.get(groupKey)!.items.push(preset);
  });
  return Array.from(map.values());
};

export const PresetBar: React.FC<PresetBarProps> = ({
  presets,
  selectedKey,
  onSelect,
  onClear,
  errors,
  orientation = "horizontal",
  showClear = true,
}) => {
  const containerClassName = [
    styles.presetBar,
    orientation === "vertical" ? styles.presetBarVertical : styles.presetBarHorizontal,
  ]
    .filter(Boolean)
    .join(" ");

  const groupedPresets =
    orientation === "vertical"
      ? groupPresets(presets)
      : [
          {
            key: "__all",
            label: undefined,
            items: presets,
          },
        ];

  return (
    <div className={containerClassName}>
      {groupedPresets.map((group) => (
        <div key={group.key} className={styles.presetGroup} role="list">
          {group.label ? <div className={styles.presetGroupLabel}>{group.label}</div> : null}
          <div className={styles.presetGroupList} role="group">
            {group.items.map((preset) => {
              const isActive = preset.key === selectedKey;
              const error = errors[preset.key];
              const buttonClassName = [
                styles.presetButton,
                orientation === "vertical" ? styles.presetButtonBlock : "",
                isActive ? styles.presetButtonActive : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={preset.key}
                  type="button"
                  className={buttonClassName}
                  aria-pressed={isActive}
                  onClick={() => onSelect(preset)}
                  title={error ? `${preset.label}: ${error}` : preset.description ?? preset.label}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {showClear ? (
        <button type="button" className={styles.clearButton} onClick={onClear}>
          Clear
        </button>
      ) : null}
    </div>
  );
};
