/**
 * @jest-environment jsdom
 */

describe("GoalGetters sort and filter", () => {
  let searchInput;
  let taskList;
  let categoryFilter;
  let statusFilter;
  let overdueFilter;
  let sortSelect;
  let clearFiltersBtn;
  let sortMenu;
  let filterMenu;

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
    jest.useFakeTimers().setSystemTime(new Date("2026-03-10T00:00:00"));

    document.body.innerHTML = `
      <div class="toolbar">
        <input type="text" id="taskSearch" />
        <button id="clearFiltersBtn" type="button"></button>

        <div id="sortMenu" style="display:grid;"></div>
        <div id="filterMenu" style="display:grid;"></div>

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
            data-title="Homework"
            data-category="School"
            data-date="2026-03-08"
            data-description="Assignment"
            data-completed="false"></li>

        <li class="list-group-item"
            data-title="Office Task"
            data-category="Work"
            data-date="2026-03-12"
            data-description="Report"
            data-completed="true"></li>

        <li class="list-group-item"
            data-title="Shopping"
            data-category="Personal"
            data-date="2026-03-15"
            data-description="Buy food"
            data-completed="false"></li>
      </ul>
    `;

    searchInput = document.getElementById("taskSearch");
    sortSelect = document.getElementById("sortSelect");
    categoryFilter = document.getElementById("categoryFilter");
    statusFilter = document.getElementById("statusFilter");
    overdueFilter = document.getElementById("overdueFilter");
    clearFiltersBtn = document.getElementById("clearFiltersBtn");
    sortMenu = document.getElementById("sortMenu");
    filterMenu = document.getElementById("filterMenu");
    taskList = document.querySelector(".list-group");

    sortSelect.addEventListener("change", applyFiltersAndSort);
    categoryFilter.addEventListener("change", applyFiltersAndSort);
    statusFilter.addEventListener("change", applyFiltersAndSort);
    overdueFilter.addEventListener("change", applyFiltersAndSort);

    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = "";
      sortSelect.value = "";
      categoryFilter.value = "";
      statusFilter.value = "";
      overdueFilter.value = "";
      sortMenu.style.display = "none";
      filterMenu.style.display = "none";
      applyFiltersAndSort();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("filters tasks by category", () => {
    const tasks = document.querySelectorAll(".list-group-item");

    categoryFilter.value = "Work";
    categoryFilter.dispatchEvent(new Event("change"));

    expect(tasks[0].style.display).toBe("none");
    expect(tasks[1].style.display).toBe("");
    expect(tasks[2].style.display).toBe("none");
  });

  test("filters tasks by status", () => {
    const tasks = document.querySelectorAll(".list-group-item");

    statusFilter.value = "completed";
    statusFilter.dispatchEvent(new Event("change"));

    expect(tasks[0].style.display).toBe("none");
    expect(tasks[1].style.display).toBe("");
    expect(tasks[2].style.display).toBe("none");
  });

  test("filters overdue tasks correctly", () => {
    const tasks = document.querySelectorAll(".list-group-item");

    overdueFilter.value = "overdue";
    overdueFilter.dispatchEvent(new Event("change"));

    expect(tasks[0].style.display).toBe("");
    expect(tasks[1].style.display).toBe("none");
    expect(tasks[2].style.display).toBe("none");
  });

  test("sorts visible tasks by due date ascending", () => {
    sortSelect.value = "due-asc";
    sortSelect.dispatchEvent(new Event("change"));

    const reorderedTasks = document.querySelectorAll(".list-group-item");
    expect(reorderedTasks[0].dataset.title).toBe("Homework");
    expect(reorderedTasks[1].dataset.title).toBe("Office Task");
    expect(reorderedTasks[2].dataset.title).toBe("Shopping");
  });

  test("clear filters resets all inputs and hides menus", () => {
    searchInput.value = "home";
    sortSelect.value = "due-asc";
    categoryFilter.value = "School";
    statusFilter.value = "incomplete";
    overdueFilter.value = "overdue";

    clearFiltersBtn.click();

    expect(searchInput.value).toBe("");
    expect(sortSelect.value).toBe("");
    expect(categoryFilter.value).toBe("");
    expect(statusFilter.value).toBe("");
    expect(overdueFilter.value).toBe("");
    expect(sortMenu.style.display).toBe("none");
    expect(filterMenu.style.display).toBe("none");
  });
});