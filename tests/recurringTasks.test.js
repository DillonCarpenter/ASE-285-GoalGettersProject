/**
 * @jest-environment node
 */

function getNextDueDate(currentDate, recurrence) {
  const date = new Date(currentDate + "T00:00:00");

  if (recurrence === "daily") {
    date.setDate(date.getDate() + 1);
  } else if (recurrence === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (recurrence === "monthly") {
    date.setMonth(date.getMonth() + 1);
  } else {
    return null;
  }

  return date.toISOString().split("T")[0];
}

function shouldGenerateNextTask(task, nextDate) {
  if (!task.recurrence || task.recurrence === "none") return false;
  if (!nextDate) return false;
  if (!task.recurrenceEndDate) return true;

  const next = new Date(nextDate + "T00:00:00");
  const end = new Date(task.recurrenceEndDate + "T00:00:00");

  return next <= end;
}

describe("Recurring logic", () => {

  test("daily task generates next day", () => {
    const result = getNextDueDate("2026-04-20", "daily");
    expect(result).toBe("2026-04-21");
  });

  test("weekly task generates next week", () => {
    const result = getNextDueDate("2026-04-20", "weekly");
    expect(result).toBe("2026-04-27");
  });

  test("monthly task generates next month", () => {
    const result = getNextDueDate("2026-04-20", "monthly");
    expect(result).toBe("2026-05-20");
  });

  test("non-recurring returns null", () => {
    const result = getNextDueDate("2026-04-20", "none");
    expect(result).toBe(null);
  });

  test("should generate when within end date", () => {
    const task = {
      recurrence: "weekly",
      recurrenceEndDate: "2026-05-30"
    };

    const nextDate = "2026-04-27";

    expect(shouldGenerateNextTask(task, nextDate)).toBe(true);
  });

  test("should NOT generate when past end date", () => {
    const task = {
      recurrence: "weekly",
      recurrenceEndDate: "2026-04-25"
    };

    const nextDate = "2026-04-27";

    expect(shouldGenerateNextTask(task, nextDate)).toBe(false);
  });

  test("should NOT generate if recurrence is none", () => {
    const task = {
      recurrence: "none"
    };

    const nextDate = "2026-04-21";

    expect(shouldGenerateNextTask(task, nextDate)).toBe(false);
  });

});