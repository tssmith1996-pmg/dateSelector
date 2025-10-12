import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import type { PortalStrategy } from "@lib";
import "./styles.css";

type Geometry = { top: number; left: number; width: number; height: number } | null | undefined;

type PortalRequest = {
  type: "DATE_PICKER_PORTAL_REQUEST";
  id: string;
  rect?: Geometry;
};

type PortalGeometry = {
  type: "DATE_PICKER_PORTAL_GEOMETRY";
  id: string;
  rect?: Geometry;
};

type PortalUnmount = {
  type: "DATE_PICKER_PORTAL_UNMOUNT";
  id: string;
};

type RangeChanged = {
  type: "DATE_RANGE_CHANGED";
  range: { from: string; to: string };
  presetId: string;
};

type StrategyChanged = {
  type: "DEMO_STRATEGY_CHANGED";
  value: PortalStrategy;
};

type MessageEventData = PortalRequest | PortalGeometry | PortalUnmount | RangeChanged | StrategyChanged | { type: string };

const overlayRegistry = new Map<string, HTMLElement>();

function ensureOverlay(id: string, rect?: Geometry) {
  let host = overlayRegistry.get(id);
  if (!host) {
    host = document.createElement("div");
    host.id = `date-picker-portal-${id}`;
    host.className = "parent-overlay";
    document.body.appendChild(host);
    overlayRegistry.set(id, host);
  }
  if (rect) {
    positionOverlay(host, rect);
  }
  return host;
}

function positionOverlay(host: HTMLElement, rect: { top: number; left: number; width: number; height: number }) {
  const offset = 8;
  host.style.top = `${rect.top + rect.height + offset}px`;
  host.style.left = `${rect.left}px`;
  host.style.minWidth = `${Math.max(rect.width, 320)}px`;
}

function removeOverlay(id: string) {
  const host = overlayRegistry.get(id);
  if (host) {
    host.remove();
    overlayRegistry.delete(id);
  }
}

const ParentApp: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [strategy, setStrategy] = useState<PortalStrategy>("outside");
  const [lastRange, setLastRange] = useState<string>("No range applied yet");

  useEffect(() => {
    const listener = (event: MessageEvent<MessageEventData>) => {
      const data = event.data;
      if (!data || typeof data !== "object") {
        return;
      }
      switch (data.type) {
        case "DATE_PICKER_PORTAL_REQUEST": {
          const host = ensureOverlay(data.id, data.rect ?? null);
          event.source?.postMessage(
            {
              type: "DATE_PICKER_PORTAL_READY",
              id: data.id,
              portalId: host.id,
            },
            "*",
          );
          break;
        }
        case "DATE_PICKER_PORTAL_GEOMETRY": {
          const host = overlayRegistry.get(data.id);
          if (host && data.rect) {
            positionOverlay(host, data.rect);
          }
          break;
        }
        case "DATE_PICKER_PORTAL_UNMOUNT": {
          removeOverlay(data.id);
          break;
        }
        case "DATE_RANGE_CHANGED": {
          setLastRange(`${data.presetId} → ${data.range.from} → ${data.range.to}`);
          break;
        }
        case "DEMO_STRATEGY_CHANGED": {
          setStrategy(data.value);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const sendStrategy = (value: PortalStrategy) => {
    setStrategy(value);
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "DEMO_FORCE_STRATEGY",
        value,
      },
      "*",
    );
  };

  return (
    <div className="parent-layout">
      <div className="parent-shell">
        <div className="parent-panel">
          <h1>Power BI Date Range Filter</h1>
          <p>
            This page simulates the Power BI host. The embedded iframe renders the custom visual, while the overlay manager
            mirrors the popover on top of the report surface.
          </p>
          <div className="parent-controls">
            <label>
              Portal strategy
              <select value={strategy} onChange={(event) => sendStrategy(event.target.value as PortalStrategy)}>
                <option value="outside">Outside iframe</option>
                <option value="auto">Auto (prefer outside)</option>
                <option value="iframe">Fallback: iframe body</option>
              </select>
            </label>
          </div>
          <iframe ref={iframeRef} className="parent-iframe" src="../visual/index.html" title="Date range filter demo" />
          <div className="parent-log">
            <h3>DATE_RANGE_CHANGED</h3>
            <pre>{lastRange}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<ParentApp />);
