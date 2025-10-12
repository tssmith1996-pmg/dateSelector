import React from "react";
import { DatePreset } from "../date";
import "../styles/presets.css";

export type PresetsProps = {
  presets: DatePreset[];
  selectedPresetId: string;
  committedPresetId: string;
  onPresetSelect: (presetId: string) => void;
};

export const Presets: React.FC<PresetsProps> = ({ presets, selectedPresetId, committedPresetId, onPresetSelect }) => {
  return (
    <div className="presets" role="listbox" aria-label="Date presets">
      {presets.map((preset) => {
        const isSelected = preset.id === selectedPresetId;
        const isCommitted = preset.id === committedPresetId;
        const classes = ["presets__item"];
        if (isSelected) classes.push("presets__item--selected");
        if (isCommitted) classes.push("presets__item--committed");
        return (
          <button
            key={preset.id}
            type="button"
            className={classes.join(" ")}
            role="option"
            aria-selected={isSelected}
            onClick={() => onPresetSelect(preset.id)}
          >
            <span className="presets__label">{preset.label}</span>
            {isCommitted && <span className="presets__badge">Applied</span>}
          </button>
        );
      })}
    </div>
  );
};
