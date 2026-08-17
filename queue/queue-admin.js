(() => {
  const Q = window.Q;
  const { db, S, $, out, tagOpts, byTag, admin, toast } = Q;

  const slug = (v) => out(v).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "section";

  function renderAdmin() {
    renderSections();
    renderBacklog();
  }

  function renderSections() {
    const list = $("#section-list");
    list.replaceChildren();

    S.sections.forEach((s) => {
      const row = document.createElement("div");
      row.className = "section-row";
      row.draggable = true;
      row.dataset.id = s.id;
      row.innerHTML = `
        <span class="drag-handle">☷</span>
        <div class="section-fields">
          <input class="section-title" value="${out(s.title)}" maxlength="60">
          <input class="section-tag" value="${out(s.sort_tag)}" maxlength="40">
          <input class="section-subtitle" value="${out(s.subtitle || "")}" maxlength="80">
          <select class="section-accent">
            <option ${s.accent === "violet" ? "selected" : ""}>violet</option>
            <option ${s.accent === "mint" ? "selected" : ""}>mint</option>
            <option ${s.accent === "pink" ? "selected" : ""}>pink</option>
            <option ${s.accent === "gold" ? "selected" : ""}>gold</option>
          </select>
        </div>
        <div class="row-actions">
          <button class="save" type="button">Save</button>
          <button class="del" type="button">Delete</button>
        </div>`;

      row.querySelector(".save").onclick = async () => {
        const result = await db.from("queue_sections").update({
          title: row.querySelector(".section-title").value.trim(),
          sort_tag: slug(row.querySelector(".section-tag").value),
          subtitle: row.querySelector(".section-subtitle").value.trim(),
          accent: row.querySelector(".section-accent").value
        }).eq("id", s.id);
        if (result.error) return toast(result.error.message);
        toast("Lane saved ✦");
        loadQueue();
      };

      row.querySelector(".del").onclick = async () => {
        if (!confirm(`Delete “${s.title}”? Requests return to new request.`)) return;
        const result = await db.from("queue_sections").delete().eq("id", s.id);
        if (result.error) return toast(result.error.message);
        loadQueue();
      };

      row.addEventListener("dragstart", () => row.classList.add("dragging"));
      row.addEventListener("dragend", saveSectionOrder);
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        const dragging = $(".section-row.dragging");
        if (dragging && dragging !== row) {
          const bounds = row.getBoundingClientRect();
          list.insertBefore(dragging, event.clientY < bounds.top + bounds.height / 2 ? row : row.nextSibling);
        }
      });

      list.append(row);
    });

    $("#section-limit").textContent = `${S.sections.length} / 4 custom sections`;
    $("#add-section").disabled = S.sections.length >= 4;
  }

  async function saveSectionOrder() {
    const rows = [...$("#section-list").children];
    for (let i = 0; i < rows.length; i++) {
      await db.from("queue_sections").update({ position: i + 1 }).eq("id", rows[i].dataset.id);
    }
    loadQueue();
  }

  async function addSection() {
    if (S.sections.length >= 4) return;
    const n = S.sections.length + 1;
    const result = await db.from("queue_sections").insert({
      title: `Lane ${n}`,
      sort_tag: `lane-${n}`,
      subtitle: "Custom commission lane",
      position: n
    });
    if (result.error) return toast(result.error.message);
    loadQueue();
  }

  function renderBacklog() {
    const list = $("#backlog-list");
    list.replaceChildren();

    if (!S.entries.length) {
      list.innerHTML = '<p style="opacity:.5">No requests yet. The inbox is suspiciously peaceful. ✦</p>';
      return;
    }

    S.entries.forEach((e) => {
      const row = document.createElement("article");
      row.className = `backlog-card ${e.approval_status === "pending" ? "is-pending" : ""}`;
      row.draggable = true;
      row.dataset.id = e.id;
      row.innerHTML = `
        <div class="backlog-main">
          <strong>${out(e.public_name)} — ${out(e.public_type)}</strong>
          <small>${e.manual_entry ? "Manual entry" : "Commission request"} · ${new Date(e.created_at).toLocaleString()}</small><br>
          <span class="backlog-tag">${out(e.sort_tag)}</span>
        </div>
        <div class="backlog-actions">
          <select class="tag">${tagOpts(e.sort_tag)}</select>
          <select class="approval">
            <option value="pending" ${e.approval_status === "pending" ? "selected" : ""}>Pending approval</option>
            <option value="approved" ${e.approval_status === "approved" ? "selected" : ""}>Approved / live</option>
            <option value="rejected" ${e.approval_status === "rejected" ? "selected" : ""}>Rejected</option>
          </select>
          <select class="pub">
            <option ${e.public_status === "Waiting" ? "selected" : ""}>Waiting</option>
            <option ${e.public_status === "In progress" ? "selected" : ""}>In progress</option>
            <option ${e.public_status === "On hold" ? "selected" : ""}>On hold</option>
            <option ${e.public_status === "Complete" ? "selected" : ""}>Complete</option>
          </select>
          <button class="save" type="button">Save</button>
          ${e.approval_status === "pending" ? '<button class="delete" type="button">Delete request</button>' : ""}
        </div>`;

      row.querySelector(".save").onclick = () => saveEntry(e, row);
      const deleteButton = row.querySelector(".delete");
      if (deleteButton) deleteButton.onclick = () => deleteEntry(e, deleteButton);

      row.addEventListener("dragstart", () => row.classList.add("dragging"));
      row.addEventListener("dragend", saveEntryOrder);
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        const dragging = $(".backlog-card.dragging");
        if (dragging && dragging !== row) {
          const bounds = row.getBoundingClientRect();
          list.insertBefore(dragging, event.clientY < bounds.top + bounds.height / 2 ? row : row.nextSibling);
        }
      });

      list.append(row);
    });
  }

  async function saveEntry(e, row) {
    const tag = row.querySelector(".tag").value;
    const section = byTag(tag);
    const approval = row.querySelector(".approval").value;
    const publicStatus = row.querySelector(".pub").value;
    const result = await db.from("commission_queue").update({
      sort_tag: tag,
      section_id: section?.id || null,
      approval_status: approval,
      is_live: approval === "approved",
      public_status: publicStatus
    }).eq("id", e.id);

    if (result.error) return toast(result.error.message);
    toast(approval === "approved" ? "Approved — bulletin updated ✦" : "Queue entry saved.");
    loadQueue();
  }

  async function deleteEntry(e, button) {
    if (!admin()) return toast("Bulletin access is required to delete requests.");
    if (!confirm("Permanently delete this request?\n\nThis cannot be undone.")) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Deleting…";

    const result = e.manual_entry || !e.commission_id
      ? await db.from("commission_queue").delete().eq("id", e.id)
      : await db.from("commission_requests").delete().eq("id", e.commission_id);

    button.disabled = false;
    button.textContent = originalText;

    if (result.error) return toast(result.error.message);
    toast("Request deleted ✦");
    loadQueue();
  }

  async function saveEntryOrder() {
    const rows = [...$("#backlog-list").children];
    for (let i = 0; i < rows.length; i++) {
      await db.from("commission_queue").update({ position: i + 1 }).eq("id", rows[i].dataset.id);
    }
    loadQueue();
  }

  async function manualAdd(event) {
    event.preventDefault();
    const form = new FormData($("#manual-form"));
    const tag = form.get("sortTag");
    const section = byTag(tag);
    const result = await db.from("commission_queue").insert({
      manual_entry: true,
      public_name: form.get("publicName"),
      public_type: form.get("publicType"),
      public_status: form.get("publicStatus"),
      sort_tag: tag,
      section_id: section?.id || null,
      approval_status: "pending",
      is_live: false,
      position: 0
    });

    if (result.error) return $("#manual-status").textContent = result.error.message;
    $("#manual-dialog").close();
    $("#manual-form").reset();
    toast("Manual entry added to backlog ✦");
    loadQueue();
  }

  function showAdmin(open) {
    $("#admin-panel").hidden = !open;
    $("#admin-login").hidden = admin();
    $("#admin-dashboard").hidden = !admin();
    if (open) $("#admin-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function login(event) {
    event.preventDefault();
    const result = await db.auth.signInWithPassword({
      email: $("#login-email").value.trim(),
      password: $("#login-password").value
    });
    if (result.error) return $("#login-status").textContent = result.error.message;
    if (result.data.user.id !== Q.admin) {
      await db.auth.signOut();
      return $("#login-status").textContent = "That account does not have bulletin access.";
    }
    showAdmin(true);
    loadQueue();
  }

  $("#admin-toggle").onclick = () => {
    showAdmin(true);
    if (!admin()) $("#login-email").focus();
  };
  $("#login-form").onsubmit = login;
  $("#sign-out").onclick = async () => {
    await db.auth.signOut();
    showAdmin(false);
    toast("Bulletin locked.");
  };
  $("#add-section").onclick = addSection;
  $("#manual-add").onclick = () => {
    $("#manual-tag").innerHTML = tagOpts("new request");
    $("#manual-dialog").showModal();
  };
  $("#manual-close").onclick = () => $("#manual-dialog").close();
  $("#manual-form").onsubmit = manualAdd;

  window.renderAdmin = renderAdmin;
  window.showAdmin = showAdmin;
})();