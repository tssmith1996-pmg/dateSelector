import powerbi from "powerbi-visuals-api";
import { FONT_SIZE, FONT_FAMILY } from "./constants";

import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewCategoricalColumn = powerbi.DataViewCategoricalColumn;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import PrimitiveValue = powerbi.PrimitiveValue;

import { interactivityFilterService } from "powerbi-visuals-utils-interactivityutils";
import extractFilterColumnTarget = interactivityFilterService.extractFilterColumnTarget;

import { IAdvancedFilter } from "powerbi-models";

import {
  valueFormatter as vf,
  textMeasurementService as tms,
} from "powerbi-visuals-utils-formattingutils";

import IValueFormatter = vf.IValueFormatter;

import { pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";

import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import {
  VisualState,
  ViewportData,
  CategoryData,
  dateCardProps,
  dateRange,
} from "./interface";
import { getInitRange } from "./dateutils";

//Formatting Pane

export const optionsAreValid = (options: VisualUpdateOptions): boolean => {
  try {
    return !(
      !options ||
      !options.dataViews ||
      !options.dataViews[0] ||
      !options.viewport ||
      !options.dataViews[0]?.metadata?.columns?.length ||
      !options.dataViews[0].categorical.categories[0].source.type.dateTime
    );
  } catch (e) {
    return false;
  }
};

export const settingProps = (
  options: VisualUpdateOptions,
  formatSettings: any,
  initialised: boolean
): dateCardProps => {
  const {
    styleSettings: style,
    calendarSettings: calendar,
    layoutSettings: layout,
    periodSettings : period
    // daySettings: day,
    // weekSettings: week,
    // paySettings: pay,
    // monthSettings: month,
    // quarterSettings: quarter,
    // yearSettings: year,
  } = formatSettings;

  console.log(
    "optionsMapper - period:",
    period
  );

  const stepInit: string = calendar.stepInit.value.toString();
  const singleDay: boolean = calendar.singleDay.value;
  const rangeScope: dateRange = mapDataView(options).category.rangeValues;
  const weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 = getDayNum(
    period.periodWeek.weekStartDay.value.valueOf()
  );
  const yearStartMonth: number = getNum(period.periodYear.yearStartMonth.value.valueOf());
  const startRange: string = calendar.startRange.value.toString();

  const startupFilter = getInitRange(
    startRange,
    weekStartDay,
    yearStartMonth,
    rangeScope
  );

  const selectedDates =
    initialised || startRange === "sync"
      ? restoreRangeFilter(options, singleDay, startupFilter)
      : startupFilter;

  return {
    landingOff: optionsAreValid(options),
    dates: selectedDates,
    rangeScope: rangeScope,
    startRange: startRange,
    weekStartDay: weekStartDay,
    yearStartMonth: yearStartMonth,
    stepInit: stepInit,
    singleDay: singleDay,
    stepSkip: {
      day: period.periodDay.daySkip.value,
      week: period.periodWeek.weekSkip.value,
      pay: period.periodPay.paySkip.value,
      month: period.periodMonth.monthSkip.value,
      quarter: period.periodQuarter.quarterSkip.value,
      year: 1,
    },
    stepViz: {
      day: period.periodDay.showDay.value,
      week: period.periodWeek.showWeek.value,
      pay: period.periodPay.showPay.value,
      month: period.periodMonth.showMonth.value,
      quarter: period.periodQuarter.showQuarter.value,
      year: period.periodYear.showYear.value,
    },
    stepFmt: {
      day: period.periodDay.fmtDay.value.toString(),
      week: period.periodWeek.fmtWeek.value.toString(),
      pay: period.periodPay.fmtPay.value.toString(),
      month: period.periodMonth.fmtMonth.value.toString(),
      quarter: period.periodQuarter.fmtQuarter.value.toString(),
      year: period.periodYear.fmtYear.value.toString(),
    },
    payProps: {
      desc: "Pay-Period",
      ref: new Date(
        period.periodPay.payRefYear.value,
        getNum(period.periodPay.payRefMonth.value.valueOf()),
        period.periodPay.payRefDay.value
      ),
      len: period.periodPay.payLength.value,
    },
    showHelpIcon: layout.layoutHelp.showHelpIcon.value,
    showMove: layout.layoutMove.showMove.value,
    showExpand: layout.layoutMove.showExpand.value,
    showCurrent: layout.layoutCurrent.showCurrent.value,
    vizOpt: layout.layoutCurrent.showMore.value,
    showIconText: layout.layoutCurrent.showIconText.value,
    enableSlider: layout.layoutTimeline.enableSlider.value,
    showSlider: layout.layoutTimeline.showSlider.value,
    show2ndSlider: layout.layoutTimeline.show2ndSlider.value,
    themeColor: style.themeColor.value.value.valueOf(),
    themeFont: style.themeFont.value,
    themeMode: style.themeMode.value,
    fontSize: style.fontSize.value.toString(),
  };
};

const getDayNum = (n: number | string): 0 | 1 | 2 | 3 | 4 | 5 | 6 => {
  const num = typeof n === "number" ? n : parseInt(n, 10);
  const dayIndex = num % 7;
  return dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

const getNum = (n: number | string) => {
  return typeof n === "number" ? n : parseInt(n, 10);
};

const parseDate = (value: any): Date | null => {
  const typeOfValue: string = typeof value;
  let date: Date = value;
  if (typeOfValue === "number") {
    date = new Date(value, 0);
  }
  if (typeOfValue === "string") {
    date = new Date(value);
  }
  if (date && date instanceof Date && date.toString() !== "Invalid Date") {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  return null;
};

export const mapDataView = (
  options: VisualUpdateOptions
): Partial<VisualState> => {
  const dataView: DataView = options.dataViews[0];
  const categorical: DataViewCategorical | undefined = dataView.categorical;

  const category: DataViewCategoryColumn | undefined =
    categorical?.categories?.[0];

  const categorySource: DataViewMetadataColumn = (
    category as DataViewCategoricalColumn
  ).source;

  const filterTarget = extractFilterColumnTarget(categorySource);

  const categoriesFormatter: IValueFormatter = vf.create({
    format: vf.getFormatStringByColumn(categorySource),
  });

  const rangeScopeValues: string[] | undefined = category?.values.map(
    (value: PrimitiveValue) => categoriesFormatter.format(value)
  );

  const rangeScopeVals: dateRange = {
    start: parseDate(category.values[0]),
    end: parseDate(category.values[category.values.length - 1]),
  };

  const getStringLength = (text: string) =>
    tms.measureSvgTextWidth({
      text,
      fontFamily: FONT_FAMILY,
      fontSize: PixelConverter.toString(FONT_SIZE),
    });

  const maxCategoryNameWidth: number | undefined = rangeScopeValues?.reduce(
    (acc: number, value: string) =>
      getStringLength(value) > acc ? getStringLength(value) : acc,
    0
  );

  const categoryData = {
    displayName: categorySource.displayName,
    count: category?.values.length,
    rangeValues: rangeScopeVals,
    formatter: categoriesFormatter,
    maxWidth: maxCategoryNameWidth,
    filterTarget: filterTarget,
  } as CategoryData;

  return {
    category: categoryData,
  };
};

const restoreRangeFilter = (
  options: VisualUpdateOptions,
  singleDay: boolean,
  startupFilter: dateRange
) => {
  const jsonFilters: powerbi.IFilter[] = options.jsonFilters;
  const dataView: powerbi.DataView = options.dataViews[0];

  if (
    // startRange === "sync" &&
    jsonFilters &&
    dataView.metadata &&
    dataView.metadata.columns &&
    dataView.metadata.columns[0]
  ) {
    const filter = jsonFilters.find((filter): filter is IAdvancedFilter => {
      return (
        (filter as IAdvancedFilter).target !== undefined &&
        (filter as IAdvancedFilter).logicalOperator !== undefined &&
        (filter as IAdvancedFilter).conditions !== undefined
      );
    });
    //     console.log(
    // "/***************************************************************** */",
    //       "optionsMapper - Filter at load:",
    //       filter,
    //       startRange,
    //       startupFilter,
    // "/***************************************************************** */"
    // );
    if (filter) {
      const target = filter.target as { table: string; column: string };
      const source: string[] = String(
        dataView.metadata.columns[0].queryName
      ).split(".");
      if (
        source &&
        source[0] &&
        source[1] &&
        filter.logicalOperator === "And" &&
        target.table === source[0] &&
        target.column === source[1]
      ) {
        const greaterThan = filter.conditions.find(
          (cond) => cond.operator === "GreaterThanOrEqual"
        );
        const lessThan = filter.conditions.find(
          (cond) => cond.operator === "LessThanOrEqual"
        );
        if (greaterThan && lessThan) {
          const range = {
            min: greaterThan.value,
            max: lessThan.value,
          };
          return {
            start: parseDate(range.min),
            end: singleDay ? parseDate(range.min) : parseDate(range.max),
          };
        }
      }
    }
  }
  return {
    start: startupFilter.start,
    end: singleDay ? startupFilter.start : startupFilter.end,
  };
};

export const mapViewport = (viewport: IViewport): ViewportData => ({
  width: viewport.width,
  height: viewport.height,
});

export const mapOptionsToState = (
  options: VisualUpdateOptions,
  formatSettings: any,
  initialised: boolean
): VisualState => {
  // const dataView: DataView = options.dataViews[0];
  const dataViewPartial: Partial<VisualState> = mapDataView(options);
  const props: dateCardProps = settingProps(
    options,
    formatSettings,
    initialised
  );
  return {
    category: dataViewPartial.category,
    viewport: mapViewport(options.viewport),
    settings: props,
  };
};

export default mapOptionsToState;
