import { parseTargetFromQueryName } from "../src/utils/filters";

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
