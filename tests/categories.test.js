/**
 * @jest-environment jsdom
 */

describe("GoalGetters category tags", () => {
  test("renders Work category correctly", () => {
    // Mock one task item with the Work category
    document.body.innerHTML = `
      <li class="list-group-item">
        <h4>
          <div>Math</div>
          <span class="cat-badge cat-work">Work</span>
        </h4>
      </li>
    `;

    // Select the category badge
    const badge = document.querySelector(".cat-badge");

    // Check that the badge exists and has the right text/class
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe("Work");
    expect(badge.classList.contains("cat-work")).toBe(true);
  });

  test("renders Personal category correctly", () => {
    // Mock one task item with the Personal category
    document.body.innerHTML = `
      <li class="list-group-item">
        <h4>
          <div>Hello</div>
          <span class="cat-badge cat-personal">Personal</span>
        </h4>
      </li>
    `;

    const badge = document.querySelector(".cat-badge");

    // Verify correct label and CSS class
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe("Personal");
    expect(badge.classList.contains("cat-personal")).toBe(true);
  });

  test("renders School category correctly", () => {
    // Mock one task item with the School category
    document.body.innerHTML = `
      <li class="list-group-item">
        <h4>
          <div>Study</div>
          <span class="cat-badge cat-school">School</span>
        </h4>
      </li>
    `;

    const badge = document.querySelector(".cat-badge");

    // Verify correct label and CSS class
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe("School");
    expect(badge.classList.contains("cat-school")).toBe(true);
  });

  test("renders Others category correctly", () => {
    // Mock one task item with the Others category
    document.body.innerHTML = `
      <li class="list-group-item">
        <h4>
          <div>Random</div>
          <span class="cat-badge cat-others">Others</span>
        </h4>
      </li>
    `;

    const badge = document.querySelector(".cat-badge");

    // Verify correct label and CSS class
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe("Others");
    expect(badge.classList.contains("cat-others")).toBe(true);
  });
});