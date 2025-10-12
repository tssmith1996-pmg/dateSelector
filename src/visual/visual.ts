import powerbi from 'powerbi-visuals-api';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import {
  applyPresetToState,
  createInitialState,
  DEFAULT_FORMATTING,
  FormattingSettings,
  PresetKey,
  updateBounds,
  VisualState,
  withComparisonEnabled,
} from '../logic/state';
import { VisualHostBridge } from './visualHost';

import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

interface PersistedStatePayload {
  main: { start: string; end: string };
  comparisonEnabled: boolean;
  comparison?: { start: string; end: string } | null;
  activePreset: PresetKey;
}

export class PresetDateSlicerVisual
  implements powerbi.extensibility.visual.IVisual
{
  private rootElement: HTMLElement;
  private reactRoot: Root;
  private state: VisualState;
  private formatting: FormattingSettings;
  private host: VisualHostBridge;
  private hasLoadedState = false;

  constructor(options: VisualConstructorOptions) {
    this.rootElement = document.createElement('div');
    this.rootElement.className = 'pds-container';
    options.element.appendChild(this.rootElement);

    this.reactRoot = createRoot(this.rootElement);
    this.host = new VisualHostBridge(options.host);
    this.formatting = DEFAULT_FORMATTING;
    this.state = createInitialState(this.formatting, new Date());
    this.hasLoadedState = true;
    this.render();
  }

  public update(options: VisualUpdateOptions): void {
    const dataView = options.dataViews?.[0];
    this.formatting = this.readFormattingSettings(dataView);

    const target = dataView?.categorical?.categories?.[0]?.identityFields?.[0];
    this.host.updateTarget(target);

    const persisted = this.readPersistedState(dataView);
    if (persisted) {
      this.state = {
        ...this.state,
        main: {
          start: new Date(persisted.main.start),
          end: new Date(persisted.main.end),
        },
        comparisonEnabled:
          this.formatting.showComparisonToggle && persisted.comparisonEnabled,
        comparison: persisted.comparison
          ? {
              start: new Date(persisted.comparison.start),
              end: new Date(persisted.comparison.end),
            }
          : null,
        activePreset: persisted.activePreset,
      };
      this.hasLoadedState = true;
    }

    if (!persisted && !this.hasLoadedState) {
      this.state = createInitialState(this.formatting, new Date());
      this.hasLoadedState = true;
    }

    if (
      !persisted &&
      this.state.activePreset === DEFAULT_FORMATTING.defaultPreset &&
      this.formatting.defaultPreset !== this.state.activePreset
    ) {
      this.state = applyPresetToState(
        this.state,
        this.formatting.defaultPreset,
        this.formatting,
        new Date(),
      );
    }

    if (!this.formatting.showComparisonToggle && this.state.comparisonEnabled) {
      this.state = withComparisonEnabled(this.state, false);
    }

    this.state = updateBounds(this.state, this.formatting, new Date());

    this.render();
  }

  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions,
  ): VisualObjectInstance[] {
    const instances: VisualObjectInstance[] = [];

    switch (options.objectName) {
      case 'defaults':
        instances.push({
          objectName: 'defaults',
          selector: null,
          properties: {
            defaultPreset: this.formatting.defaultPreset,
            weekStartsOn: this.formatting.weekStartsOn,
            locale: this.formatting.locale,
          },
        });
        break;
      case 'comparison':
        instances.push({
          objectName: 'comparison',
          selector: null,
          properties: {
            showComparisonToggle: this.formatting.showComparisonToggle,
            comparisonDefaultOn: this.formatting.comparisonDefaultOn,
          },
        });
        break;
      case 'limits':
        instances.push({
          objectName: 'limits',
          selector: null,
          properties: {
            minDate: this.formatting.minDate ?? null,
            maxDate: this.formatting.maxDate ?? null,
          },
        });
        break;
      case 'pill':
        instances.push({
          objectName: 'pill',
          selector: null,
          properties: {
            pillStyle: this.formatting.pillStyle,
            showPresetLabels: this.formatting.showPresetLabels,
          },
        });
        break;
      case 'buttons':
        instances.push({
          objectName: 'buttons',
          selector: null,
          properties: {
            showQuickApply: this.formatting.showQuickApply,
            showClear: this.formatting.showClear,
          },
        });
        break;
      case 'state':
        instances.push({
          objectName: 'state',
          selector: null,
          properties: {
            payload: JSON.stringify(this.serializeState()),
          },
        });
        break;
      default:
        break;
    }

    return instances;
  }

  public destroy(): void {
    this.reactRoot.unmount();
  }

  private handleApply = (next: VisualState, options?: { removeFilter?: boolean }) => {
    this.state = updateBounds(next, this.formatting, new Date());
    this.render();

    if (options?.removeFilter) {
      this.host.applyDateRange(null);
    } else {
      this.host.applyDateRange(this.state.main);
    }

    this.host.persistState(this.serializeState());
  };

  private render(): void {
    this.reactRoot.render(
      React.createElement(App, {
        state: this.state,
        formatting: this.formatting,
        onApply: this.handleApply,
      }),
    );
  }

  private serializeState(): PersistedStatePayload {
    return {
      main: {
        start: this.state.main.start.toISOString(),
        end: this.state.main.end.toISOString(),
      },
      comparisonEnabled: this.state.comparisonEnabled,
      comparison: this.state.comparison
        ? {
            start: this.state.comparison.start.toISOString(),
            end: this.state.comparison.end.toISOString(),
          }
        : null,
      activePreset: this.state.activePreset,
    };
  }

  private readPersistedState(
    dataView?: powerbi.DataView,
  ): PersistedStatePayload | undefined {
    const payload = dataView?.metadata?.objects?.state?.payload as string | undefined;
    if (!payload) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(payload) as PersistedStatePayload;
      if (!parsed.main?.start || !parsed.main?.end) {
        return undefined;
      }
      return parsed;
    } catch (error) {
      return undefined;
    }
  }

  private readFormattingSettings(dataView?: powerbi.DataView): FormattingSettings {
    const objects = dataView?.metadata?.objects;
    const defaults = objects?.defaults ?? {};
    const comparison = objects?.comparison ?? {};
    const limits = objects?.limits ?? {};
    const pill = objects?.pill ?? {};
    const buttons = objects?.buttons ?? {};

    const defaultPreset = (defaults.defaultPreset as PresetKey) || DEFAULT_FORMATTING.defaultPreset;
    const weekRaw = defaults.weekStartsOn as number | undefined;
    const weekStartsOn =
      typeof weekRaw === 'number' && weekRaw >= 0 && weekRaw <= 6
        ? (weekRaw as 0 | 1 | 2 | 3 | 4 | 5 | 6)
        : DEFAULT_FORMATTING.weekStartsOn;

    return {
      defaultPreset,
      weekStartsOn,
      locale: (defaults.locale as string) || DEFAULT_FORMATTING.locale,
      showComparisonToggle:
        typeof comparison.showComparisonToggle === 'boolean'
          ? (comparison.showComparisonToggle as boolean)
          : DEFAULT_FORMATTING.showComparisonToggle,
      comparisonDefaultOn:
        typeof comparison.comparisonDefaultOn === 'boolean'
          ? (comparison.comparisonDefaultOn as boolean)
          : DEFAULT_FORMATTING.comparisonDefaultOn,
      minDate: (limits.minDate as string) || undefined,
      maxDate: (limits.maxDate as string) || undefined,
      pillStyle: (pill.pillStyle as 'compact' | 'expanded') ?? DEFAULT_FORMATTING.pillStyle,
      showPresetLabels:
        typeof pill.showPresetLabels === 'boolean'
          ? (pill.showPresetLabels as boolean)
          : DEFAULT_FORMATTING.showPresetLabels,
      showQuickApply:
        typeof buttons.showQuickApply === 'boolean'
          ? (buttons.showQuickApply as boolean)
          : DEFAULT_FORMATTING.showQuickApply,
      showClear:
        typeof buttons.showClear === 'boolean'
          ? (buttons.showClear as boolean)
          : DEFAULT_FORMATTING.showClear,
    };
  }
}
