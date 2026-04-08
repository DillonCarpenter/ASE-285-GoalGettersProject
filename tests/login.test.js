/**
 * @jest-environment jsdom
 */

describe("Task Master login page", () => {
  let usernameInput;
  let passwordInput;
  let passwordToggle;
  let submitBtn;
  let loginForm;
  let mockLocation;

  function setupPage() {
    document.body.innerHTML = `
      <h1>📝 Task Master</h1>
      <form id="loginForm" class="auth-forms">
        <input type="text" class="form-control" id="username" placeholder="Username" required />
        <div class="password-wrap">
          <input type="password" class="form-control" id="password" placeholder="Password" required />
          <button type="button" class="password-toggle" id="passwordToggle" aria-label="Show password" aria-pressed="false">Show</button>
        </div>
        <button type="submit" class="btn btn-primary" id="submitBtn" disabled>Sign In</button>
      </form>
    `;

    usernameInput = document.getElementById("username");
    passwordInput = document.getElementById("password");
    passwordToggle = document.getElementById("passwordToggle");
    submitBtn = document.getElementById("submitBtn");
    loginForm = document.getElementById("loginForm");

    const updateSubmitState = () => {
      const isReady =
        usernameInput.value.trim() !== "" &&
        passwordInput.value.trim() !== "";
      submitBtn.disabled = !isReady;
    };

    usernameInput.addEventListener("input", updateSubmitState);
    passwordInput.addEventListener("input", updateSubmitState);

    passwordToggle.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      passwordToggle.textContent = isHidden ? "Hide" : "Show";
      passwordToggle.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
      );
      passwordToggle.setAttribute("aria-pressed", String(isHidden));
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        mockLocation.href = "/";
      } else {
        const data = await response.json();
        alert(data.message || "Login failed");
      }
    });
  }

  beforeEach(() => {
    mockLocation = { href: "http://localhost/" };

    global.fetch = jest.fn();
    global.alert = jest.fn();

    setupPage();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("submit button is disabled at first", () => {
    expect(submitBtn.disabled).toBe(true);
  });

  test("enables submit button when username and password are filled", () => {
    usernameInput.value = "nana";
    usernameInput.dispatchEvent(new Event("input"));

    passwordInput.value = "secret123";
    passwordInput.dispatchEvent(new Event("input"));

    expect(submitBtn.disabled).toBe(false);
  });

  test("keeps submit button disabled if one field is empty", () => {
    usernameInput.value = "nana";
    usernameInput.dispatchEvent(new Event("input"));

    passwordInput.value = "";
    passwordInput.dispatchEvent(new Event("input"));

    expect(submitBtn.disabled).toBe(true);
  });

  test("toggles password visibility", () => {
    expect(passwordInput.type).toBe("password");
    expect(passwordToggle.textContent.trim()).toBe("Show");
    expect(passwordToggle.getAttribute("aria-label")).toBe("Show password");
    expect(passwordToggle.getAttribute("aria-pressed")).toBe("false");

    passwordToggle.click();

    expect(passwordInput.type).toBe("text");
    expect(passwordToggle.textContent.trim()).toBe("Hide");
    expect(passwordToggle.getAttribute("aria-label")).toBe("Hide password");
    expect(passwordToggle.getAttribute("aria-pressed")).toBe("true");

    passwordToggle.click();

    expect(passwordInput.type).toBe("password");
    expect(passwordToggle.textContent.trim()).toBe("Show");
    expect(passwordToggle.getAttribute("aria-label")).toBe("Show password");
    expect(passwordToggle.getAttribute("aria-pressed")).toBe("false");
  });

  test("submits login data and redirects on success", async () => {
    fetch.mockResolvedValue({ ok: true });

    usernameInput.value = "nana";
    passwordInput.value = "secret123";

    loginForm.dispatchEvent(new Event("submit"));

    await Promise.resolve();
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledWith("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "nana",
        password: "secret123"
      })
    });

    expect(mockLocation.href).toBe("/");
  });

  test("shows alert when login fails with server message", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Invalid credentials" })
    });

    usernameInput.value = "nana";
    passwordInput.value = "secret123";

    loginForm.dispatchEvent(new Event("submit"));

    await Promise.resolve();
    await Promise.resolve();

    expect(alert).toHaveBeenCalledWith("Invalid credentials");
  });

  test("shows fallback alert when login fails without server message", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({})
    });

    usernameInput.value = "nana";
    passwordInput.value = "secret123";

    loginForm.dispatchEvent(new Event("submit"));

    await Promise.resolve();
    await Promise.resolve();

    expect(alert).toHaveBeenCalledWith("Login failed");
  });
});