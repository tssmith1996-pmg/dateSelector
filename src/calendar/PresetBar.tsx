import * as React from "react";
import styles from "../styles/buttons.module.css";
import { PresetDefinition } from "../types";

export interface PresetBarProps {
  presets: PresetDefinition[];
  selectedKey?: string;
  onSelect: (preset: PresetDefinition) => void;
  onClear: () => void;
  errors: Record<string, string | undefined>;
}

export const PresetBar: React.FC<PresetBarProps> = ({
  presets,
  selectedKey,
  onSelect,
  onClear,
  errors,
}) => {
  return (
    <div className={styles.presetBar} role="list">
      {presets.map((preset) => {
        const isActive = preset.key === selectedKey;
        const error = errors[preset.key];
        return (
          <button
            key={preset.key}
            type="button"
            className={`${styles.presetButton} ${isActive ? styles.presetButtonActive : ""}`.trim()}
            aria-pressed={isActive}
            onClick={() => onSelect(preset)}
            title={error ? `${preset.label}: ${error}` : preset.description ?? preset.label}
          >
            {preset.label}
          </button>
        );
      })}
      <button type="button" className={styles.clearButton} onClick={onClear}>
        Clear
      </button>
    </div>
  );
};
