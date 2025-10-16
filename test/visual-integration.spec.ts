import powerbi from "powerbi-visuals-api";
import * as models from "powerbi-models";
import fs from "fs";
import path from "path";
import { act } from "react-dom/test-utils";

jest.mock("powerbi-visuals-utils-formattingmodel", () => {
  class MockSimpleCard {
    public name?: string;
    public displayNameKey?: string;
    public slices: unknown[] = [];
  }

  class MockModel {
    public cards: unknown[] = [];
  }

  const formattingSettings = {
    SimpleCard: MockSimpleCard,
    ItemDropdown: class {
      public name = "";
      public displayNameKey?: string;
      public items?: unknown;
      public value: unknown;
      constructor(config: { name: string; displayNameKey?: string; items?: unknown; value?: unknown }) {
        this.name = config.name;
        this.displayNameKey = config.displayNameKey;
        this.items = config.items;
        this.value = config.value;
      }
    },
    NumUpDown: class {
      public name = "";
      public displayNameKey?: string;
      public value?: unknown;
      public options?: unknown;
      constructor(config: { name: string; displayNameKey?: string; value?: unknown; options?: unknown }) {
        Object.assign(this, config);
      }
    },
    ColorPicker: class {
      public name = "";
      public displayNameKey?: string;
      public value?: unknown;
      constructor(config: { name: string; displayNameKey?: string; value?: unknown }) {
        Object.assign(this, config);
      }
    },
    ToggleSwitch: class {
      public name = "";
      public displayNameKey?: string;
      public value?: unknown;
      constructor(config: { name: string; displayNameKey?: string; value?: unknown }) {
        Object.assign(this, config);
      }
    },
    Model: MockModel,
  };

  class FormattingSettingsService {
    public populateFormattingSettingsModel<T>(model: new () => T): T {
      const instance = new model();
      return instance;
    }

    public buildFormattingModel(settingsModel: { cards?: unknown }): powerbi.visuals.FormattingModel {
      const cards = (settingsModel as { cards?: unknown }).cards ?? [];
      return { cards } as powerbi.visuals.FormattingModel;
    }
  }
  return { FormattingSettingsService, formattingSettings };
});

jest.mock("powerbi-visuals-utils-tooltiputils", () => ({
  createTooltipServiceWrapper: () => ({
    addTooltip: () => undefined,
    hide: () => undefined,
  }),
}));

jest.mock("d3-selection", () => ({
  select: () => ({
    on: () => undefined,
    datum: () => undefined,
  }),
}));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

import PresetDateSlicerVisual from "../src/visual/visual";
import capabilities from "../capabilities.json";
import { parseTargetFromQueryName } from "../src/utils/filters";
import { normalizeRange, toISODate } from "../src/date";

type VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist;

type SelectionId = powerbi.extensibility.ISelectionId;

type DataView = powerbi.DataView;

type DataViewCategoryColumn = powerbi.DataViewCategoryColumn;

type VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

type FormattingModel = powerbi.visuals.FormattingModel;

const ARTIFACTS_DIR = path.resolve(__dirname, "../artifacts");

beforeAll(() => {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }
});

class MockSelectionId implements powerbi.extensibility.ISelectionId {
  constructor(public readonly key: string) {}

  public equals(other: powerbi.extensibility.ISelectionId): boolean {
    return (other as MockSelectionId).key === this.key;
  }

  public includes(other: powerbi.extensibility.ISelectionId): boolean {
    return this.equals(other);
  }

  public getKey(): string {
    return this.key;
  }

  public getSelector(): powerbi.data.Selector {
    return { data: [{ data: this.key }] } as powerbi.data.Selector;
  }

  public getSelectorsByColumn(): powerbi.data.SelectorsByColumn {
    return { dataMap: { [this.key]: true } } as powerbi.data.SelectorsByColumn;
  }

  public hasIdentity(): boolean {
    return true;
  }
}

class MockSelectionIdBuilder implements powerbi.extensibility.ISelectionIdBuilder {
  private category?: DataViewCategoryColumn;
  private index?: number;

  public withCategory(category: DataViewCategoryColumn, index: number): this {
    this.category = category;
    this.index = index;
    return this;
  }

  public withSeries(): this {
    return this;
  }

  public withMeasure(): this {
    return this;
  }

  public withMatrixNode(): this {
    return this;
  }

  public withTable(): this {
    return this;
  }

  public createSelectionId(): SelectionId {
    const queryName = this.category?.source?.queryName ?? this.category?.source?.displayName ?? "unknown";
    const value = this.index != null ? this.category?.values?.[this.index] : undefined;
    const iso = value instanceof Date ? toISODate(value) : value != null ? String(value) : "";
    const key = `${queryName}:${iso}:${this.index ?? -1}`;
    return new MockSelectionId(key);
  }
}

class MockSelectionManager {
  public readonly selectCalls: SelectionId[][] = [];
  public selectCallCount = 0;
  public clearCallCount = 0;
  private current: SelectionId[] = [];
  private callback?: (ids: SelectionId[]) => void;

  private wrap<T>(value: T): powerbi.IPromise<T> {
    return Promise.resolve(value) as unknown as powerbi.IPromise<T>;
  }

  public toggleExpandCollapse(): powerbi.IPromise<{}> {
    return this.wrap({});
  }

  public showContextMenu(): powerbi.IPromise<{}> {
    return this.wrap({});
  }

  public select(selectionIds: SelectionId | SelectionId[], _multiSelect?: boolean): powerbi.IPromise<SelectionId[]> {
    const ids = Array.isArray(selectionIds) ? selectionIds.slice() : [selectionIds];
    this.current = ids;
    this.selectCallCount += 1;
    this.selectCalls.push(ids);
    return this.wrap(ids);
  }

  public hasSelection(): boolean {
    return this.current.length > 0;
  }

  public clear(): powerbi.IPromise<{}> {
    this.current = [];
    this.clearCallCount += 1;
    return this.wrap({});
  }

  public getSelectionIds(): SelectionId[] {
    return this.current.slice();
  }

  public registerOnSelectCallback(callback: (ids: SelectionId[]) => void): void {
    this.callback = callback;
  }
}

class MockLocalizationManager implements powerbi.extensibility.ILocalizationManager {
  public getDisplayName = jest.fn((key: string) => key);
}

class MockVisualHost {
  public readonly selectionManager = new MockSelectionManager();
  public readonly applyJsonFilter = jest.fn();
  public readonly persistProperties = jest.fn();
  public readonly tooltipService = {
    show: jest.fn(),
    hide: jest.fn(),
    move: jest.fn(),
    enabled: () => true,
  };
  public readonly eventService = {
    renderingStarted: jest.fn(),
    renderingFinished: jest.fn(),
  };
  public readonly hostCapabilities = { allowInteractions: true, allowModalDialog: true };
  public readonly colorPalette = {
    isHighContrast: false,
    background: { value: "#ffffff" },
    foreground: { value: "#111111" },
    foregroundNeutralDark: { value: "#111111" },
    foregroundNeutralLight: { value: "#dddddd" },
    foregroundNeutralSecondary: { value: "#666666" },
    hyperlink: { value: "#2563eb" },
    getColor: jest.fn(() => ({ value: "#2563eb" })),
    reset: jest.fn(),
  } as powerbi.extensibility.IColorPalette;
  public readonly locale = "en-US";
  private readonly localizationManager = new MockLocalizationManager();

  public createSelectionManager(): powerbi.extensibility.ISelectionManager {
    return this.selectionManager as unknown as powerbi.extensibility.ISelectionManager;
  }

  public createSelectionIdBuilder(): powerbi.extensibility.ISelectionIdBuilder {
    return new MockSelectionIdBuilder() as unknown as powerbi.extensibility.ISelectionIdBuilder;
  }

  public createLocalizationManager(): powerbi.extensibility.ILocalizationManager {
    return this.localizationManager as unknown as powerbi.extensibility.ILocalizationManager;
  }

  public openModalDialog = jest.fn(() => ({ then: () => undefined }));

  public fetchMoreData = jest.fn(() => false);
  public telemetry = {} as unknown;
  public authenticationService = {} as unknown;
  public launchUrl = jest.fn();
  public instanceId = "mock-instance";
  public refreshHostData = jest.fn();
  public downloadService = {} as unknown;
  public switchFocusModeState = jest.fn();
  public hostEnv = {} as unknown;
  public displayWarningIcon = jest.fn();
  public licenseManager = {} as unknown;
  public webAccessService = {} as unknown;
  public drill = jest.fn();
  public applyCustomSort = jest.fn();
  public acquireAADTokenService = {} as unknown;
  public setCanDrill = jest.fn();
  public storageV2Service = {} as unknown;
  public subSelectionService = {} as unknown;
  public createOpaqueUtils = jest.fn();
}

describe("PresetDateSlicerVisual integration", () => {
  const buildDataView = (dates: Date[], objects?: powerbi.DataViewObjects): DataView => {
    const source: powerbi.DataViewMetadataColumn = {
      displayName: "Order Date",
      queryName: "Sales[OrderDate]",
      roles: { date: true },
      type: { dateTime: true } as powerbi.ValueTypeDescriptor,
    } as powerbi.DataViewMetadataColumn;

    const category: DataViewCategoryColumn = {
      source,
      values: dates,
    } as DataViewCategoryColumn;

    return {
      metadata: {
        columns: [source],
        objects,
      },
      categorical: {
        categories: [category],
      },
    } as DataView;
  };

  it("applies filters, builds selection identities, and persists state", async () => {
    const host = new MockVisualHost();
    const element = document.createElement("div");
    document.body.appendChild(element);
    const visual = new PresetDateSlicerVisual({ host, element } as unknown as VisualConstructorOptions);

    const dateValues = [new Date(2024, 0, 1), new Date(2024, 0, 2), new Date(2024, 0, 5)];
    const dataView = buildDataView(dateValues);

    (visual as unknown as { dataView: DataView }).dataView = dataView;
    (visual as unknown as { columnTarget?: models.IFilterColumnTarget }).columnTarget =
      parseTargetFromQueryName("Sales[OrderDate]") ?? undefined;
    (visual as unknown as { dataBounds: { min?: Date; max?: Date } }).dataBounds = {
      min: new Date(2023, 11, 31),
      max: new Date(2024, 0, 10),
    };
    (visual as unknown as { settings: unknown }).settings = {
      defaults: {},
      pill: {},
      buttons: {},
      manualEntry: {},
    };

    const range = normalizeRange(new Date(2024, 0, 1), new Date(2024, 0, 2));

    (visual as unknown as { applyRangeFilter(r: typeof range): void }).applyRangeFilter(range);

    expect(host.applyJsonFilter).toHaveBeenCalledTimes(1);
    const appliedFilter = host.applyJsonFilter.mock.calls[0][0] as models.IAdvancedFilter;
    expect(appliedFilter.target).toEqual({ table: "Sales", column: "OrderDate" });
    const lower = appliedFilter.conditions?.[0]?.value as Date;
    const upper = appliedFilter.conditions?.[1]?.value as Date;
    expect(lower).toBeInstanceOf(Date);
    expect(upper).toBeInstanceOf(Date);
    expect(lower.getTime()).toBe(range.from.getTime());
    expect(upper.getTime()).toBe(range.to.getTime());
    expect(host.applyJsonFilter.mock.calls[0][1]).toBe("general");
    expect(host.applyJsonFilter.mock.calls[0][2]).toBe("filter");
    expect(host.applyJsonFilter.mock.calls[0][3]).toBe(powerbi.FilterAction.merge);

    expect(host.selectionManager.selectCallCount).toBe(1);
    const keys = host.selectionManager.selectCalls[0].map((id) => (id as MockSelectionId).key);
    expect(keys).toEqual([
      "Sales[OrderDate]:2024-01-01:0",
      "Sales[OrderDate]:2024-01-02:1",
    ]);

    (visual as unknown as { persistState(r: typeof range, presetId: string): void }).persistState(range, "custom");

    expect(host.persistProperties).toHaveBeenCalledTimes(1);
    const persisted = host.persistProperties.mock.calls[0][0] as VisualObjectInstancesToPersist;
    const stateEntry = persisted.merge?.find((entry) => entry.objectName === "state");
    if (!stateEntry) {
      throw new Error("Expected state entry to be persisted");
    }
    const payload = stateEntry.properties?.payload;
    expect(typeof payload).toBe("string");
    const parsed = JSON.parse(payload as string);
    expect(parsed.range).toEqual({ from: toISODate(range.from), to: toISODate(range.to) });
    expect(parsed.presetId).toBe("custom");

    const settings = (visual as unknown as {
      settings: {
        persistedState?: unknown;
        defaults: { presetId?: string };
        manualEntry: { enabled?: boolean };
      };
    }).settings;
    expect(settings.persistedState).toMatchObject({
      range: { from: toISODate(range.from), to: toISODate(range.to) },
      presetId: "custom",
    });
    expect(settings.defaults.presetId).toBe("custom");

    act(() => {
      visual.destroy();
    });
    element.remove();
  });

  it("emits a populated formatting model and validates resource strings", async () => {
    const host = new MockVisualHost();
    const element = document.createElement("div");
    document.body.appendChild(element);
    const visual = new PresetDateSlicerVisual({ host, element } as unknown as VisualConstructorOptions);

    const payload = JSON.stringify({
      range: { from: "2024-01-01", to: "2024-01-05" },
      presetId: "last7",
    });

    const objects: powerbi.DataViewObjects = {
      defaults: { defaultPreset: "last30", weekStartsOn: "1", locale: "en-US" },
      pill: {
        pillStyle: "expanded",
        showPresetLabels: true,
        pillBackgroundColor: { solid: { color: "#123456" } },
        pillBorderColor: { solid: { color: "#abcdef" } },
        pillTextColor: { solid: { color: "#654321" } },
        pillFontSize: 14,
        pillMinWidth: 300,
      },
      buttons: { showQuickApply: true, showClear: false },
      manualEntry: { enabled: false },
      tooltips: { show: true },
      state: { payload },
    } as powerbi.DataViewObjects;

    const dataView = buildDataView([new Date(2024, 0, 1), new Date(2024, 0, 2)], objects);

    const updateOptions: VisualUpdateOptions = {
      dataViews: [dataView],
      type: powerbi.VisualUpdateType.All,
      viewport: { width: 480, height: 320 },
    } as VisualUpdateOptions;

    await act(async () => {
      visual.update(updateOptions);
    });

    const runtimeSettings = (visual as unknown as {
      settings: { manualEntry: { enabled?: boolean } };
    }).settings;
    expect(runtimeSettings.manualEntry.enabled).toBe(false);

    const formattingModel = visual.getFormattingModel() as FormattingModel;
    const formattingPath = path.join(ARTIFACTS_DIR, "formatting-model.json");
    fs.writeFileSync(formattingPath, JSON.stringify(formattingModel, null, 2));

    const skipObjects = new Set(["general", "state"]);
    const capabilityObjects = capabilities.objects as Record<string, { properties?: Record<string, unknown> }>;
    const cards = (formattingModel.cards ?? []) as Array<{
      name?: string;
      slices?: Array<{ name?: string; value?: unknown }>;
    }>;
    const cardsByName = new Map(cards.map((card) => [card.name, card]));

    for (const [objectName, definition] of Object.entries(capabilityObjects)) {
      const propertyNames = Object.keys(definition.properties ?? {});
      if (propertyNames.length === 0 || skipObjects.has(objectName)) {
        continue;
      }
      const card = cardsByName.get(objectName);
      expect(card).toBeDefined();
      const slices = Array.isArray(card?.slices) ? card?.slices ?? [] : [];
      for (const propertyName of propertyNames) {
        const slice = slices.find((entry) => entry?.name === propertyName);
        expect(slice).toBeDefined();
        expect(slice?.value).not.toBeUndefined();
      }
    }

    const displayNameKeys = new Set<string>();
    const collectKeys = (value: unknown): void => {
      if (!value) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(collectKeys);
        return;
      }
      if (typeof value === "object") {
        const record = value as Record<string, unknown>;
        const key = record.displayNameKey;
        if (typeof key === "string") {
          displayNameKeys.add(key);
        }
        Object.values(record).forEach(collectKeys);
      }
    };
    collectKeys(capabilities);

    const resourcesDir = path.resolve(__dirname, "../stringResources");
    const localeDirs = fs.readdirSync(resourcesDir).filter((entry) => fs.statSync(path.join(resourcesDir, entry)).isDirectory());
    const localization: Record<string, { present: string[]; missing: string[] }> = {};

    for (const key of Array.from(displayNameKeys).sort()) {
      const record = { present: [] as string[], missing: [] as string[] };
      for (const locale of localeDirs) {
        const resourcePath = path.join(resourcesDir, locale, "resources.resjson");
        const content = JSON.parse(fs.readFileSync(resourcePath, "utf8")) as Record<string, string>;
        const value = content[key];
        if (typeof value === "string" && value.trim()) {
          record.present.push(locale);
        } else {
          record.missing.push(locale);
        }
      }
      localization[key] = record;
    }

    const auditPath = path.join(ARTIFACTS_DIR, "resource-audit.json");
    const resourceAudit = { addedKeys: [] as string[], localization };
    fs.writeFileSync(auditPath, JSON.stringify(resourceAudit, null, 2));

    const missingEntries = Object.entries(localization).filter(([, entry]) => entry.missing.length > 0);
    expect(missingEntries).toEqual([]);

    act(() => {
      visual.destroy();
    });
    element.remove();
  });
});
