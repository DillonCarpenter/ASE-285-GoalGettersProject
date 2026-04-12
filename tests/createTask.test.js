/**
 * @jest-environment jsdom
 */

describe("GoalGetters create task modal", () => {
  let openBtn;
  let closeBtn;
  let modal;
  let taskDate;

  function setupPage() {
    document.body.innerHTML = `
      <div class="write-actions nav-add-task">
        <button id="navOpenWriteModalBtn" class="btn btn-circle btn-add" type="button">+</button>
      </div>

      <div id="navWriteModal" class="write-modal-overlay" style="display:none;">
        <div class="write-modal">
          <div class="write-modal__header">
            <h2 class="write-modal__title">New Task</h2>
            <button id="navCloseWriteModalBtn" class="btn btn-circle" type="button">&times;</button>
          </div>
          <form action="/add" method="POST" class="write-modal__form">
            <div class="write-modal__group">
              <input id="navTaskTitle" type="text" class="form-control" name="title" placeholder="Title" required />
            </div>
            <div class="write-modal__group">
              <textarea id="navTaskDescription" class="form-control" name="description" placeholder="Description"></textarea>
            </div>
            <div class="write-modal__group">
              <input id="navTaskDate" type="date" class="form-control" name="date" required />
            </div>
            <div class="write-modal__group">
              <select id="navTaskCategory" class="form-control" name="category" required>
                <option value="" disabled selected hidden>Category</option>
                <option value="School">School</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Add Task</button>
          </form>
        </div>
      </div>
    `;

    openBtn = document.getElementById("navOpenWriteModalBtn");
    closeBtn = document.getElementById("navCloseWriteModalBtn");
    modal = document.getElementById("navWriteModal");
    taskDate = document.getElementById("navTaskDate");

    const today = new Date().toISOString().split("T")[0];
    taskDate.min = today;

    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  beforeEach(() => {
    setupPage();
  });

  test("opens modal when add task button is clicked", () => {
    expect(modal.style.display).toBe("none");

    openBtn.click();

    expect(modal.style.display).toBe("flex");
  });

  test("closes modal when close button is clicked", () => {
    modal.style.display = "flex";

    closeBtn.click();

    expect(modal.style.display).toBe("none");
  });

  test("closes modal when clicking overlay", () => {
    modal.style.display = "flex";

    modal.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(modal.style.display).toBe("none");
  });

  test("sets minimum date to today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(taskDate.min).toBe(today);
  });
});