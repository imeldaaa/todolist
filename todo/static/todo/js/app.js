document.addEventListener("DOMContentLoaded", () => {
  const template = document.getElementById("task-item-template");

  document.querySelectorAll(".card").forEach((card) => {
    const personId = card.dataset.personId;
    const addForm = card.querySelector('[data-role="add-form"]');
    const todoList = card.querySelector('[data-role="todo-list"]');
    const doneList = card.querySelector('[data-role="done-list"]');
    const todoCount = card.querySelector('[data-role="todo-count"]');
    const doneCount = card.querySelector('[data-role="done-count"]');
    const doneToggle = card.querySelector('[data-role="done-toggle"]');

    doneToggle.addEventListener("click", () => {
      const isHidden = doneList.hasAttribute("hidden");
      if (isHidden) {
        doneList.removeAttribute("hidden");
        doneToggle.classList.add("is-open");
      } else {
        doneList.setAttribute("hidden", "");
        doneToggle.classList.remove("is-open");
      }
    });

    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleInput = addForm.querySelector(".input-title");
      const dateInput = addForm.querySelector(".input-date");
      const title = titleInput.value.trim();
      if (!title) return;

      const body = new URLSearchParams();
      body.set("person_id", personId);
      body.set("title", title);
      body.set("deadline", dateInput.value || "");

      const res = await fetch("/task/add/", {
        method: "POST",
        headers: {
          "X-CSRFToken": window.CSRF_TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || "Gagal menambah tugas");
        return;
      }

      const li = buildTaskItem(data.task);
      insertSortedByDeadline(todoList, li, data.task.deadline);
      updateCount(todoCount, todoList.children.length);
      titleInput.value = "";
      dateInput.value = "";
      titleInput.focus();
    });

    card.addEventListener("change", async (e) => {
      if (e.target.dataset.role !== "toggle") return;
      const item = e.target.closest(".task-item");
      const taskId = item.dataset.taskId;

      const res = await fetch(`/task/${taskId}/toggle/`, {
        method: "POST",
        headers: { "X-CSRFToken": window.CSRF_TOKEN },
      });
      const data = await res.json();
      if (!data.ok) return;

      item.remove();
      if (data.is_done) {
        item.classList.add("task-item--done");
        const deadlineEl = item.querySelector(".task-deadline");
        deadlineEl.className = "task-deadline is-done-date";
        deadlineEl.textContent = `Selesai ${data.completed_at_display}`;
        doneList.prepend(item);
      } else {
        item.classList.remove("task-item--done");
        insertSortedByDeadline(todoList, item, item.dataset.deadlineIso || null);
      }
      updateCount(todoCount, todoList.children.length);
      updateCount(doneCount, doneList.children.length);
    });

    card.addEventListener("click", async (e) => {
      if (e.target.dataset.role !== "delete") return;
      const item = e.target.closest(".task-item");
      const taskId = item.dataset.taskId;
      if (!confirm("Hapus tugas ini?")) return;

      const res = await fetch(`/task/${taskId}/delete/`, {
        method: "POST",
        headers: { "X-CSRFToken": window.CSRF_TOKEN },
      });
      const data = await res.json();
      if (!data.ok) return;

      item.remove();
      updateCount(todoCount, todoList.children.length);
      updateCount(doneCount, doneList.children.length);
    });
  });

  function buildTaskItem(task) {
    const node = template.content.cloneNode(true);
    const li = node.querySelector(".task-item");
    li.dataset.taskId = task.id;
    li.dataset.deadlineIso = task.deadline || "";
    li.querySelector(".task-title").textContent = task.title;

    const deadlineEl = li.querySelector(".task-deadline");
    if (task.deadline) {
      deadlineEl.textContent = task.deadline_display;
      if (task.deadline < window.TODAY_ISO) deadlineEl.classList.add("is-overdue");
      else if (task.deadline === window.TODAY_ISO) deadlineEl.classList.add("is-today");
    } else {
      deadlineEl.textContent = "Tanpa deadline";
      deadlineEl.classList.add("is-none");
    }
    return li;
  }

  function insertSortedByDeadline(list, li, deadlineIso) {
    const items = Array.from(list.children);
    const target = deadlineIso || "9999-99-99"; // no-deadline sorts last
    const nextSibling = items.find((item) => {
      const other = item.dataset.deadlineIso || "9999-99-99";
      return other > target;
    });
    if (nextSibling) list.insertBefore(li, nextSibling);
    else list.appendChild(li);
  }

  function updateCount(el, value) {
    if (el) el.textContent = value;
  }
});
