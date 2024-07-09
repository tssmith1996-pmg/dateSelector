
import * as React from "react";
// import { useState, useEffect, useCallback } from "react";
import { createRoot, Root } from "react-dom/client";
import powerbi from "powerbi-visuals-api";

// Import VisualUpdateOptions and VisualConstructorOptions from powerbi
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

// Utility Component
interface ContainerProps {
  component: React.ComponentType<any>;
  data: Partial<VisualUpdateOptions>;
  onFilterChanged?: (data: any) => void;
}

const ReactContainer: React.FC<ContainerProps> = ({ component, data, onFilterChanged, ...rest  }) => {
  const Component = component;
  return <Component {...data} {...rest} onFilterChanged={onFilterChanged} />;
};

export default ReactContainer;

// Abstract Base Class
export abstract class ReactVisual {
  protected reactTarget: HTMLElement;
  protected reactRenderer: React.ComponentType<any>;
  protected root: Root | null = null;

  constructor(options: VisualConstructorOptions) {
    this.reactTarget = options.element;
  }

  protected reactMount(): void {
    if (!this.root) {
      this.root = createRoot(this.reactTarget);
    }
    this.root.render(React.createElement(this.reactRenderer));
  }

  public renderer: () => React.ElementType;

  protected updateReactContainers: (data: any) => void = (data) => {
    if (this.root) {
      this.root.render(React.createElement(this.reactRenderer, { data }));
    }
  };

  protected createReactContainer(component: React.ComponentType<any>, onFilterChanged: (dates: any) => void) {
    return (props: any) =>
      React.createElement(ReactContainer, { component, ...props, onFilterChanged });
  }


  protected reactUnmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
