(() => {
  "use strict";

  const CONFIG = Object.freeze({
    supabaseUrl: "https://tgcprvavaazeyzxwnjxa.supabase.co",
    supabaseKey: "sb_publishable_PC89E5N1Kr0JZ45ILlahHQ_J9ZRnX1A",
    adminUserId: "64388341-ee37-430f-a590-f99b96939fca",
    bucket: "artworks",
    maxMusicBytes: 12 * 1024 * 1024,
    allowedTypes: new Set(["audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/ogg", "audio/webm"])
  });

  const FRAME = document.getElementById("gallery-frame");
  if (!FRAME) return;
  const audioState = { records: [], currentPath: null, currentUrl: null, uploadPromise: null };

  function frameDocument() { return FRAME.contentDocument; }
  function frameWindow() { return FRAME.contentWindow; }
  function makeClient() {
    const supabase = frameWindow()?.supabase || window.supabase;
    if (!supabase?.createClient) return null;
    return supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  }
  async function loadRecords(db) {
    const { data, error } = await db.from("artworks").select("id,title,image_path,music_path,owner_id,created_at").order("created_at", { ascending: false });
    if (error) { console.warn("Artwork music metadata could not load:", error.message); return; }
    audioState.records = data || [];
  }
  function publicUrl(db, path) { return path ? db.storage.from(CONFIG.bucket).getPublicUrl(path).data.publicUrl : ""; }
  function getCurrentRecord(db, doc) {
    const imageUrl = doc.querySelector("#lightbox-image")?.src || "";
    const title = doc.querySelector("#lightbox-title")?.textContent?.trim() || "";
    return audioState.records.find((record) => (imageUrl && publicUrl(db, record.image_path) === imageUrl) || record.title === title) || null;
  }
  function safeFileName(name) {
    const extension = name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "";
    const base = name.replace(/\.[^/.]+$/, "").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "music";
    return `${base}${extension}`;
  }
  function ensureAudioUI(doc) {
    const caption = doc.querySelector("#lightbox-description")?.parentElement;
    if (!caption || doc.getElementById("lightbox-music")) return;
    const section = doc.createElement("section");
    section.id = "lightbox-music";
    section.className = "lightbox-music";
    section.hidden = true;
    section.innerHTML = `<div class="lightbox-music-label"><span>ORIGINAL AUDIO</span><i></i></div><audio controls preload="metadata"></audio>`;
    caption.append(section);
  }
  function ensureUploadUI(doc) {
    const form = doc.querySelector("#upload-form");
    const description = doc.querySelector("#artwork-description")?.closest("label");
    if (!form || !description || doc.getElementById("artwork-music-file")) return;
    const label = doc.createElement("label");
    label.id = "artwork-music-field";
    label.innerHTML = `Music <span class="optional">optional</span><input id="artwork-music-file" name="music" type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"><span class="music-help">MP3, M4A, WAV, OGG, or WebM · maximum 12 MB</span>`;
    description.insertAdjacentElement("afterend", label);
    const status = doc.createElement("p");
    status.id = "music-upload-status";
    status.className = "form-status";
    status.setAttribute("role", "status");
    label.insertAdjacentElement("afterend", status);
  }
  function ensureEditUI(doc) {
    const form = doc.querySelector("#edit-form");
    const description = doc.querySelector("#edit-artwork-description")?.closest("label");
    if (!form || !description || doc.getElementById("edit-artwork-music-file")) return;
    const label = doc.createElement("label");
    label.id = "edit-artwork-music-field";
    label.innerHTML = `Music <span class="optional">optional</span><input id="edit-artwork-music-file" type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"><span id="edit-artwork-music-current" class="music-help">No music attached.</span><span class="music-help">Choose a new file to replace the current track.</span>`;
    description.insertAdjacentElement("afterend", label);
    const removeLabel = doc.createElement("label");
    removeLabel.className = "edit-music-remove-label";
    removeLabel.innerHTML = `<input id="edit-artwork-music-remove" type="checkbox"> Remove current music`;
    label.insertAdjacentElement("afterend", removeLabel);
    const status = doc.createElement("p");
    status.id = "edit-music-status";
    status.className = "form-status";
    status.setAttribute("role", "status");
    removeLabel.insertAdjacentElement("afterend", status);
  }
  function setStatus(doc, id, message = "", type = "") {
    const element = doc.getElementById(id);
    if (!element) return;
    element.textContent = message;
    element.className = `form-status${type ? ` is-${type}` : ""}`;
  }
  function setCurrentMusic(doc, path) {
    const element = doc.getElementById("edit-artwork-music-current");
    if (element) element.textContent = path ? "A music track is currently attached. Choose a file to replace it." : "No music attached.";
  }
  async function uploadMusic(db, file) {
    if (!CONFIG.allowedTypes.has(file.type)) throw new Error("Choose a supported audio file.");
    if (file.size > CONFIG.maxMusicBytes) throw new Error("Music files must be 12 MB or smaller.");
    const path = `${CONFIG.adminUserId}/music/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await db.storage.from(CONFIG.bucket).upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    if (error) throw error;
    return path;
  }
  async function waitForArtwork(db, title, startedAt) {
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      const { data } = await db.from("artworks").select("id,title,owner_id,created_at,image_path,music_path").eq("owner_id", CONFIG.adminUserId).eq("title", title).order("created_at", { ascending: false }).limit(5);
      const record = (data || []).find((item) => new Date(item.created_at).getTime() >= startedAt - 5000);
      if (record) return record;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    return null;
  }
  async function handleMusicSubmit(event, db) {
    const doc = frameDocument();
    const file = doc.getElementById("artwork-music-file")?.files?.[0];
    if (!file) return;
    const title = doc.getElementById("artwork-title")?.value.trim();
    const { data: { session } } = await db.auth.getSession();
    if (session?.user?.id !== CONFIG.adminUserId) { setStatus(doc, "music-upload-status", "Your session expired. Sign in again.", "error"); return; }
    const startedAt = Date.now();
    setStatus(doc, "music-upload-status", "Uploading music…");
    audioState.uploadPromise = uploadMusic(db, file).then(async (musicPath) => {
      const record = await waitForArtwork(db, title, startedAt);
      if (!record) { await db.storage.from(CONFIG.bucket).remove([musicPath]); throw new Error("Artwork was not published, so the music upload was removed."); }
      const { error } = await db.from("artworks").update({ music_path: musicPath }).eq("id", record.id);
      if (error) { await db.storage.from(CONFIG.bucket).remove([musicPath]); throw error; }
      audioState.records = audioState.records.filter((item) => item.id !== record.id);
      audioState.records.unshift({ ...record, music_path: musicPath });
      setStatus(doc, "music-upload-status", "Music attached successfully.", "success");
      return musicPath;
    }).catch((error) => { setStatus(doc, "music-upload-status", error.message || "Music upload failed.", "error"); return null; });
    await audioState.uploadPromise;
    audioState.uploadPromise = null;
  }
  async function handleEditWithMusic(event, db) {
    const doc = frameDocument();
    const file = doc.getElementById("edit-artwork-music-file")?.files?.[0];
    const remove = doc.getElementById("edit-artwork-music-remove")?.checked;
    if (!file && !remove) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const { data: { session } } = await db.auth.getSession();
    if (session?.user?.id !== CONFIG.adminUserId) { setStatus(doc, "edit-music-status", "Your session expired. Sign in again.", "error"); return; }
    const id = doc.getElementById("edit-id")?.value;
    const title = doc.getElementById("edit-artwork-title")?.value.trim();
    const category = doc.getElementById("edit-artwork-category")?.value;
    const description = doc.getElementById("edit-artwork-description")?.value.trim();
    const save = doc.getElementById("save-edit");
    const original = save?.textContent || "Save changes";
    if (save) { save.disabled = true; save.textContent = "Saving…"; }
    let newPath = null;
    try {
      const { data: current, error: fetchError } = await db.from("artworks").select("music_path").eq("id", id).single();
      if (fetchError) throw fetchError;
      if (file) newPath = await uploadMusic(db, file);
      const music_path = newPath || (remove ? null : current.music_path);
      const { error } = await db.from("artworks").update({ title, category, description, music_path }).eq("id", id);
      if (error) throw error;
      if (current.music_path && current.music_path !== music_path) await db.storage.from(CONFIG.bucket).remove([current.music_path]);
      await loadRecords(db);
      setStatus(doc, "edit-music-status", newPath ? "Music replaced successfully." : "Music removed successfully.", "success");
      doc.getElementById("edit-dialog")?.close();
      setTimeout(() => frameWindow().location.reload(), 50);
    } catch (error) {
      if (newPath) await db.storage.from(CONFIG.bucket).remove([newPath]);
      setStatus(doc, "edit-music-status", error.message || "Could not save music changes.", "error");
      if (save) { save.disabled = false; save.textContent = original; }
    }
  }
  async function refreshEditMusic(db) {
    const doc = frameDocument();
    const id = doc.getElementById("edit-id")?.value;
    if (!id) return;
    const { data } = await db.from("artworks").select("music_path").eq("id", id).maybeSingle();
    setCurrentMusic(doc, data?.music_path || null);
  }
  function refreshLightbox(db) {
    const doc = frameDocument();
    const music = doc.getElementById("lightbox-music");
    const audio = music?.querySelector("audio");
    if (!music || !audio) return;
    const record = getCurrentRecord(db, doc);
    const nextUrl = record?.music_path ? publicUrl(db, record.music_path) : "";
    if (nextUrl === audioState.currentUrl) { music.hidden = !nextUrl; return; }
    audio.pause(); audio.removeAttribute("src"); audio.load();
    audioState.currentUrl = nextUrl || null;
    audioState.currentPath = record?.music_path || null;
    if (!nextUrl) { music.hidden = true; return; }
    audio.src = nextUrl; audio.setAttribute("aria-label", `Audio for ${record.title}`); music.hidden = false; audio.load();
  }
  function enhanceFrame(db) {
    const doc = frameDocument();
    if (!doc) return;
    ensureAudioUI(doc); ensureUploadUI(doc); ensureEditUI(doc);
    if (!doc.getElementById("music-enhancer-styles")) {
      const style = doc.createElement("style"); style.id = "music-enhancer-styles";
      style.textContent = `.lightbox-music{margin-top:28px;padding:16px 0 0;border-top:1px solid rgba(255,255,255,.12)}.lightbox-music-label{display:flex;align-items:center;gap:8px;margin-bottom:10px;color:var(--gold,#ffc400);font:600 .58rem "DM Mono",monospace;letter-spacing:.14em}.lightbox-music-label i{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 10px currentColor}.lightbox-music audio{width:100%;accent-color:var(--gold,#ffc400)}#artwork-music-field,#edit-artwork-music-field{margin-top:2px}#artwork-music-file,#edit-artwork-music-file{padding:10px}.music-help{display:block;margin-top:7px;color:var(--muted);font-size:.68rem;line-height:1.5}.edit-music-remove-label{display:flex!important;flex-direction:row!important;align-items:center;gap:8px;margin-top:10px!important;font-size:.75rem}.edit-music-remove-label input{width:auto!important}`;
      doc.head.append(style);
    }
    const uploadForm = doc.getElementById("upload-form");
    if (uploadForm && !uploadForm.dataset.musicEnhanced) { uploadForm.dataset.musicEnhanced = "true"; uploadForm.addEventListener("submit", (event) => { handleMusicSubmit(event, db); }, true); }
    const editForm = doc.getElementById("edit-form");
    if (editForm && !editForm.dataset.musicEditEnhanced) { editForm.dataset.musicEditEnhanced = "true"; editForm.addEventListener("submit", (event) => { handleEditWithMusic(event, db); }, true); }
    const editDialog = doc.getElementById("edit-dialog");
    if (editDialog && !editDialog.dataset.musicEditObserved) {
      editDialog.dataset.musicEditObserved = "true";
      const observer = new MutationObserver(() => { if (editDialog.open) setTimeout(() => refreshEditMusic(db), 0); });
      observer.observe(editDialog, { attributes: true, attributeFilter: ["open"] });
    }
    const lightbox = doc.getElementById("lightbox");
    if (lightbox && !lightbox.dataset.musicEnhanced) {
      lightbox.dataset.musicEnhanced = "true";
      const observer = new MutationObserver(() => refreshLightbox(db));
      observer.observe(lightbox, { attributes: true, attributeFilter: ["open"] });
      lightbox.addEventListener("click", () => setTimeout(() => refreshLightbox(db), 0), true);
      lightbox.addEventListener("keydown", () => setTimeout(() => refreshLightbox(db), 0), true);
    }
    doc.addEventListener("click", (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, doc.baseURI);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === new URL(window.location.href).pathname && url.hash) return;
      if (url.pathname !== new URL(window.location.href).pathname || url.search) {
        event.preventDefault(); event.stopImmediatePropagation(); window.top.location.href = url.href;
      }
    }, true);
    loadRecords(db).then(() => refreshLightbox(db));
  }
  FRAME.addEventListener("load", () => { const db = makeClient(); if (db) setTimeout(() => enhanceFrame(db), 0); });
})();
