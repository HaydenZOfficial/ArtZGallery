(() => {
  "use strict";

  const CONFIG = Object.freeze({
    supabaseUrl: "https://tgcprvavaazeyzxwnjxa.supabase.co",
    supabaseKey: "sb_publishable_PC89E5N1Kr0JZ45ILlahHQ_J9ZRnX1A",
    functionName: "submit-commission",
    localCooldownMs: 60_000
  });

  if (!window.supabase?.createClient) {
    document.body.innerHTML = "<main class='fatal-error'><h1>Commission form unavailable</h1><p>The Supabase library did not load. Refresh and try again.</p></main>";
    return;
  }

  const db = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const $ = selector => document.querySelector(selector);

  const elements = {
    year: $("#year"),
    menuButton: $(".menu-button"),
    nav: $("#site-nav"),
    form: $("#commission-request-form"),
    formStatus: $("#commission-form-status"),
    submitButton: $("#submit-commission"),
    startedAt: $("#form-started-at"),
    paymentClaim: $("#payment-claim"),
    paymentDetails: $("#payment-details"),
    success: $("#commission-success"),
    reference: $("#commission-reference"),
    newRequest: $("#new-commission-request")
  };

  function resetStartedAt() {
    elements.startedAt.value = String(Date.now());
  }

  function setStatus(message = "", type = "") {
    elements.formStatus.textContent = message;
    elements.formStatus.className = `form-status${type ? ` is-${type}` : ""}`;
  }

  function setBusy(busy) {
    elements.submitButton.disabled = busy;
    elements.submitButton.textContent = busy ? "Sending securely…" : "Send private request";
  }

  function updatePaymentFields() {
    const paidClaimed = elements.paymentClaim.value === "already_paid";
    elements.paymentDetails.hidden = !paidClaimed;

    const method = elements.form.elements.paymentMethod;
    const reference = elements.form.elements.paymentReference;
    method.required = paidClaimed;
    reference.required = paidClaimed;
  }

  function collectPayload() {
    const data = new FormData(elements.form);

    return {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      contactMethod: String(data.get("contactMethod") || "").trim(),
      contactHandle: String(data.get("contactHandle") || "").trim(),
      commissionType: String(data.get("commissionType") || "").trim(),
      usageType: String(data.get("usageType") || "").trim(),
      budget: String(data.get("budget") || "").trim(),
      deadline: String(data.get("deadline") || "").trim(),
      message: String(data.get("message") || "").trim(),
      referenceLinks: String(data.get("referenceLinks") || "").trim(),
      paymentClaim: String(data.get("paymentClaim") || "").trim(),
      paymentMethod: String(data.get("paymentMethod") || "").trim(),
      paymentReference: String(data.get("paymentReference") || "").trim(),
      website: String(data.get("website") || "").trim(),
      startedAt: Number(data.get("startedAt") || 0)
    };
  }

  async function submitRequest(event) {
    event.preventDefault();
    setStatus();

    if (!elements.form.reportValidity()) return;

    const lastSent = Number(localStorage.getItem("hadenzCommissionLastSent") || 0);
    const waitMs = CONFIG.localCooldownMs - (Date.now() - lastSent);

    if (waitMs > 0) {
      setStatus(`Please wait ${Math.ceil(waitMs / 1000)} seconds before sending another request.`, "error");
      return;
    }

    setBusy(true);

    const { data, error } = await db.functions.invoke(CONFIG.functionName, {
      body: collectPayload()
    });

    setBusy(false);

    if (error) {
      let message = error.message || "The request could not be delivered.";

      try {
        const context = error.context;
        if (context instanceof Response) {
          const body = await context.clone().json();
          if (body?.error) message = body.error;
        }
      } catch {
        // Use the original message.
      }

      setStatus(message, "error");
      return;
    }

    if (!data?.referenceCode) {
      setStatus("The server did not return a reference number. Please try again.", "error");
      return;
    }

    localStorage.setItem("hadenzCommissionLastSent", String(Date.now()));
    elements.reference.textContent = data.referenceCode;
    elements.form.hidden = true;
    elements.success.hidden = false;
    elements.success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function startNewRequest() {
    elements.form.reset();
    updatePaymentFields();
    resetStartedAt();
    setStatus();
    elements.success.hidden = true;
    elements.form.hidden = false;
    elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
    elements.form.elements.name.focus();
  }

  elements.year.textContent = String(new Date().getFullYear());
  resetStartedAt();
  updatePaymentFields();

  elements.paymentClaim.addEventListener("change", updatePaymentFields);
  elements.form.addEventListener("submit", submitRequest);
  elements.newRequest.addEventListener("click", startNewRequest);

  elements.menuButton.addEventListener("click", () => {
    const open = elements.menuButton.getAttribute("aria-expanded") === "true";
    elements.menuButton.setAttribute("aria-expanded", String(!open));
    elements.nav.classList.toggle("is-open", !open);
  });

  elements.nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      elements.menuButton.setAttribute("aria-expanded", "false");
      elements.nav.classList.remove("is-open");
    }
  });
})();
