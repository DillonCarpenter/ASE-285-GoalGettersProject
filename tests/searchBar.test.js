/**
 * @jest-environment jsdom
 */

describe("GoalGetters search bar", () => {
  let searchInput;
  let taskList;
  let categoryFilter;
  let statusFilter;
  let overdueFilter;
  let sortSelect;

  function parseDateValue(dateString) {
    if (!dateString) return null;
    const parsed = new Date(dateString + "T00:00:00");
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  function applyFiltersAndSort() {
    const searchValue = (searchInput?.value || "").toLowerCase().trim();
    const categoryValue = categoryFilter?.value || "";
    const statusValue = statusFilter?.value || "";
    const overdueValue = overdueFilter?.value || "";
    const sortValue = sortSelect?.value || "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = Array.from(document.querySelectorAll(".list-group-item"));

    tasks.forEach((task) => {
      const title = (task.dataset.title || "").toLowerCase();
      const category = task.dataset.category || "";
      const date = task.dataset.date || "";
      const description = (task.dataset.description || "").toLowerCase();
      const completed = task.dataset.completed === "true";

      const searchText = [title, category.toLowerCase(), date.toLowerCase(), description].join(" ");
      const matchesSearch = searchText.includes(searchValue);
      const matchesCategory = !categoryValue || category === categoryValue;
      const matchesStatus =
        !statusValue ||
        (statusValue === "completed" && completed) ||
        (statusValue === "incomplete" && !completed);

      const taskDate = parseDateValue(date);
      const isOverdue = taskDate ? taskDate < today && !completed : false;

      const matchesOverdue =
        !overdueValue ||
        (overdueValue === "overdue" && isOverdue) ||
        (overdueValue === "not-overdue" && !isOverdue);

      task.style.display =
        matchesSearch && matchesCategory && matchesStatus && matchesOverdue ? "" : "none";
    });

    const visibleTasks = tasks.filter((task) => task.style.display !== "none");

    visibleTasks.sort((a, b) => {
      if (sortValue === "due-asc" || sortValue === "due-desc") {
        const aDate = parseDateValue(a.dataset.date);
        const bDate = parseDateValue(b.dataset.date);

        const aTime = aDate ? aDate.getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = bDate ? bDate.getTime() : Number.MAX_SAFE_INTEGER;

        return sortValue === "due-asc" ? aTime - bTime : bTime - aTime;
      }

      return 0;
    });

    visibleTasks.forEach((task) => taskList.appendChild(task));
  }

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="toolbar">
        <input type="text" id="taskSearch" />
        <select id="sortSelect">
          <option value=""></option>
          <option value="due-asc">Due Date: Soonest to Latest</option>
          <option value="due-desc">Due Date: Latest to Soonest</option>
        </select>
        <select id="categoryFilter">
          <option value=""></option>
          <option value="School">School</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
        <select id="statusFilter">
          <option value=""></option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
        <select id="overdueFilter">
          <option value=""></option>
          <option value="overdue">Overdue</option>
          <option value="not-overdue">Not Overdue</option>
        </select>
      </div>

      <ul class="list-group">
        <li class="list-group-item"
            data-title="Math Homework"
            data-category="School"
            data-date="2026-03-05"
            data-description="Chapter 4 problems"
            data-completed="false"></li>

        <li class="list-group-item"
            data-title="Team Meeting"
            data-category="Work"
            data-date="2026-03-06"
            data-description="Sprint planning"
            data-completed="true"></li>

        <li class="list-group-item"
            data-title="Buy Groceries"
            data-category="Personal"
            data-date="2026-03-07"
            data-description="Milk and bread"
            data-completed="false"></li>
      </ul>
    `;

    searchInput = document.getElementById("taskSearch");
    sortSelect = document.getElementById("sortSelect");
    categoryFilter = document.getElementById("categoryFilter");
    statusFilter = document.getElementById("statusFilter");
    overdueFilter = document.getElementById("overdueFilter");
    taskList = document.querySelector(".list-group");

    searchInput.addEventListener("input", applyFiltersAndSort);
  });

  test("filters tasks by title in the search bar", () => {
    const tasks = document.querySelectorAll(".list-group-item");

    searchInput.value = "math";
    searchInput.dispatchEvent(new Event("input"));

    expect(tasks[0].style.display).toBe("");
    expect(tasks[1].style.display).toBe("none");
    expect(tasks[2].style.display).toBe("none");
  });

  test("filters tasks by description in the search bar", () => {
    const tasks = document.querySelectorAll(".list-group-item");

    searchInput.value = "sprint";
    searchInput.dispatchEvent(new Event("input"));

    expect(tasks[0].style.display).toBe("none");
    expect(tasks[1].style.display).toBe("");
    expect(tasks[2].style.display).toBe("none");
  });

  test("shows all tasks again when search input is cleared", () => {
    const tasks = document.querySelectorAll(".list-group-item");

    searchInput.value = "math";
    searchInput.dispatchEvent(new Event("input"));

    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));

    expect(tasks[0].style.display).toBe("");
    expect(tasks[1].style.display).toBe("");
    expect(tasks[2].style.display).toBe("");
  });
});