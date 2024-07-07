/*
 */
"use strict";

import powerbi from "powerbi-visuals-api";

import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

// Formatting Options Panel
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettingsModel } from "./vsettings";

import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { IFilterColumnTarget, AdvancedFilter } from "powerbi-models";

import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;

import { VisualState, dateRange, dateCardProps } from "./interface";

import { ReactVisual } from "./reactUtils";
import { mapOptionsToState, optionsAreValid } from "./optionsMapper";

import tinycolor from "tinycolor2";
import DateRangeCard from "./components/daterangecard";
import isEqual from "lodash.isequal";

export class DateSelector extends ReactVisual implements IVisual {
  private visualHost: IVisualHost;
  private events: IVisualEventService;

  // formatiing panel
  private formattingSettings: VisualSettingsModel;
  private formattingSettingsService: FormattingSettingsService;

  private currentViewport: IViewport;
  private dataView: DataView;

  private colorPalette: IColorPalette;
  private colorHelper: ColorHelper;

  private state: VisualState;

  private static filterObjectProperty: {
    objectName: string;
    propertyName: string;
  } = { objectName: "general", propertyName: "filter" };

  // selected filter range determined from visual
  public filter: dateRange;
  public lastFilter: dateRange;
  public initialised: boolean;
  public lastSettings: dateCardProps;

  constructor(options: VisualConstructorOptions) {
    super(options);
    this.initializeVisualProperties(options);
    this.initializeReact();
    this.formattingSettingsService = new FormattingSettingsService();
    // const localizationManager = options.host.createLocalizationManager();
    // this.formattingSettingsService = new FormattingSettingsService(localizationManager);
  }

  protected initializeVisualProperties(options: VisualConstructorOptions) {
    this.visualHost = options.host;

    this.events = options.host.eventService;
    this.colorPalette = this.visualHost.colorPalette;
    this.colorHelper = new ColorHelper(this.colorPalette);
    // support high contrast
    if (this.colorHelper.isHighContrast) {
      const foregroundColor = this.colorPalette.getColor("foreground").value;
      const backgroundColor = this.colorPalette.getColor("background").value;
      const theme = tinycolor(backgroundColor).isDark() ? "dark" : "light";
      this.updateReactContainers({
        themeColor: foregroundColor,
        themeMode: theme,
      });
    }
  }

  protected initializeReact() {
    this.reactRenderer = this.createReactContainer(
      DateRangeCard,
      this.applyDateFilter
    );
    this.reactMount();
  }

  public update(options: VisualUpdateOptions) {
    if (optionsAreValid(options)) {
      try {
        this.events.renderingStarted(options);

        const existingDataView = this.dataView;
        this.dataView = options.dataViews[0];
        const getSettings: boolean = !(isEqual(existingDataView, this.dataView) && this.initialised);

        if (getSettings) {
          this.formattingSettings =
            this.formattingSettingsService.populateFormattingSettingsModel(
              VisualSettingsModel,
              options.dataViews[0]
            );

          this.state = mapOptionsToState(
            options,
            this.formattingSettings,
            this.initialised
          );
          const { settings } = this.state;

          const refresh: boolean = !(
            isEqual(settings, this.lastSettings) && this.initialised
          );

          if (refresh) {
            this.applyDateFilter(settings.dates);
            this.updateReactContainers(settings);
            this.initialised = true;
          }

          this.lastSettings = settings;
        }

        this.events.renderingFinished(options);
      } catch (e) {
        console.error(e);
        this.events.renderingFailed(options);
      }
    } else
      this.updateReactContainers({
        landingOff: false,
      });
  }

  // Apply the filter
  public applyDateFilter = (dates: dateRange): void => {
    const isFilterChanged: boolean =
      this.lastFilter === undefined ||
      String(this.lastFilter.start) !== String(dates.start) ||
      String(this.lastFilter.end) !== String(dates.end);

    if (isFilterChanged) {
      this.visualHost.applyJsonFilter(
        this.createFilter(
          dates.start,
          dates.end,
          this.state.category.filterTarget
        ),
        DateSelector.filterObjectProperty.objectName,
        DateSelector.filterObjectProperty.propertyName,
        dates.start && dates.end
          ? powerbi.FilterAction.merge
          : powerbi.FilterAction.remove
      );

      this.lastFilter = dates;
      this.state.settings.dates = dates;
      this.updateReactContainers(this.state.settings);
      this.lastSettings = this.state.settings;
    }
  };

  // Create the filter
  public createFilter(
    startDate: Date,
    endDate: Date,
    filterTarget: IFilterColumnTarget
  ): AdvancedFilter {
    return new AdvancedFilter(
      filterTarget,
      "And",
      {
        operator: "GreaterThanOrEqual",
        value: startDate ? startDate.toJSON() : null,
      },
      {
        operator: "LessThanOrEqual",
        value: endDate ? endDate.toJSON() : null,
      }
    );
  }

  /**
   * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Than populate properties pane.
   * This method is called once every time we open properties pane or when the user edit any format property.
   */
  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }
}
