import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type PortalStrategy = "auto" | "outside" | "iframe";

export type OutsideFramePortalProps = {
  anchorRef: React.RefObject<HTMLElement>;
  strategy?: PortalStrategy;
  children: React.ReactNode;
};

const RESPONSE_TIMEOUT = 150;

export const OutsideFramePortal: React.FC<OutsideFramePortalProps> = ({ anchorRef, strategy = "auto", children }) => {
  const [target, setTarget] = useState<HTMLElement | null>(() => (strategy === "iframe" ? document.body : null));
  const [mode, setMode] = useState<PortalStrategy>(strategy === "iframe" ? "iframe" : "auto");
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (strategy === "iframe") {
      setMode("iframe");
      setTarget(document.body);
    } else {
      setMode("auto");
      setTarget(null);
      readyRef.current = false;
      requestIdRef.current = null;
    }
  }, [strategy]);
  useEffect(() => {
    if (!target) {
      setContainer(null);
      return;
    }

    const doc = target.ownerDocument ?? document;
    const element = doc.createElement("div");
    element.className = "outside-frame-portal";
    target.appendChild(element);
    setContainer(element);

    return () => {
      element.remove();
      setContainer(null);
    };
  }, [target]);

  useEffect(() => {
    if (!container) {
      return;
    }
    if (mode === "iframe") {
      container.style.position = "absolute";
      container.style.zIndex = "999";
      container.style.top = "0";
      container.style.left = "0";
      updateIframePosition(anchorRef, container);
    } else {
      container.style.position = "absolute";
      container.style.zIndex = "999999";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
    }
  }, [container, mode, anchorRef]);

  useEffect(() => {
    if (strategy === "iframe") {
      return;
    }
    const id = `date-portal-${Math.random().toString(36).slice(2)}`;
    requestIdRef.current = id;
    const timer = window.setTimeout(() => {
      if (!readyRef.current) {
        setMode("iframe");
        setTarget(document.body);
      }
    }, RESPONSE_TIMEOUT);

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") {
        return;
      }
      if (data.type === "DATE_PICKER_PORTAL_READY" && data.id === id) {
        readyRef.current = true;
        setMode("outside");
        try {
          const parentDoc = window.parent?.document;
          const portalTarget = parentDoc?.getElementById(data.portalId ?? "");
          if (portalTarget) {
            setTarget(portalTarget);
            sendGeometry(anchorRef, id);
          } else {
            setMode("iframe");
            setTarget(document.body);
          }
        } catch (error) {
          setMode("iframe");
          setTarget(document.body);
        }
      }
      if (data.type === "DATE_PICKER_PORTAL_UNAVAILABLE" && data.id === id) {
        window.clearTimeout(timer);
        setMode("iframe");
        setTarget(document.body);
      }
    };

    window.addEventListener("message", handleMessage);
    requestPortal(anchorRef, id);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timer);
      if (readyRef.current) {
        sendUnmount(id);
      }
    };
  }, [anchorRef, strategy]);

  useEffect(() => {
    if (mode === "outside") {
      sendGeometry(anchorRef, requestIdRef.current);
    }
  }, [mode, anchorRef]);

  useEffect(() => {
    if (!container) {
      return;
    }
    if (mode !== "outside") {
      if (mode === "iframe") {
        const update = () => updateIframePosition(anchorRef, container);
        update();
        const Observer = typeof window !== "undefined" ? window.ResizeObserver : undefined;
        const observer = Observer ? new Observer(update) : null;
        if (observer && anchorRef.current) {
          observer.observe(anchorRef.current);
        }
        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update);
        return () => {
          observer?.disconnect();
          window.removeEventListener("scroll", update, true);
          window.removeEventListener("resize", update);
        };
      }
      return;
    }

    const update = () => sendGeometry(anchorRef, requestIdRef.current);
    update();

    const Observer = typeof window !== "undefined" ? window.ResizeObserver : undefined;
    const observer = Observer ? new Observer(update) : null;
    if (observer && anchorRef.current) {
      observer.observe(anchorRef.current);
    }

    const parent = window.parent;
    parent?.addEventListener("scroll", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      observer?.disconnect();
      parent?.removeEventListener("scroll", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [mode, anchorRef, container]);

  if (!target || !container) {
    return null;
  }

  return createPortal(children, container);
};

function requestPortal(anchorRef: React.RefObject<HTMLElement>, id: string) {
  const rect = getAnchorRect(anchorRef);
  if (!rect) {
    return;
  }
  window.parent?.postMessage(
    {
      type: "DATE_PICKER_PORTAL_REQUEST",
      id,
      rect,
    },
    "*",
  );
}

function sendGeometry(anchorRef: React.RefObject<HTMLElement>, id: string | null) {
  if (!id) {
    return;
  }
  const rect = getAnchorRect(anchorRef);
  if (!rect) {
    return;
  }
  window.parent?.postMessage(
    {
      type: "DATE_PICKER_PORTAL_GEOMETRY",
      id,
      rect,
    },
    "*",
  );
}

function sendUnmount(id: string) {
  window.parent?.postMessage(
    {
      type: "DATE_PICKER_PORTAL_UNMOUNT",
      id,
    },
    "*",
  );
}

function getAnchorRect(anchorRef: React.RefObject<HTMLElement>) {
  const anchor = anchorRef.current;
  if (!anchor) {
    return null;
  }
  let frameRect: DOMRect | undefined;
  try {
    frameRect = window.frameElement?.getBoundingClientRect();
  } catch (error) {
    frameRect = undefined;
  }
  let parentScrollX = 0;
  let parentScrollY = 0;
  try {
    parentScrollX = window.parent?.scrollX ?? 0;
    parentScrollY = window.parent?.scrollY ?? 0;
  } catch (error) {
    parentScrollX = window.scrollX;
    parentScrollY = window.scrollY;
  }
  const rect = anchor.getBoundingClientRect();
  return {
    top: rect.top + (frameRect?.top ?? 0) + parentScrollY,
    left: rect.left + (frameRect?.left ?? 0) + parentScrollX,
    width: rect.width,
    height: rect.height,
  };
}

function updateIframePosition(anchorRef: React.RefObject<HTMLElement>, container: HTMLElement) {
  const anchor = anchorRef.current;
  if (!anchor) {
    return;
  }
  const rect = anchor.getBoundingClientRect();
  container.style.top = `${rect.bottom + window.scrollY + 8}px`;
  container.style.left = `${rect.left + window.scrollX}px`;
  container.style.minWidth = `${rect.width}px`;
  container.style.zIndex = "999";
}

