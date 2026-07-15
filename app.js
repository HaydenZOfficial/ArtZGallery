(() => {
  "use strict";

  const CONFIG = Object.freeze({
    supabaseUrl: "https://tgcprvavaazeyzxwnjxa.supabase.co",
    supabaseKey: "sb_publishable_PC89E5N1Kr0JZ45ILlahHQ_J9ZRnX1A",
    adminUserId: "64388341-ee37-430f-a590-f99b96939fca",
    bucket: "artworks",
    table: "artworks",
    maxUploadBytes: 6 * 1024 * 1024
  });

  if (!window.supabase?.createClient) {
    document.body.innerHTML = "<main class='fatal-error'><h1>Gallery unavailable</h1><p>The Supabase library did not load. Check your internet connection and refresh.</p></main>";
    return;
  }

  const db = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const elements = {
    grid: $("#gallery-grid"),
    loading: $("#gallery-loading"),
    empty: $("#empty-state"),
    error: $("#gallery-error"),
    errorText: $("#gallery-error-text"),
    retry: $("#retry-gallery"),
    filters: $("#filters"),
    visibleCount: $("#visible-count"),
    year: $("#year"),
    menuButton: $(".menu-button"),
    nav: $("#site-nav"),
    openAdmin: $("#open-admin"),
    heroUpload: $("#hero-upload"),
    adminDialog: $("#admin-dialog"),
    closeAdmin: $("#close-admin"),
    loginView: $("#login-view"),
    dashboardView: $("#dashboard-view"),
    loginForm: $("#login-form"),
    loginEmail: $("#login-email"),
    loginPassword: $("#login-password"),
    loginButton: $("#login-button"),
    loginStatus: $("#login-status"),
    signedInEmail: $("#signed-in-email"),
    signOut: $("#sign-out"),
    uploadForm: $("#upload-form"),
    uploadButton: $("#upload-button"),
    uploadStatus: $("#upload-status"),
    fileInput: $("#artwork-file"),
    fileDropZone: $("#file-drop-zone"),
    uploadPreview: $("#upload-preview"),
    titleInput: $("#artwork-title"),
    categoryInput: $("#artwork-category"),
    descriptionInput: $("#artwork-description"),
    manageList: $("#manage-list"),
    manageCount: $("#manage-count"),
    lightbox: $("#lightbox"),
    lightboxImage: $("#lightbox-image"),
    lightboxTitle: $("#lightbox-title"),
    lightboxCategory: $("#lightbox-category"),
    lightboxDescription: $("#lightbox-description"),
    lightboxClose: $(".lightbox-close"),
    lightboxPrev: $(".lightbox-prev"),
    lightboxNext: $(".lightbox-next"),
    editDialog: $("#edit-dialog"),
    closeEdit: $("#close-edit"),
    editForm: $("#edit-form"),
    editId: $("#edit-id"),
    editTitle: $("#edit-artwork-title"),
    editCategory: $("#edit-artwork-category"),
    editDescription: $("#edit-artwork-description"),
    saveEdit: $("#save-edit"),
    editStatus: $("#edit-status"),
    toast: $("#toast")
  };

  let artworks = [];
  let filteredArtworks = [];
  let activeFilter = "All";
  let lightboxIndex = 0;
  let previewObjectUrl = null;
  let toastTimer = null;

  function setStatus(element, message = "", type = "") {
    element.textContent = message;
    element.className = `form-status${type ? ` is-${type}` : ""}`;
  }

  function showToast(message, type = "success") {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.className = `toast is-${type}`;
    elements.toast.hidden = false;
    toastTimer = setTimeout(() => {
      elements.toast.hidden = true;
    }, 4200);
  }

  function setBusy(button, busy, busyText, normalText) {
    button.disabled = busy;
    button.textContent = busy ? busyText : normalText;
  }

  function getPublicImageUrl(path) {
    return db.storage.from(CONFIG.bucket).getPublicUrl(path).data.publicUrl;
  }

  function titleCase(value) {
    return String(value || "Other").replace(/\b\w/g, char => char.toUpperCase());
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(dateString));
  }

  async function loadGallery() {
    elements.loading.hidden = false;
    elements.grid.hidden = true;
    elements.empty.hidden = true;
    elements.error.hidden = true;

    const { data, error } = await db
      .from(CONFIG.table)
      .select("id,title,description,category,image_path,owner_id,created_at")
      .order("created_at", { ascending: false });

    elements.loading.hidden = true;

    if (error) {
      elements.errorText.textContent = error.message;
      elements.error.hidden = false;
      elements.visibleCount.textContent = "0";
      return;
    }

    artworks = (data || []).map(item => ({
      ...item,
      imageUrl: getPublicImageUrl(item.image_path)
    }));

    buildFilters();
    applyFilter(activeFilter);
    renderManageList();
  }

  function buildFilters() {
    const categories = ["All", ...new Set(artworks.map(item => titleCase(item.category)))];
    if (!categories.includes(activeFilter)) activeFilter = "All";
    elements.filters.replaceChildren();

    categories.forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-button${category === activeFilter ? " is-active" : ""}`;
      button.dataset.filter = category;
      button.setAttribute("aria-pressed", String(category === activeFilter));
      button.textContent = category;
      button.addEventListener("click", () => applyFilter(category));
      elements.filters.append(button);
    });

    elements.filters.hidden = artworks.length === 0;
  }

  function applyFilter(category) {
    activeFilter = category;
    filteredArtworks = category === "All"
      ? [...artworks]
      : artworks.filter(item => titleCase(item.category) === category);

    $$(".filter-button", elements.filters).forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    renderGallery();
  }

  function makeArtworkCard(artwork, index) {
    const article = document.createElement("article");
    article.className = "art-card";

    const button = document.createElement("button");
    button.className = "art-card-button";
    button.type = "button";
    button.setAttribute("aria-label", `View ${artwork.title}`);
    button.addEventListener("click", () => openLightbox(index));

    const imageWrap = document.createElement("span");
    imageWrap.className = "art-card-image-wrap";

    const image = document.createElement("img");
    image.src = artwork.imageUrl;
    image.alt = artwork.title;
    image.loading = "lazy";
    image.decoding = "async";

    const meta = document.createElement("span");
    meta.className = "art-card-meta";

    const heading = document.createElement("span");
    heading.className = "art-card-title";
    heading.textContent = artwork.title;

    const category = document.createElement("span");
    category.className = "art-card-category";
    category.textContent = titleCase(artwork.category);

    imageWrap.append(image);
    meta.append(heading, category);
    button.append(imageWrap, meta);
    article.append(button);
    return article;
  }

  function renderGallery() {
    elements.grid.replaceChildren(...filteredArtworks.map(makeArtworkCard));
    elements.visibleCount.textContent = String(filteredArtworks.length);
    elements.grid.hidden = filteredArtworks.length === 0;
    elements.empty.hidden = artworks.length !== 0;
  }

  function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    elements.lightbox.showModal();
    elements.lightboxClose.focus();
  }

  function updateLightbox() {
    const artwork = filteredArtworks[lightboxIndex];
    if (!artwork) return;
    elements.lightboxImage.src = artwork.imageUrl;
    elements.lightboxImage.alt = artwork.title;
    elements.lightboxTitle.textContent = artwork.title;
    elements.lightboxCategory.textContent = `${titleCase(artwork.category)} · ${formatDate(artwork.created_at)}`;
    elements.lightboxDescription.textContent = artwork.description || "";
    const multiple = filteredArtworks.length > 1;
    elements.lightboxPrev.hidden = !multiple;
    elements.lightboxNext.hidden = !multiple;
  }

  function moveLightbox(direction) {
    if (!filteredArtworks.length) return;
    lightboxIndex = (lightboxIndex + direction + filteredArtworks.length) % filteredArtworks.length;
    updateLightbox();
  }

  async function getCurrentSession() {
    const { data } = await db.auth.getSession();
    return data.session;
  }

  async function updateAuthView(session) {
    const user = session?.user;
    const isAdmin = user?.id === CONFIG.adminUserId;

    if (user && !isAdmin) {
      await db.auth.signOut();
      elements.loginView.hidden = false;
      elements.dashboardView.hidden = true;
      setStatus(elements.loginStatus, "This account is not authorized to manage the gallery.", "error");
      return;
    }

    elements.loginView.hidden = Boolean(isAdmin);
    elements.dashboardView.hidden = !isAdmin;
    elements.openAdmin.textContent = isAdmin ? "Artist dashboard" : "Artist login";
    elements.heroUpload.textContent = isAdmin ? "Upload artwork" : "Artist login";

    if (isAdmin) {
      elements.signedInEmail.textContent = user.email || "Authorized artist";
      renderManageList();
    }
  }

  async function openAdminDialog() {
    setStatus(elements.loginStatus);
    const session = await getCurrentSession();
    await updateAuthView(session);
    elements.adminDialog.showModal();
    const target = session?.user?.id === CONFIG.adminUserId ? elements.fileInput : elements.loginEmail;
    setTimeout(() => target.focus(), 0);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setStatus(elements.loginStatus);
    setBusy(elements.loginButton, true, "Signing in…", "Sign in");

    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    const { data, error } = await db.auth.signInWithPassword({ email, password });

    setBusy(elements.loginButton, false, "Signing in…", "Sign in");

    if (error) {
      setStatus(elements.loginStatus, error.message, "error");
      return;
    }

    if (data.user?.id !== CONFIG.adminUserId) {
      await db.auth.signOut();
      setStatus(elements.loginStatus, "This account is not authorized to manage the gallery.", "error");
      return;
    }

    elements.loginForm.reset();
    await updateAuthView(data.session);
    showToast("Signed in. You can now upload artwork.");
  }

  function resetPreview() {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    elements.uploadPreview.src = "";
    elements.uploadPreview.hidden = true;
    elements.fileDropZone.classList.remove("has-preview");
  }

  function previewSelectedFile() {
    resetPreview();
    const file = elements.fileInput.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    previewObjectUrl = URL.createObjectURL(file);
    elements.uploadPreview.src = previewObjectUrl;
    elements.uploadPreview.hidden = false;
    elements.fileDropZone.classList.add("has-preview");
  }

  function safeFileName(name) {
    const extension = name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "";
    const base = name.replace(/\.[^/.]+$/, "")
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "artwork";
    return `${base}${extension}`;
  }

  async function handleUpload(event) {
    event.preventDefault();
    setStatus(elements.uploadStatus);

    const session = await getCurrentSession();
    if (session?.user?.id !== CONFIG.adminUserId) {
      setStatus(elements.uploadStatus, "Your session expired. Sign in again.", "error");
      await updateAuthView(null);
      return;
    }

    const file = elements.fileInput.files?.[0];
    const title = elements.titleInput.value.trim();
    const category = elements.categoryInput.value;
    const description = elements.descriptionInput.value.trim();

    if (!file || !title) {
      setStatus(elements.uploadStatus, "Choose an image and enter a title.", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus(elements.uploadStatus, "The selected file must be an image.", "error");
      return;
    }

    if (file.size > CONFIG.maxUploadBytes) {
      setStatus(elements.uploadStatus, "This image is larger than 6 MB. Export a smaller copy and try again.", "error");
      return;
    }

    setBusy(elements.uploadButton, true, "Uploading…", "Publish artwork");
    const path = `${CONFIG.adminUserId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;

    const { error: uploadError } = await db.storage
      .from(CONFIG.bucket)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      setBusy(elements.uploadButton, false, "Uploading…", "Publish artwork");
      setStatus(elements.uploadStatus, uploadError.message, "error");
      return;
    }

    const { error: insertError } = await db
      .from(CONFIG.table)
      .insert({
        title,
        category,
        description,
        image_path: path,
        owner_id: session.user.id
      });

    if (insertError) {
      await db.storage.from(CONFIG.bucket).remove([path]);
      setBusy(elements.uploadButton, false, "Uploading…", "Publish artwork");
      setStatus(elements.uploadStatus, insertError.message, "error");
      return;
    }

    elements.uploadForm.reset();
    resetPreview();
    setBusy(elements.uploadButton, false, "Uploading…", "Publish artwork");
    setStatus(elements.uploadStatus, "Artwork published successfully.", "success");
    showToast(`“${title}” is now live.`);
    activeFilter = "All";
    await loadGallery();
  }

  function makeManageItem(artwork) {
    const item = document.createElement("article");
    item.className = "manage-item";

    const image = document.createElement("img");
    image.src = artwork.imageUrl;
    image.alt = "";
    image.loading = "lazy";

    const info = document.createElement("div");
    info.className = "manage-info";

    const title = document.createElement("strong");
    title.textContent = artwork.title;

    const detail = document.createElement("span");
    detail.textContent = `${titleCase(artwork.category)} · ${formatDate(artwork.created_at)}`;

    const actions = document.createElement("div");
    actions.className = "manage-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "small-button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => openEditDialog(artwork));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "small-button danger-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteArtwork(artwork, deleteButton));

    info.append(title, detail);
    actions.append(editButton, deleteButton);
    item.append(image, info, actions);
    return item;
  }

  function renderManageList() {
    elements.manageCount.textContent = String(artworks.length);
    elements.manageList.replaceChildren();

    if (!artworks.length) {
      const message = document.createElement("p");
      message.className = "manage-empty";
      message.textContent = "Nothing published yet. Upload your first piece on the left.";
      elements.manageList.append(message);
      return;
    }

    elements.manageList.append(...artworks.map(makeManageItem));
  }

  async function deleteArtwork(artwork, button) {
    const confirmed = window.confirm(`Delete “${artwork.title}” from the gallery? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(button, true, "Deleting…", "Delete");

    const { error: dbError } = await db
      .from(CONFIG.table)
      .delete()
      .eq("id", artwork.id);

    if (dbError) {
      setBusy(button, false, "Deleting…", "Delete");
      showToast(dbError.message, "error");
      return;
    }

    const { error: storageError } = await db.storage.from(CONFIG.bucket).remove([artwork.image_path]);
    if (storageError) {
      console.warn("Artwork record deleted, but the stored file could not be removed:", storageError);
    }

    showToast(`“${artwork.title}” was deleted.`);
    await loadGallery();
  }

  function openEditDialog(artwork) {
    elements.editId.value = artwork.id;
    elements.editTitle.value = artwork.title;
    elements.editCategory.value = titleCase(artwork.category);
    elements.editDescription.value = artwork.description || "";
    setStatus(elements.editStatus);
    elements.editDialog.showModal();
    elements.editTitle.focus();
  }

  async function handleEdit(event) {
    event.preventDefault();
    setStatus(elements.editStatus);
    setBusy(elements.saveEdit, true, "Saving…", "Save changes");

    const id = elements.editId.value;
    const title = elements.editTitle.value.trim();
    const category = elements.editCategory.value;
    const description = elements.editDescription.value.trim();

    const { error } = await db
      .from(CONFIG.table)
      .update({ title, category, description })
      .eq("id", id);

    setBusy(elements.saveEdit, false, "Saving…", "Save changes");

    if (error) {
      setStatus(elements.editStatus, error.message, "error");
      return;
    }

    elements.editDialog.close();
    showToast("Artwork details updated.");
    await loadGallery();
  }

  function closeDialogOnBackdrop(dialog, event) {
    if (event.target === dialog) dialog.close();
  }

  elements.year.textContent = String(new Date().getFullYear());

  elements.menuButton.addEventListener("click", () => {
    const open = elements.menuButton.getAttribute("aria-expanded") === "true";
    elements.menuButton.setAttribute("aria-expanded", String(!open));
    elements.nav.classList.toggle("is-open", !open);
  });

  elements.nav.addEventListener("click", event => {
    if (event.target.matches("a")) {
      elements.menuButton.setAttribute("aria-expanded", "false");
      elements.nav.classList.remove("is-open");
    }
  });

  elements.openAdmin.addEventListener("click", openAdminDialog);
  elements.heroUpload.addEventListener("click", openAdminDialog);
  elements.closeAdmin.addEventListener("click", () => elements.adminDialog.close());
  elements.adminDialog.addEventListener("click", event => closeDialogOnBackdrop(elements.adminDialog, event));
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.uploadForm.addEventListener("submit", handleUpload);
  elements.fileInput.addEventListener("change", previewSelectedFile);

  ["dragenter", "dragover"].forEach(type => {
    elements.fileDropZone.addEventListener(type, event => {
      event.preventDefault();
      elements.fileDropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach(type => {
    elements.fileDropZone.addEventListener(type, event => {
      event.preventDefault();
      elements.fileDropZone.classList.remove("is-dragging");
    });
  });

  elements.fileDropZone.addEventListener("drop", event => {
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    elements.fileInput.files = transfer.files;
    previewSelectedFile();
  });

  elements.signOut.addEventListener("click", async () => {
    await db.auth.signOut();
    await updateAuthView(null);
    showToast("Signed out.");
  });

  elements.lightboxClose.addEventListener("click", () => elements.lightbox.close());
  elements.lightboxPrev.addEventListener("click", () => moveLightbox(-1));
  elements.lightboxNext.addEventListener("click", () => moveLightbox(1));
  elements.lightbox.addEventListener("click", event => closeDialogOnBackdrop(elements.lightbox, event));
  elements.lightbox.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  elements.closeEdit.addEventListener("click", () => elements.editDialog.close());
  elements.editDialog.addEventListener("click", event => closeDialogOnBackdrop(elements.editDialog, event));
  elements.editForm.addEventListener("submit", handleEdit);
  elements.retry.addEventListener("click", loadGallery);

  db.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => updateAuthView(session), 0);
  });

  Promise.all([loadGallery(), getCurrentSession().then(updateAuthView)]).catch(error => {
    console.error(error);
    showToast("Something went wrong while starting the gallery.", "error");
  });
})();
