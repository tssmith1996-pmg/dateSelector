/* * /
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import powerbi from "powerbi-visuals-api";

// import IVisual = powerbi.extensibility.visual.IVisual;

import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import { dateRange } from "./interface";

interface ContainerProps {
  component: React.ComponentType<any>;
  handleVal?: (data: Partial<VisualUpdateOptions>) => void;
}

type ContainerState = Readonly<{
  data: Partial<VisualUpdateOptions>;
}>;

const initialState: ContainerState = {
  data: {},
};

export class ReactContainer extends React.Component<
  ContainerProps,
  ContainerState
> {
  private static subscriptions: Array<(data: ContainerState) => void> = [];

  private static subscribe(callback: (data: ContainerState) => void) {
    ReactContainer.subscriptions.push(callback);
    return ReactContainer.createUnsubscribeCallback(
      ReactContainer.subscriptions.length - 1
    );
  }

  private static createUnsubscribeCallback = (i: number) => {
    return () => {
      delete ReactContainer.subscriptions[i];
    };
  };

  public static update(newData: ContainerState) {
    ReactContainer.subscriptions.forEach((updateCallback) => {
      updateCallback(newData);
    });
  }

  public unsubscribe: () => void;

  public state: ContainerState = initialState;

  public constructor(props: ContainerProps) {
    super(props);
    this.state = initialState;
    this.update = this.update.bind(this);
  }

  public update(newData: ContainerState) {
    this.setState({ data: { ...this.state.data, ...newData } }, () => {
      console.log("reactContainer state : ", this.state.data)
      if (this.props.handleVal) {
        this.props.handleVal(this.state.data);
      }
    });
  }
  public componentWillMount() {
    this.unsubscribe = ReactContainer.subscribe(this.update);
  }

  public componentWillUnmount() {
    this.unsubscribe();
  }
  // public componentDidMount() {
  //   this.unsubscribe = ReactContainer.subscribe(this.update);
  // }

  render() {
    const props = { ...this.state.data, handleVal: this.props.handleVal };
    const Component = this.props.component;
    return <Component {...props} />;
  }
}

export abstract class ReactVisual {
  protected reactTarget: HTMLElement;
  protected reactRenderer: React.ComponentType;
  protected reactContainers: React.ComponentType[];
  protected root: Root | null = null;

  protected updateReactContainers: (data: any) => void = ReactContainer.update;

  protected createReactContainer(
    component: React.ComponentType,
    handleVal?: (dates: dateRange) => void
  ) {
    return (props: any) =>
      React.createElement(ReactContainer, {
        component,
        handleVal,
        ...props,
      });
  }

  protected reactMount(): void {
    this.root = createRoot(this.reactTarget);
    this.root.render(React.createElement(this.reactRenderer));
  }

  public renderer: () => React.ElementType;

  constructor(options: VisualConstructorOptions) {
    this.reactTarget = options.element;
  }
  protected reactUnmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
/*

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { createRoot, Root } from 'react-dom/client';
import powerbi from 'powerbi-visuals-api';

// Import VisualUpdateOptions and VisualConstructorOptions from powerbi
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

interface ContainerProps {
  component: React.ComponentType<any>;
}

interface ContainerState {
  data: Partial<VisualUpdateOptions>;
}

const initialState: ContainerState = {
  data: {}
};

const subscriptions: Array<(data: ContainerState) => void> = [];

const subscribe = (callback: (data: ContainerState) => void) => {
  subscriptions.push(callback);
  return createUnsubscribeCallback(subscriptions.length - 1);
}

const createUnsubscribeCallback = (i: number) => {
  return () => {
    delete subscriptions[i];
  };
}

export const update = (newData: ContainerState) => {
  subscriptions.forEach(updateCallback => {
    updateCallback(newData);
  });
}

const ReactContainer: React.FC<ContainerProps> = ({ component }) => {
  const [state, setState] = useState<ContainerState>(initialState);

  const updateState = useCallback((newData: ContainerState) => {
    setState(prevState => ({ data: { ...prevState.data, ...newData.data } }));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(updateState);
    return () => {
      unsubscribe();
    };
  }, [updateState]);

  const Component = component;
  return <Component {...state.data} />;
};

export abstract class ReactVisual {
  protected reactTarget: HTMLElement;
  protected reactRenderer: React.ComponentType;
  protected reactContainers: React.ComponentType[];
  protected root: Root | null = null;

  protected updateReactContainers: (data: any) => void = update;

  protected createReactContainer(component: React.ComponentType) {
    return (props: any) => React.createElement(ReactContainer, { component, ...props });
  }

  protected reactMount(): void {
    if (!this.root) {
      this.root = createRoot(this.reactTarget);
    }
    this.root.render(React.createElement(this.reactRenderer));
  }

  public renderer: () => React.ElementType;

  constructor(options: VisualConstructorOptions) {
    this.reactTarget = options.element;
  }

  protected reactUnmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

*/
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import powerbi from "powerbi-visuals-api";

// Utility Component
interface ContainerProps {
  component: React.ComponentType<any>;
  data: Partial<powerbi.extensibility.visual.VisualUpdateOptions>;
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

  constructor(options: powerbi.extensibility.visual.VisualConstructorOptions) {
    this.reactTarget = options.element;
  }

  protected updateReactContainers: (data: any) => void = (data) => {
    if (this.root) {
      this.root.render(React.createElement(this.reactRenderer, { data }));
    }
  };

  protected createReactContainer(component: React.ComponentType<any>, onFilterChanged: (dates: any) => void) {
    return (props: any) =>
      React.createElement(ReactContainer, { component, ...props, onFilterChanged });
  }

  protected reactMount(): void {
    this.root = createRoot(this.reactTarget);
    this.root.render(React.createElement(this.reactRenderer));
  }

  protected reactUnmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
