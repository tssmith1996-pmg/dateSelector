describe("local date serialization", () => {
  it("uses local calendar fields instead of UTC", () => {
    const fakeDate = {
      getFullYear: () => 2024,
      getMonth: () => 0,
      getDate: () => 1,
      toISOString: () => "2023-12-31T14:00:00.000Z",
    } as unknown as Date;

    jest.isolateModules(() => {
      const { toISODate } = require("../src/date/utils");
      const { toDateOnlyIso } = require("../src/utils/filters");

      expect(toISODate(fakeDate)).toBe("2024-01-01");
      expect(toDateOnlyIso(fakeDate)).toBe("2024-01-01");
    });
  });

  it("does not rely on Date#toISOString for serialization", () => {
    const date = new Date(2024, 0, 1);
    const spy = jest.spyOn(date, "toISOString").mockImplementation(() => {
      throw new Error("Unexpected toISOString call");
    });

    jest.isolateModules(() => {
      const { toISODate } = require("../src/date/utils");
      const { toDateOnlyIso } = require("../src/utils/filters");

      expect(() => toISODate(date)).not.toThrow();
      expect(() => toDateOnlyIso(date)).not.toThrow();
      expect(toISODate(date)).toBe("2024-01-01");
      expect(toDateOnlyIso(date)).toBe("2024-01-01");
    });

    spy.mockRestore();
  });
});
