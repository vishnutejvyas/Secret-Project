# Okay, Quick Question... 👀 (Avanthi's Hangout Website 👻)

A custom, cute, playful, and responsive web application personalized for **Avanthi 👻** to casually ask her if she wants to hang out, let her pick what sounds fun, choose her availability, leave special requests, and automatically record her answers into your private Google Sheet.

Designed with a Pinterest-inspired pastel palette (cream, pastel pink, lavender, butter yellow, soft peach), responsive touch ergonomics, playful floating doodle stars, mischievous escaping NO button physics, celebratory confetti, and zero cheesy romantic tropes.

---

## 🌟 Features & Highlights

- **Mischievous Escaping NO Button**:
  - *Desktop*: On hover or click attempt, the NO button playfully dashes to a random spot within the interaction arena while the YES button bounces and expands in size.
  - *Mobile*: On tap, NO dodges away while displaying funny messages (e.g., *"Not you chasing a button right now 😂"*, *"NO is fighting for its life 🏃"*).
  - *Accessible Decline Alternative*: A dignified, keyboard-accessible decline button is always available so nobody is ever forced or trapped.
- **Celebration Mode**:
  - Clicking YES triggers a multi-burst confetti celebration and joyful ghost mascot animation!
- **Activity Selection (Strict 5 Options)**:
  - 🌙 **Night Walk**: *"Cool breeze, random conversations, and no particular destination."*
  - 🌶️ **Pani Puri**: *"One plate? Two plates? Let's see where this goes. 😂"*
  - 🥞 **Dosa**: *"Good dosa, good conversations. Simple. 🤌"*
  - 🍜 **Maggie**: *"Maggie supremacy. No further explanation needed."*
  - 🚶 **Outing**: *"Let's go somewhere fun and figure things out along the way. 👀"*
- **Availability & Preferred Day Picker**:
  - Quick choices: *"This weekend"*, *"Next week"*, *"Whenever we're both free"*, or *"Let me choose a day"* with a mobile calendar picker.
  - Preferred time of day: Morning, Afternoon, Evening, or Whenever works.
- **Optional Special Requests & Review**:
  - Multi-line message with live 500-char limit for food demands or ideas.
  - Full review screen with back navigation before submitting.
- **Dynamic Personalized Summary**:
  - Tailored reaction to her chosen activity (e.g. *"PANI PURI?! AVANTHI IS A PERSON OF CULTURE. 🤌😂"*).
  - Thumbs-up mascot and casual *"Looks like we have something to plan!"* outro.
- **Private Google Sheets Backend**:
  - Saves submissions via Google Apps Script Web App.
  - Server-side whitelist validation, rate-limiting, and deduplication.
  - Never exposes secrets, and the sheet stays 100% private.

---

## 🚀 Quick Start & Local Preview

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Full-Stack Dev Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with the Express API and Vite frontend active.

### 3. Build for Production
```bash
npm run build
```

---

## 📊 Google Sheets Setup (How to Connect Your Sheet)

Follow the complete instructions in [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md):

1. Create a spreadsheet titled **`Avanthi Hangout Responses 👻`** on [Google Sheets](https://sheets.new).
2. Go to **Extensions** > **Apps Script**.
3. Paste the contents of [`google-apps-script.js`](./google-apps-script.js).
4. Click **Deploy** > **New deployment** > Type: **Web app** > Execute as: **Me** > Who has access: **Anyone**.
5. Authorize access when prompted and copy the resulting Web App URL.
6. Add the URL to your `.env` file:
   ```env
   GOOGLE_SHEET_WEBAPP_URL="https://script.google.com/macros/s/AKfycb.../exec"
   ```
7. Use the built-in **"⚙️ Integration Status / Tester"** drawer at the bottom of the page to test your connection.

---

## 📱 How to Check Responses From Your Phone

1. Install the official **Google Sheets** app from Google Play or Apple App Store.
2. Sign in with your Google account.
3. Open `Avanthi Hangout Responses 👻`.
4. Turn on notifications in Google Drive / Sheets to receive an alert when a new row is appended!

---

## 🌐 Deployment Architecture Options

### Option 1: Full-Stack on Google Cloud Run (Recommended for Google AI Studio)
- Both the Express server (`/api/*`) and React frontend are served together from a single container.
- Secrets like `GOOGLE_SHEET_WEBAPP_URL` are stored safely on the server side in Cloud Run environment variables and never leaked to the client.
- In Google AI Studio, click **Deploy** to automatically deploy to Cloud Run.

### Option 2: Static Frontend on GitHub Pages + Cloud Backend
- GitHub Pages only hosts static files (`index.html`, JavaScript, CSS). It cannot run `server.ts` or Node.js.
- The included Pages workflow builds the frontend, while the included `render.yaml` can deploy the Express API to Render.
- The frontend must use the API service's public URL; the API needs `ALLOWED_ORIGIN` set to the Pages origin and `GOOGLE_SHEET_WEBAPP_URL` set to the Apps Script `/exec` URL.

### GitHub Pages Deployment
1. Create a GitHub repository and push this project to its `main` branch. Do not upload `.env`; it contains local configuration and is ignored by Git.
2. In Render, create a new Blueprint from that repository and deploy `render.yaml`. Set `GOOGLE_SHEET_WEBAPP_URL` to your Apps Script `/exec` URL and `ALLOWED_ORIGIN` to `https://YOUR-GITHUB-USERNAME.github.io` when prompted. Copy the Render service URL after deployment.
3. In GitHub, open **Settings** > **Secrets and variables** > **Actions** > **Variables** and add `VITE_API_BASE_URL` with the Render service URL (for example, `https://avanthi-hangout-api.onrender.com`, without a trailing slash).
4. In the repository, open **Settings** > **Pages** and choose **GitHub Actions** as the build and deployment source.
5. Push a commit to `main` or run the **Deploy to GitHub Pages** workflow from the **Actions** tab. The published link will be `https://YOUR-GITHUB-USERNAME.github.io/REPOSITORY-NAME/`.

---

## 🔒 Privacy & Safety Notes

- **Never** hardcode private API keys or Google credentials in frontend code.
- User input is sanitized and truncated server-side (max 500 characters).
- Duplicate submissions with the same submission ID within 60 minutes are safely ignored.
- Accessible keyboard controls ensure the website remains accessible to screen readers and keyboard users.
