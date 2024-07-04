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

import { VisualState, dateRange, dateCardProps } from "./interface";

import { ReactVisual } from "./reactUtils";
import { mapOptionsToState, optionsAreValid } from "./optionsMapper";

import tinycolor from "tinycolor2";
import DateRangeCard from "./components/daterangecard";
// import isEqual from "lodash.isequal";

export class DateSelector extends ReactVisual implements IVisual {
  private visualHost: IVisualHost;
  private events: IVisualEventService;

  // formatiing panel
  private formattingSettings: VisualSettingsModel;
  private formattingSettingsService: FormattingSettingsService;

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
        console.log("update")
    if (optionsAreValid(options)) {
      try {
        this.events.renderingStarted(options);
        // Get Settings
        this.formattingSettings =
          this.formattingSettingsService.populateFormattingSettingsModel(
            VisualSettingsModel,
            options.dataViews[0]
          );

        this.state = mapOptionsToState(options, this.formattingSettings, this.initialised);
        const { settings } = this.state;
                this.initialised = true;

        // const refresh: boolean =  !isEqual(settings, this.lastSettings);
        this.applyDateFilter(settings.dates);
        this.updateReactContainers(settings);

        this.lastSettings = settings;

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
  public applyDateFilter = (dates: dateRange, viaUpdate?: boolean ): void => {
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
      this.lastSettings = this.state.settings;
    }
    // console.log("dateSelector", this.state.settings, viaUpdate)
    if (viaUpdate !== true) this.updateReactContainers(this.state.settings);
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
    // console.log(this.formattingSettings);
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }

  // private restoreRangeFilter = (options: VisualUpdateOptions) => {
  //   const { startRange, weekStartDay, yearStartMonth, rangeScope, singleDay } =
  //     this.state.settings;
  //   const startupFilter = getInitRange(
  //     startRange,
  //     weekStartDay,
  //     yearStartMonth,
  //     rangeScope
  //   );
  //   const jsonFilters: powerbi.IFilter[] = options.jsonFilters;
  //   const dataView: powerbi.DataView = options.dataViews[0];
  //   if (
  //     // startRange === "sync" &&
  //     jsonFilters &&
  //     dataView.metadata &&
  //     dataView.metadata.columns &&
  //     dataView.metadata.columns[0]
  //   ) {
  //     const filter = jsonFilters.find((filter): filter is IAdvancedFilter => {
  //       return (
  //         (filter as IAdvancedFilter).target !== undefined &&
  //         (filter as IAdvancedFilter).logicalOperator !== undefined &&
  //         (filter as IAdvancedFilter).conditions !== undefined
  //       );
  //     });
  //     /***************************************************************** */
  //     console.log(
  //       "optionsMapper - Filter at load:",
  //       filter,
  //       startRange,
  //       startupFilter
  //     );
  //     /***************************************************************** */
  //     this.initialised = true;
  //     if (filter) {
  //       const target = filter.target as { table: string; column: string };
  //       const source: string[] = String(
  //         dataView.metadata.columns[0].queryName
  //       ).split(".");
  //       if (
  //         source &&
  //         source[0] &&
  //         source[1] &&
  //         filter.logicalOperator === "And" &&
  //         target.table === source[0] &&
  //         target.column === source[1]
  //       ) {
  //         const greaterThan = filter.conditions.find(
  //           (cond) => cond.operator === "GreaterThanOrEqual"
  //         );
  //         const lessThan = filter.conditions.find(
  //           (cond) => cond.operator === "LessThanOrEqual"
  //         );
  //         if (greaterThan && lessThan) {
  //           const range = {
  //             min: greaterThan.value,
  //             max: lessThan.value,
  //           };
  //           return {
  //             start: this.parseDate(range.min),
  //             end: singleDay
  //               ? this.parseDate(range.min)
  //               : this.parseDate(range.max),
  //           };
  //         }
  //       }
  //     }
  //   }
  //   return {
  //     start: startupFilter.start,
  //     end: singleDay ? startupFilter.start : startupFilter.end,
  //   };
  // };
  // private parseDate = (value: any): Date | null => {
  //   const typeOfValue: string = typeof value;
  //   let date: Date = value;
  //   if (typeOfValue === "number") {
  //     date = new Date(value, 0);
  //   }
  //   if (typeOfValue === "string") {
  //     date = new Date(value);
  //   }
  //   if (date && date instanceof Date && date.toString() !== "Invalid Date") {
  //     return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  //   }
  //   return null;
  // };
}
