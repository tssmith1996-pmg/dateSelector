/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
// powerbi viz stuff
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import VisualUpdateType = powerbi.VisualUpdateType;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

// filter stuff
import { AdvancedFilter, IFilterColumnTarget } from "powerbi-models";
import { interactivityFilterService } from "powerbi-visuals-utils-interactivityutils";
import extractFilterColumnTarget = interactivityFilterService.extractFilterColumnTarget;

// Formatting Options Panel
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettingsModel } from "./vsettings";
// import format from "date-fns/format";

// React integration
import * as React from "react";
import { render } from "react-dom";

// react application interfaces
import DateCardClass from "./dateRangeSelector";
import { getInitRange } from "./dateutils";

import tinycolor from "tinycolor2";
// import format from "date-fns/format";

export class Visual implements IVisual {
  private target: HTMLElement;
  private reactRoot: React.ComponentElement<any, any>;
  private host: powerbi.extensibility.visual.IVisualHost;
  private events: IVisualEventService;

  // formatiing pane
  private formattingSettings: VisualSettingsModel;
  private previousSettings: VisualSettingsModel | null = null;
  private formattingSettingsService: FormattingSettingsService;

  // state setting
  private initialized: boolean = false;
  private singleDay: boolean = false;

  // filter object
  private static filterObjectProperty: {
    objectName: string;
    propertyName: string;
  } = { objectName: "general", propertyName: "filter" };
  private filterTarget!: IFilterColumnTarget;

  // Initial date selection
  // scope range determined by data view
  private rangeScope: {
    start: Date | null;
    end: Date | null;
  } = { start: null, end: null };
  private lastRangeScope: {
    start: Date | null;
    end: Date | null;
  };
  // filter range determined by visual
  private dateInitRange: string;
  public start: Date | null = null;
  public end: Date | null = null;
  private dateRangeFilter: {
    start: Date | null;
    end: Date | null;
  } = { start: null, end: null };
  private prevFilteredStartDate: Date | null = null;
  private prevFilteredEndDate: Date | null = null;

  private isHighContrast: boolean;
  private foregroundColor: string;
  private backgroundColor: string;

  constructor(options: VisualConstructorOptions) {
    // console.log('Visual constructor') //, options);
    //Formatting Pane
    this.formattingSettingsService = new FormattingSettingsService();

    this.host = options.host;

    this.isHighContrast = this.host.colorPalette.isHighContrast;
      // console.log(this.isHighContrast);
    if (this.isHighContrast) {
      this.foregroundColor = this.host.colorPalette.foreground.value;
      this.backgroundColor = this.host.colorPalette.background.value;
      DateCardClass.update({
        themeColor: this.foregroundColor,
        themeMode: tinycolor(this.backgroundColor).isDark() ? "dark" : "light",
      });
      // console.log("isHighContrast");
    }

    // React integration
    this.reactRoot = React.createElement(DateCardClass, {
      onChanged: this.handleVal,
    });
    this.target = options.element;
    this.host = options.host;
    this.host.hostCapabilities.allowInteractions = false;
    render(this.reactRoot, this.target);
    this.events = options.host.eventService;
  }

  public update(options: VisualUpdateOptions) {
    // console.log("Update: ", options);
    // Check if options are valid
    // console.log("Contrast:", this.isHighContrast, this.foregroundColor);

    if (!Visual.areOptionsValid(options)) {
      this.clearData();
      return;
    }

    this.events.renderingStarted(options);

    // Get formatting settings
    this.formattingSettings =
      this.formattingSettingsService.populateFormattingSettingsModel(
        VisualSettingsModel,
        options.dataViews[0]
      );

    const isDataUpdate = options.type === VisualUpdateType.Data;
    const isSettingsUpdate = this.previousSettings !== this.formattingSettings;

    const dataView: DataView = options.dataViews[0];

    if (Visual.isDataViewValid(dataView)) {
      this.clearData();
      return;
    }

    const cat: powerbi.DataViewCategoryColumn =
      dataView.categorical.categories[0];
    this.setFilterValues(options.jsonFilters as AdvancedFilter[]);

    // Initialise the page
    if (!this.initialized) {
      this.filterTarget = extractFilterColumnTarget(cat);
    }

    // console.log("Init? ", this.initialized, "DataUpdate: ", isDataUpdate);

    // Set up the date range scope of the slider
    if (!this.initialized || isDataUpdate) {
      // Get the date values for the timeline end points
      const len: number = cat.values.length - 1;
      const minDate: Date = this.parseDate(cat.values[0]);
      const maxDate: Date = this.parseDate(cat.values[len]);
      this.rangeScope = {
        start: minDate,
        end: maxDate,
      };

      // Update the date scope if changed
      if (this.rangeScope !== this.lastRangeScope) {
        DateCardClass.update({
          rangeScope: this.rangeScope,
        });
        this.lastRangeScope = this.rangeScope;
      }
    }

    // console.log("Update Rest of Cards");
    this.doCards(isSettingsUpdate);

    // if (isSettingsUpdate)
    // console.log("Update Date Ranges");
    this.doDates();

    this.initialized = true;
    this.events.renderingFinished(options);
  }

  private doDates = () => {
    const calendar = this.formattingSettings.calendarCard;
    const startRange = calendar.startRange.value.toString();
    const year = this.formattingSettings.yearCard;
    const week = this.formattingSettings.weekCard;

    this.prevFilteredStartDate = this.start;
    this.prevFilteredEndDate = this.singleDay ? this.start : this.end;
    this.singleDay = calendar.singleDay.value;

    const fltr = getInitRange(
      startRange,
      this.getDayNum(week.weekStartDay.value.valueOf()),
      this.getNum(year.yearStartMonth.value.valueOf()),
      this.rangeScope
    );

    if (startRange === "sync") {
      this.start = this.start === null ? this.rangeScope.start : this.start;
      this.end = this.end === null ? this.rangeScope.end : this.end;
    } else if (!this.initialized) {
      this.start = fltr.start;
      this.end = fltr.end;
    }

    const isFilterChanged: boolean =
      String(this.prevFilteredStartDate) !== String(this.start) ||
      String(this.prevFilteredEndDate) !== String(this.end);

    // console.log("changed: ", isFilterChanged);
    // check if an init range has already been set up
    if (
      startRange === "sync" ||
      (this.initialized && this.dateInitRange === startRange)
    ) {
      this.dateRangeFilter = {
        start: this.start,
        end: this.singleDay ? this.start : this.end,
      };
    } else {
      this.dateRangeFilter = {
        start: fltr.start,
        end: this.singleDay ? fltr.start : fltr.end,
      };
    }
    // console.log("filter: ", this.dateRangeFilter);

    this.dateInitRange = startRange;

    if (isFilterChanged || !this.initialized) {
      DateCardClass.update({
        dates: this.dateRangeFilter,
      });

      // if (!this.initialized || startRange !== "sync" && this.start === fltr.start) {
      this.handleVal([this.dateRangeFilter.start, this.dateRangeFilter.end]);

      // console.log({
      //   StartFilter: format(this.dateRangeFilter.start, "dd/MM/yyyy"), // this.dateRangeFilter.start,
      //   EndFilter: format(this.dateRangeFilter.end, "dd/MM/yyyy"), // this.dateRangeFilter.end},
      // });
    }
  };

  private doCards = (isSettingsUpdate: boolean) => {
    // console.log("Cards: ", isSettingsUpdate);

    if (isSettingsUpdate) {
      this.previousSettings = this.formattingSettings;
      const calendar = this.formattingSettings.calendarCard;
      const style = this.formattingSettings.styleCard;
      const config = this.formattingSettings.configCard;
      const day = this.formattingSettings.dayCard;
      const week = this.formattingSettings.weekCard;
      const pay = this.formattingSettings.payCard;
      const month = this.formattingSettings.monthCard;
      const quarter = this.formattingSettings.quarterCard;
      const year = this.formattingSettings.yearCard;

      // console.log(config.show2ndSlider.value);

      DateCardClass.update({
        weekStartDay: this.getDayNum(week.weekStartDay.value.valueOf()),
        yearStartMonth: this.getNum(year.yearStartMonth.value.valueOf()),
        stepInit: calendar.stepInit.value.toString(),
        singleDay: calendar.singleDay.value,
        showMove: config.showMove.value,
        enableSlider: config.enableSlider.value,
        stepSkip: {
          day: day.daySkip.value,
          week: week.weekSkip.value,
          pay: pay.paySkip.value,
          month: month.monthSkip.value,
          quarter: quarter.quarterSkip.value,
          year: 1,
        },
        stepViz: {
          day: day.showDay.value,
          week: week.showWeek.value,
          pay: pay.showPay.value,
          month: month.showMonth.value,
          quarter: quarter.showQuarter.value,
          year: year.showYear.value,
        },
        stepFmt: {
          day: day.fmtDay.value.toString(),
          week: week.fmtWeek.value.toString(),
          pay: pay.fmtPay.value.toString(),
          month: month.fmtMonth.value.toString(),
          quarter: quarter.fmtQuarter.value.toString(),
          year: year.fmtYear.value.toString(),
        },
        payProps: {
          desc: "Pay-Period",
          ref: new Date(
            pay.payRefYear.value,
            this.getNum(pay.payRefMonth.value.valueOf()),
            pay.payRefDay.value
          ),
          len: pay.payLength.value,
        },
        showHelpIcon: config.showHelpIcon.value,
        showCurrent: config.showCurrent.value,
        vizOpt: config.showMore.value,
        showIconText: config.showIconText.value,
        showSlider: !config.showSlider.value,
        show2ndSlider: config.show2ndSlider.value,
        themeColor: this.isHighContrast
          ? this.foregroundColor
          : style.themeColor.value.value,
        themeFont: style.themeFont.value,
        themeMode: this.isHighContrast
          ? tinycolor(this.backgroundColor).isDark()
            ? "dark"
            : "light"
          : style.themeMode.value,
        fontSize: style.fontSize.value.toString(),
      });
    }
  };

  private clearData(): void {
    console.log("cleared ");
    this.initialized = false;
    this.dateInitRange = undefined;
    // DateCardClass.update(initialState);
  }

  private getNum = (n: number | string) => {
    return typeof n === "number" ? n : parseInt(n, 10);
  };
  private getDayNum = (n: number | string): 0 | 1 | 2 | 3 | 4 | 5 | 6 => {
    const num = typeof n === "number" ? n : parseInt(n, 10);
    const dayIndex = num % 7;
    return dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  };
  // private numberToString(n: number | string): string {
  //   return typeof n === "number" ? n.toString() : n;
  // }

  /**
   * Event listener for React date changes
   */
  private handleVal = (value: [Date, Date]) => {
    this.start = value[0];
    this.end = value[1];
    this.dateRangeFilter = { start: this.start, end: this.end };
    this.updatePrevFilterState(this.start, this.end, this.filterTarget);
  };

  private setFilterValues = (jsonFilters: AdvancedFilter[]) => {
    if (
      jsonFilters &&
      jsonFilters[0] &&
      jsonFilters[0].conditions &&
      jsonFilters[0].conditions[0] &&
      jsonFilters[0].conditions[1]
    ) {
      const startDate: Date = new Date(`${jsonFilters[0].conditions[0].value}`);
      const endDate: Date = new Date(
        `${jsonFilters[0].conditions[this.singleDay ? 0 : 1].value}`
      );

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        this.start = startDate;
        this.end = endDate;
      } else {
        this.start = null;
      }
    } else {
      this.start = null;
    }
  };

  // Apply the filter
  public applyDatePeriod(
    startDate: Date,
    endDate: Date,
    filterTarget: IFilterColumnTarget
  ): void {
    this.host.applyJsonFilter(
      this.createFilter(startDate, endDate, filterTarget),
      Visual.filterObjectProperty.objectName,
      Visual.filterObjectProperty.propertyName,
      this.getFilterAction(startDate, endDate)
    );
  }

  // Create the filter
  public createFilter(
    startDate: Date,
    endDate: Date,
    filterTarget: IFilterColumnTarget
  ): AdvancedFilter {
    if (startDate == null || endDate == null || !filterTarget) {
      return null;
    }

    return new AdvancedFilter(
      filterTarget,
      "And",
      {
        operator: "GreaterThanOrEqual",
        value: startDate.toJSON(),
      },
      {
        operator: "LessThanOrEqual",
        value: endDate.toJSON(),
      }
    );
  }

  // Clear the filter
  public clearSelection(target: IFilterColumnTarget): void {
    this.prevFilteredStartDate = null;
    this.prevFilteredEndDate = null;

    this.applyDatePeriod(null, null, target);
  }

  // Update the filter
  private updatePrevFilterState(
    startDate: Date,
    endDate: Date,
    target: IFilterColumnTarget
  ): void {
    const isFilterChanged: boolean =
      String(this.prevFilteredStartDate) !== String(startDate) ||
      String(this.prevFilteredEndDate) !== String(endDate);
    // console.log("isFilterChanged", isFilterChanged)

    if (isFilterChanged) {
      this.applyDatePeriod(startDate, endDate, target);
    }

    this.prevFilteredStartDate = startDate;
    this.prevFilteredEndDate = endDate;
  }

  // Clean up
  public getFilterAction(startDate: Date, endDate: Date): powerbi.FilterAction {
    return startDate !== null && endDate !== null
      ? powerbi.FilterAction.merge
      : powerbi.FilterAction.remove;
  }

  private static areOptionsValid(
    options: powerbi.extensibility.visual.VisualUpdateOptions
  ): boolean {
    // check that we have a valid dataview
    if (
      !options ||
      !options.dataViews ||
      !options.dataViews[0] ||
      !options.dataViews[0].metadata ||
      !Visual.isDataViewCategoricalValid(options.dataViews[0].categorical)
    ) {
      return true;
    } else return false;
  }

  // check that the field is a date
  private static isDataViewCategoricalValid(
    dataViewCategorical: powerbi.DataViewCategorical
  ): boolean {
    return (
      !dataViewCategorical ||
      !dataViewCategorical.categories ||
      dataViewCategorical.categories.length !== 1 ||
      !dataViewCategorical.categories[0].values ||
      dataViewCategorical.categories[0].values.length === 0 ||
      !dataViewCategorical.categories[0].source ||
      !dataViewCategorical.categories[0].source.type.dateTime
    );
  }

  private static isDataViewValid(dataView: powerbi.DataView): boolean {
    if (
      !dataView ||
      !dataView.categorical ||
      !dataView.metadata ||
      dataView.categorical.categories.length <= 0 ||
      !dataView.categorical.categories[0] ||
      !dataView.categorical.categories[0].identityFields ||
      dataView.categorical.categories[0].identityFields.length <= 0
    ) {
      return true;
    }
    return false;
  }
  private parseDate(value: any): Date | null {
    const typeOfValue: string = typeof value;
    let date: Date = value;

    if (typeOfValue === "number") {
      date = new Date(value, 0);
    }

    if (typeOfValue === "string") {
      date = new Date(value);
    }

    if (date && date instanceof Date && date.toString() !== "Invalid Date") {
      return this.getYmd(date);
    }

    return null;
  }

  private getYmd(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  /**
   * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
   * This method is called once every time we open properties pane or when the user edit any format property.
   */
  public getFormattingModel(): powerbi.visuals.FormattingModel {
    // console.log(this.formattingSettings)
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }
}

// console.log("Init? ", this.initialized, {
//   startRange: startRange,
//   InitRange: this.dateInitRange,
//   start: format(this.start,"dd/MM/yyyy"),
//   end: format(this.end,"dd/MM/yyyy"),
//   // this_rangeScope_start: this.rangeScope.start,
//   // this_rangeScope_end: this.rangeScope.end,
//   filter_START: format(this.dateRangeFilter.start,"dd/MM/yyyy"), // this.dateRangeFilter.start,
//   filter_END: format(this.dateRangeFilter.end,"dd/MM/yyyy") // this.dateRangeFilter.end,
// });
