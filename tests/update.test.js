/**
 * @jest-environment jsdom
 */

describe("GoalGetters update task form", () => {
  let form;
  let saveBtn;
  let taskTitle;
  let taskDescription;
  let taskDate;
  let taskCategory;

  function setupPage() {
    document.body.innerHTML = `
      <div class="write-modal-overlay">
        <div class="write-modal">
          <div class="write-modal__header">
            <h2 class="write-modal__title">Task Details</h2>
            <a id="closeWriteModalBtn" href="/list" class="btn btn-circle" aria-label="Close">&times;</a>
          </div>

          <form action="/edit?_method=PUT" method="POST" class="write-modal__form">
            <input type="hidden" name="id" value="1">

            <div class="write-modal__group">
              <input
                id="taskTitle"
                type="text"
                class="form-control"
                name="title"
                value="Homework"
                data-initial="Homework"
                placeholder="Title"
              />
            </div>

            <div class="write-modal__group">
              <textarea
                id="taskDescription"
                class="form-control"
                name="description"
                data-initial="Chapter 4"
                placeholder="Description"
              >Chapter 4</textarea>
            </div>

            <div class="write-modal__group">
              <input
                id="taskDate"
                type="date"
                class="form-control"
                name="date"
                value="2026-04-10"
                data-initial="2026-04-10"
                required
              />
            </div>

            <div class="write-modal__group">
              <select
                id="taskCategory"
                class="form-control"
                name="category"
                required
                data-initial="School"
              >
                <option value="School" selected>School</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <button id="saveBtn" type="submit" class="btn btn-primary is-disabled" disabled>Save</button>
          </form>
        </div>
      </div>
    `;

    form = document.querySelector(".write-modal__form");
    saveBtn = document.getElementById("saveBtn");
    taskTitle = document.getElementById("taskTitle");
    taskDescription = document.getElementById("taskDescription");
    taskDate = document.getElementById("taskDate");
    taskCategory = document.getElementById("taskCategory");

    const today = new Date().toISOString().split("T")[0];

    if (taskDate) {
      taskDate.min = today;
    }

    // make sure dataset initial values are exactly set in jsdom
    taskTitle.dataset.initial = "Homework";
    taskDescription.dataset.initial = "Chapter 4";
    taskDate.dataset.initial = "2026-04-10";
    taskCategory.dataset.initial = "School";

    const updateSaveState = () => {
      const fields = form.querySelectorAll("[data-initial]");
      const changed = Array.from(fields).some(
        (field) => field.value !== field.dataset.initial
      );

      saveBtn.disabled = !changed;
      saveBtn.classList.toggle("is-disabled", !changed);
    };

    form.addEventListener("input", updateSaveState);
    form.addEventListener("change", updateSaveState);

    form.addEventListener("submit", (e) => {
      if (!taskDate.value) {
        e.preventDefault();
        alert("Please select a date.");
        return;
      }

      if (taskDate.value < today) {
        e.preventDefault();
        alert("Date cannot be in the past.");
      }
    });

    updateSaveState();
  }

  beforeEach(() => {
    global.alert = jest.fn();
    setupPage();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("save button is disabled at first when nothing changed", () => {
    expect(saveBtn.disabled).toBe(true);
    expect(saveBtn.classList.contains("is-disabled")).toBe(true);
  });

  test("enables save button when title changes", () => {
    taskTitle.value = "Updated Homework";
    taskTitle.dispatchEvent(new Event("input", { bubbles: true }));
    taskTitle.dispatchEvent(new Event("change", { bubbles: true }));

    expect(saveBtn.disabled).toBe(false);
    expect(saveBtn.classList.contains("is-disabled")).toBe(false);
  });

  test("enables save button when description changes", () => {
    taskDescription.value = "New description";
    taskDescription.dispatchEvent(new Event("input", { bubbles: true }));
    taskDescription.dispatchEvent(new Event("change", { bubbles: true }));

    expect(saveBtn.disabled).toBe(false);
    expect(saveBtn.classList.contains("is-disabled")).toBe(false);
  });

  test("enables save button when category changes", () => {
    taskCategory.value = "Work";
    taskCategory.dispatchEvent(new Event("change", { bubbles: true }));

    expect(saveBtn.disabled).toBe(false);
    expect(saveBtn.classList.contains("is-disabled")).toBe(false);
  });

  test("enables save button when date changes", () => {
    taskDate.value = "2026-04-12";
    taskDate.dispatchEvent(new Event("input", { bubbles: true }));
    taskDate.dispatchEvent(new Event("change", { bubbles: true }));

    expect(saveBtn.disabled).toBe(false);
    expect(saveBtn.classList.contains("is-disabled")).toBe(false);
  });

  test("prevents submit if date is empty", () => {
    const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
    taskDate.value = "";

    form.dispatchEvent(submitEvent);

    expect(alert).toHaveBeenCalledWith("Please select a date.");
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  test("prevents submit if date is in the past", () => {
    const todayDate = new Date();
    const yesterday = new Date(todayDate);
    yesterday.setDate(todayDate.getDate() - 1);
    const pastDate = yesterday.toISOString().split("T")[0];

    const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
    taskDate.value = pastDate;

    form.dispatchEvent(submitEvent);

    expect(alert).toHaveBeenCalledWith("Date cannot be in the past.");
    expect(submitEvent.defaultPrevented).toBe(true);
  });
});