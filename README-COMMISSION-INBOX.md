# HadenZ Private Commission Inbox

This package uses the personalized `index.html` supplied by HadenZ and adds:

- a dedicated `commissions.html` request page
- a private commission inbox inside the existing Artist Dashboard
- server-side request insertion through a Supabase Edge Function
- artist-only Row Level Security for reading and updating requests
- request workflow statuses
- separate payment states:
  - Not requested
  - Awaiting payment
  - Payment claimed
  - Paid — verified
  - Refunded
  - No payment required
- quoted amount and private artist notes
- a private reference number for each requester
- spam protection:
  - hidden honeypot field
  - minimum form completion time
  - browser cooldown
  - maximum three accepted requests per IP hash per hour
  - duplicate request blocking
  - field and link-count validation
  - no raw IP address stored

## Important payment limitation

The form does **not** automatically confirm PayPal or Ko-fi payment.

A requester who says they already paid is marked:

```text
Payment claimed
```

Haden must check the actual PayPal or Ko-fi transaction, then change the inbox
status to:

```text
Paid — verified
```

True automatic payment verification would require a separate PayPal or Ko-fi
webhook integration.

---

# Step 1 — Run the database SQL

In the existing HadenZ Supabase project:

1. Open **SQL Editor**.
2. Click **New query**.
3. Open:

```text
supabase/commission-inbox-setup.sql
```

4. Paste the entire file.
5. Click **Run**.
6. Confirm it reports success.

The SQL already contains Haden's existing authorized user UUID.

---

# Step 2 — Deploy the public Edge Function

The public form cannot insert directly into the private database table.
The included Edge Function validates and rate-limits submissions before saving them.

## Easiest method: Supabase Dashboard

1. Open the HadenZ Supabase project.
2. Open **Edge Functions**.
3. Choose **Deploy a new function** or **Create function**.
4. Name it exactly:

```text
submit-commission
```

5. Paste the contents of:

```text
supabase/functions/submit-commission/index.ts
```

6. Because this is a public submission form, turn **JWT verification off** for
   this function.
7. Deploy the function.

## CLI method

From this website folder:

```bash
supabase login
supabase link --project-ref tgcprvavaazeyzxwnjxa
supabase functions deploy submit-commission --no-verify-jwt
```

The included `supabase/config.toml` also records `verify_jwt = false`.

---

# Step 3 — Upload the website to GitHub

1. Extract the ZIP.
2. Open the current `ArtZGallery` repository.
3. Click **Add file -> Upload files**.
4. Drag everything inside the extracted folder onto GitHub.
5. Confirm these files are replaced:
   - `index.html`
   - `app.js`
   - `styles.css`
6. Confirm these new files appear:
   - `commissions.html`
   - `commission-form.js`
   - `supabase/commission-inbox-setup.sql`
   - `supabase/functions/submit-commission/index.ts`
7. Commit the changes.
8. Wait for GitHub Pages to redeploy.
9. Open `https://hadenz.studio` and press **Ctrl + F5**.

The `CNAME` file is included so the custom domain remains `hadenz.studio`.

---

# Artist workflow

1. Open the website.
2. Click **Artist login**.
3. Sign in with the existing HadenZ Supabase account.
4. Open the **Commission inbox** tab.
5. Review the requester’s message and reference number.
6. Update:
   - request status
   - payment status
   - quoted amount
   - private artist notes
7. Click **Email requester** to respond through the email app.

Only the authorized HadenZ account can select or update rows because the table
has Row Level Security enabled.

---

# Public workflow

1. Visitor opens `commissions.html`.
2. Visitor sends the request.
3. The Edge Function performs spam checks.
4. The visitor receives a private reference number.
5. The request appears in the artist-only inbox.

No customer payment card or bank information should ever be entered into this form.
