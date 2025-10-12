import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { DateRange, DateRangeFilter, PRESETS, PortalStrategy, toISODate } from "@lib";
import "./styles.css";

const VisualApp: React.FC = () => {
  const [strategy, setStrategy] = useState<PortalStrategy>("outside");
  const [defaultPresetId, setDefaultPresetId] = useState<string>("last7");
  const [lastApplied, setLastApplied] = useState<string>("Apply a range to see updates");

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const data = event.data as { type?: string; value?: PortalStrategy };
      if (!data || typeof data !== "object") {
        return;
      }
      if (data.type === "DEMO_FORCE_STRATEGY" && data.value) {
        setStrategy(data.value);
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  useEffect(() => {
    window.parent?.postMessage(
      {
        type: "DEMO_STRATEGY_CHANGED",
        value: strategy,
      },
      "*",
    );
  }, [strategy]);

  const handleChange = (range: DateRange, presetId: string) => {
    setLastApplied(`${presetId.toUpperCase()} · ${toISODate(range.from)} → ${toISODate(range.to)}`);
  };

  return (
    <div className="visual-root">
      <div className="visual-controls">
        <label>
          Portal strategy
          <select value={strategy} onChange={(event) => setStrategy(event.target.value as PortalStrategy)}>
            <option value="outside">Outside iframe</option>
            <option value="auto">Auto</option>
            <option value="iframe">In-iframe fallback</option>
          </select>
        </label>
        <label>
          Default preset
          <select value={defaultPresetId} onChange={(event) => setDefaultPresetId(event.target.value)}>
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <DateRangeFilter
        presets={PRESETS}
        dataMin={new Date(2021, 0, 1)}
        dataMax={new Date()}
        onChange={handleChange}
        forcePortalStrategy={strategy}
        defaultPresetId={defaultPresetId}
      />
      <div className="visual-status">
        <strong>Last applied</strong>
        <span>{lastApplied}</span>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<VisualApp />);
