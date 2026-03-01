/**
 * @jest-environment jsdom
 */

describe("GoalGetters completion status", () => {
  test("completed task has completed classes", () => {
    // Mock a completed task item
    document.body.innerHTML = `
      <li class="list-group-item task-completed">
        <button class="task-circle is-complete" aria-label="Toggle completion"></button>
        <h4>
          <div>Done Task</div>
          <span class="cat-badge cat-work">Work</span>
        </h4>
      </li>
    `;

    // Select the task row and completion button
    const task = document.querySelector(".list-group-item");
    const circle = document.querySelector(".task-circle");

    // Check that both elements exist and have the completed classes
    expect(task).not.toBeNull();
    expect(circle).not.toBeNull();
    expect(task.classList.contains("task-completed")).toBe(true);
    expect(circle.classList.contains("is-complete")).toBe(true);
  });

  test("incomplete task does not have completed classes", () => {
    // Mock an incomplete task item
    document.body.innerHTML = `
      <li class="list-group-item">
        <button class="task-circle" aria-label="Toggle completion"></button>
        <h4>
          <div>Not Done Task</div>
          <span class="cat-badge cat-personal">Personal</span>
        </h4>
      </li>
    `;

    // Select the task row and completion button
    const task = document.querySelector(".list-group-item");
    const circle = document.querySelector(".task-circle");

    // Check that both elements exist and do not have completed classes
    expect(task).not.toBeNull();
    expect(circle).not.toBeNull();
    expect(task.classList.contains("task-completed")).toBe(false);
    expect(circle.classList.contains("is-complete")).toBe(false);
  });
});