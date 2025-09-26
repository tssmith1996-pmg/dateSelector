import * as React from "react";
import styles from "../styles/chips.module.css";
import { Chip } from "../types";

export interface ChipsBarProps {
  chips: Chip[];
  onRemove: (id: string) => void;
}

export const ChipsBar: React.FC<ChipsBarProps> = ({ chips, onRemove }) => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={styles.chipsBar} role="list">
      {chips.map((chip) => (
        <div key={chip.id} className={styles.chip} role="listitem">
          <span className={styles.chipLabel}>{chip.label}</span>
          <button
            type="button"
            className={styles.chipRemove}
            aria-label={`Remove ${chip.label}`}
            onClick={() => onRemove(chip.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
