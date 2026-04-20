/**
 * @jest-environment jsdom
 */

describe("GoalGetters delete task", () => {
  function setupPage() {
    document.body.innerHTML = `
      <ul class="list-group">
        <li class="list-group-item" data-id="1">
          <div class="task-title">Homework</div>
          <div class="list-actions">
            <button class="btn btn-circle delete" data-id="1" aria-label="Delete task" title="Delete">
              Delete
            </button>
          </div>
        </li>

        <li class="list-group-item" data-id="2">
          <div class="task-title">Meeting</div>
          <div class="list-actions">
            <button class="btn btn-circle delete" data-id="2" aria-label="Delete task" title="Delete">
              Delete
            </button>
          </div>
        </li>
      </ul>
    `;

    document.addEventListener("click", async (e) => {
      const deleteButton = e.target.closest(".delete");
      if (!deleteButton) return;

      const id = deleteButton.dataset.id;

      try {
        const res = await fetch("/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: id })
        });

        if (!res.ok) throw new Error("Request failed");

        const li = deleteButton.closest("li");
        li.remove();
      } catch (err) {
        console.error(err);
      }
    });
  }

  beforeEach(() => {
    global.fetch = jest.fn();
    global.console.error = jest.fn();
    setupPage();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  test("removes task from DOM after successful delete", async () => {
    fetch.mockResolvedValue({ ok: true });

    const deleteButton = document.querySelector('.delete[data-id="1"]');
    const firstTask = deleteButton.closest("li");

    deleteButton.click();

    await Promise.resolve();
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledWith("/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: "1" })
    });

    expect(document.body.contains(firstTask)).toBe(false);
  });

  test("does not remove task if delete request fails", async () => {
    fetch.mockResolvedValue({ ok: false });

    const deleteButton = document.querySelector('.delete[data-id="1"]');
    const firstTask = deleteButton.closest("li");

    deleteButton.click();

    await Promise.resolve();
    await Promise.resolve();

    expect(document.body.contains(firstTask)).toBe(true);
    expect(console.error).toHaveBeenCalled();
  });
});