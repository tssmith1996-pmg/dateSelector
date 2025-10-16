import * as models from "powerbi-models";
import { buildDateRangeFilter, parseTargetFromQueryName } from "../src/utils/filters";
import { DateRange } from "../src/types/dateRange";

describe("parseTargetFromQueryName", () => {
  it("parses table and column from bracket notation", () => {
    const target = parseTargetFromQueryName("'Sales Table'[Invoice Date]");
    expect(target).toEqual({ table: "Sales Table", column: "Invoice Date" });
  });

  it("parses first bracket pair when hierarchy levels are present", () => {
    const target = parseTargetFromQueryName("'Calendar'[Date].[Date Hierarchy]");
    expect(target).toEqual({ table: "Calendar", column: "Date" });
  });

  it("parses dotted identifiers", () => {
    const target = parseTargetFromQueryName("model.fact_table.date");
    expect(target).toEqual({ table: "model.fact_table", column: "date" });
  });

  it("returns undefined when query name is missing", () => {
    expect(parseTargetFromQueryName(undefined)).toBeUndefined();
  });

  it("normalizes escaped quotes", () => {
    const target = parseTargetFromQueryName("'Weird''Table'[Value]");
    expect(target).toEqual({ table: "Weird'Table", column: "Value" });
  });
});

describe("buildDateRangeFilter", () => {
  it("emits date-typed operands for the provided range", () => {
    const target: models.IFilterColumnTarget = { table: "Sales", column: "OrderDate" };
    const range: DateRange = {
      from: new Date(2024, 0, 1, 0, 0, 0, 0),
      to: new Date(2024, 0, 31, 23, 59, 59, 999),
    };

    const filter = buildDateRangeFilter(target, range);
    const json = filter.toJSON() as models.IAdvancedFilter;

    expect(json.target).toEqual(target);
    expect(json.conditions).toHaveLength(2);
    const lower = json.conditions?.[0]?.value;
    const upper = json.conditions?.[1]?.value;
    expect(lower).toBeInstanceOf(Date);
    expect(upper).toBeInstanceOf(Date);
    expect((lower as Date).getTime()).toBe(range.from.getTime());
    expect((upper as Date).getTime()).toBe(range.to.getTime());
  });
});
