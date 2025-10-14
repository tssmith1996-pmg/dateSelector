import React, { useEffect, useRef } from "react";
import { DatePreset } from "../date";
import { DateRange } from "../types/dateRange";
import { Calendar } from "./Calendar";
import { Presets } from "./Presets";
import "../styles/popover.css";

export type PopoverProps = {
  range: DateRange;
  presetId: string;
  committedPresetId: string;
  presets: DatePreset[];
  locale: string;
  dataMin?: Date;
  dataMax?: Date;
  onPresetSelect: (presetId: string) => void;
  onRangeChange: (range: DateRange) => void;
  onApply: () => void;
  onClear?: () => void;
  onClose: () => void;
  showQuickApply?: boolean;
  onQuickApply?: () => void;
  showClear?: boolean;
  showPresetLabels?: boolean;
  weekStartsOn?: number;
};

export const Popover: React.FC<PopoverProps> = ({
  range,
  presetId,
  committedPresetId,
  presets,
  locale,
  dataMin,
  dataMax,
  onPresetSelect,
  onRangeChange,
  onApply,
  onClear,
  onClose,
  showQuickApply = false,
  onQuickApply,
  showClear = true,
  showPresetLabels = true,
  weekStartsOn,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActive.current = document.activeElement as HTMLElement | null;
    const focusable = getFocusable(containerRef.current);
    focusable[0]?.focus();

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        onClose();
      }
    };

    const doc = containerRef.current?.ownerDocument ?? document;
    doc.addEventListener("mousedown", handlePointerDown);
    doc.addEventListener("touchstart", handlePointerDown);

    return () => {
      doc.removeEventListener("mousedown", handlePointerDown);
      doc.removeEventListener("touchstart", handlePointerDown);
      previousActive.current?.focus();
    };
  }, [onClose]);

  const handleSentinelFocus = (position: "start" | "end") => {
    const focusable = getFocusable(containerRef.current);
    if (focusable.length === 0) {
      return;
    }
    if (position === "start") {
      focusable[focusable.length - 1].focus();
    } else {
      focusable[0].focus();
    }
  };

  return (
    <div className="popover" role="dialog" aria-modal="true" aria-labelledby="date-range-heading" ref={containerRef}>
      <span tabIndex={0} className="popover__sentinel" onFocus={() => handleSentinelFocus("start")} />
      <div className="popover__content">
        <div className="popover__rail">
          <h2 id="date-range-heading" className="popover__heading">
            Date range
          </h2>
          <div className="popover__preset-select">
            <label htmlFor="preset-select" className="popover__preset-label">
              Preset
            </label>
            <select
              id="preset-select"
              value={presetId}
              onChange={(event) => onPresetSelect(event.target.value)}
              aria-label="Date preset"
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <Presets
            presets={presets}
            selectedPresetId={presetId}
            committedPresetId={committedPresetId}
            onPresetSelect={onPresetSelect}
            showLabels={showPresetLabels}
          />
        </div>
        <div className="popover__calendar">
          <Calendar
            range={range}
            onRangeChange={onRangeChange}
            locale={locale}
            dataMin={dataMin}
            dataMax={dataMax}
            weekStartsOn={weekStartsOn}
          />
        </div>
      </div>
      <div className="popover__footer">
        {showQuickApply && onQuickApply ? (
          <button type="button" className="popover__quick" onClick={onQuickApply}>
            Today
          </button>
        ) : null}
        {showClear && onClear ? (
          <button type="button" className="popover__ghost" onClick={onClear}>
            Clear
          </button>
        ) : null}
        <button type="button" className="popover__primary" onClick={onApply}>
          Apply
        </button>
      </div>
      <span tabIndex={0} className="popover__sentinel" onFocus={() => handleSentinelFocus("end")} />
    </div>
  );
};

function getFocusable(element: HTMLElement | null): HTMLElement[] {
  if (!element) {
    return [];
  }
  const nodes = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(nodes).filter((node) => !node.hasAttribute("disabled"));
}
