import * as React from "react";
import styles from "../styles/calendar.module.css";

export interface PopupProps {
  anchorLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ anchorLabel, isOpen, onToggle, children }) => {
  return (
    <div className={styles.popupWrapper}>
      <button
        type="button"
        className={styles.toggleButton}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {anchorLabel}
      </button>
      {isOpen && (
        <div className={styles.popup} role="dialog" aria-modal="false">
          {children}
        </div>
      )}
    </div>
  );
};
