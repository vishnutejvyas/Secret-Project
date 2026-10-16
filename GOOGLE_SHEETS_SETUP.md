# 👻 Avanthi's Hangout Website: Google Sheets Integration Guide

This guide explains how to connect Avanthi's responses directly to your private Google Sheet so that when she submits her answers, a new row appears in real-time, viewable right from the Google Sheets app on your phone.

---

## 1. Why Google Apps Script is the Optimal Choice

1. **100% Private**: Your spreadsheet is never public or shared with anyone else.
2. **Zero-Friction for Avanthi**: Avanthi is **never** asked to sign in to Google or grant OAuth permissions. She gets a smooth, cute, uninterrupted experience.
3. **No Expensive Database Required**: Uses your personal Google Drive storage without extra cloud database costs.
4. **Instant Mobile Notifications**: With the Google Sheets app installed on your smartphone (iOS/Android), you can turn on edit notifications to be alerted the moment she submits!
5. **Server-Side Validation**: The Express backend acts as an authenticated intermediary: it verifies activity choices against the whitelist, sanitizes message text, deduplicates requests, and safely forwards to Google Apps Script.

---

## 2. Step-by-Step Setup (Takes ~2 Minutes)

### Step 1: Create Your Private Spreadsheet
1. Go to [Google Sheets](https://sheets.new) while logged into your Google account (`vishnumahimaluru@gmail.com`).
2. Title the spreadsheet: **`Avanthi Hangout Responses 👻`**.
3. (Optional) You can leave the sheet completely blank. The script will automatically insert the 8 stylized column headers on first run.

### Step 2: Paste the Apps Script Code
1. In the top menu of your Google Sheet, click **Extensions** > **Apps Script**.
2. Erase the default empty `myFunction()` code.
3. Copy the entire contents of `google-apps-script.js` from this project and paste it into the editor.
4. Click the **Save** icon (floppy disk) or press `Cmd+S` / `Ctrl+S`.

### Step 3: Deploy as a Web App
1. At the top right of the Apps Script window, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Fill out the deployment configuration:
   - **Description**: `Avanthi Hangout Webhook`
   - **Execute as**: `Me (vishnumahimaluru@gmail.com)`
   - **Who has access**: `Anyone` *(Note: This allows our Express backend server to deliver responses to the script. Only the script can write to your sheet; your actual Google Sheet file remains 100% private to your account).*
4. Click **Deploy**.
5. Google will ask you to authorize access:
   - Click **Authorize access**.
   - Select your Google account.
   - You will see a warning screen: *"Google hasn't verified this app"*. Click **Advanced** (bottom left), then click **Go to Avanthi Hangout Webhook (unsafe)**.
   - Click **Allow**.
6. Google will display your **Web App URL**. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. Copy this URL!

### Step 4: Configure the Website Backend
In your `.env` file (or Google AI Studio environment settings / Cloud Run environment variables):
```env
GOOGLE_SHEET_WEBAPP_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

---

## 3. Spreadsheet Columns & Schema

When Avanthi submits, the row will record:

| Column | Header | Description | Example |
|---|---|---|---|
| 1 | **Submission ID** | Unique random identifier | `sub-9b1d8f2a` |
| 2 | **Timestamp** | Submission date & time | `2026-10-15 14:32:00` |
| 3 | **Response Status** | Status badge | `Accepted and submitted` or `Declined` |
| 4 | **Activity** | Selected fun option | `🌶️ Pani Puri` |
| 5 | **Availability** | Her general availability | `This weekend` |
| 6 | **Preferred Date** | Optional chosen day | `Saturday` or `2026-10-18` |
| 7 | **Preferred Time** | Preferred time of day | `Evening` |
| 8 | **Message** | Her special requests or food demands | *"Only spicy pani puri, no sweet chutney allowed! 😂"* |

---

## 4. How to Test Before Sending to Avanthi

We built a built-in tester right into the app!
1. Start the app in Google AI Studio or open the website.
2. In the footer, click the subtle **"⚙️ Integration Status / Tester"** link.
3. You will see:
   - Whether `GOOGLE_SHEET_WEBAPP_URL` is detected.
   - A **"Send Test Row to Google Sheet"** button.
4. Click the test button. If correctly deployed, you will see a green checkmark and a test row will instantly appear in your Google Sheet!

---

## 5. How to Check Responses on Your Phone

1. Install the **Google Sheets** app from the App Store (iOS) or Google Play Store (Android).
2. Log in with `vishnumahimaluru@gmail.com`.
3. Open the spreadsheet `Avanthi Hangout Responses 👻`.
4. Add it to your favorites or home screen widget for instant 1-tap access!
5. In Google Sheets settings (or via Google Drive notifications), enable notifications so your phone vibrates the moment she finishes the questionnaire!
