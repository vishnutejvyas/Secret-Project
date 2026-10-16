/**
 * =========================================================================
 * GOOGLE APPS SCRIPT FOR AVANTHI'S HANGOUT WEBSITE
 * =========================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new) on your Google account (vishnumahimaluru@gmail.com).
 * 2. Name your spreadsheet: "Avanthi Hangout Responses 👻".
 * 3. In the top menu, click Extensions > Apps Script.
 * 4. Delete any code in the editor, paste this entire script, and click "Save" (disk icon).
 * 5. Click "Deploy" > "New deployment".
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. Set:
 *    - Description: "Avanthi Hangout Receiver"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (allows the backend server to append rows securely without making your sheet public)
 * 8. Click "Deploy", review permissions, click "Advanced" > "Go to Avanthi Hangout Receiver (unsafe)" > "Allow".
 * 9. Copy the Web App URL (starts with https://script.google.com/macros/s/...).
 * 10. Paste this URL into your .env or AI Studio environment variables as GOOGLE_SHEET_WEBAPP_URL.
 * 
 * Your Google Sheet remains 100% PRIVATE to your Google account.
 * You can open the Google Sheets app on your iPhone or Android anytime to see live updates!
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var item = payload.data || payload;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // If sheet is empty, set up headers
    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }

    var submissionId = item.submissionId || "sub-" + Utilities.getUuid().slice(0, 8);
    var timestamp = item.timestamp ? new Date(item.timestamp) : new Date();
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var responseStatus = item.responseStatus || item.status || "Accepted and submitted";
    var activity = item.activity || "";
    var availability = item.availability || "";
    var preferredDate = item.preferredDate || item.preferredDay || "-";
    var preferredTime = item.preferredTime || "-";
    var message = item.message || "-";

    // Append row
    sheet.appendRow([
      submissionId,
      formattedDate,
      responseStatus,
      activity,
      availability,
      preferredDate,
      preferredTime,
      message
    ]);

    // Optional styling for the new row
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(lastRow, 1, 1, 8);
    range.setFontFamily("Outfit");
    range.setFontSize(10);
    range.setVerticalAlignment("middle");
    
    // Highlight accepted vs declined
    if (responseStatus === "Accepted and submitted") {
      sheet.getRange(lastRow, 3).setBackground("#DCFCE7").setFontColor("#15803D").setFontWeight("bold");
    } else if (responseStatus === "Declined") {
      sheet.getRange(lastRow, 3).setBackground("#FEE2E2").setFontColor("#B91C1C").setFontWeight("bold");
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Row appended successfully",
      submissionId: submissionId,
      rowNumber: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Avanthi Hangout Response Receiver 👻",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function setupHeaders(sheet) {
  var headers = [
    "Submission ID",
    "Timestamp",
    "Response Status",
    "Activity",
    "Availability",
    "Preferred Date",
    "Preferred Time",
    "Message"
  ];
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#FFF1F2");
  headerRange.setFontColor("#881337");
  headerRange.setFontFamily("Outfit");
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  
  // Set generous column widths
  sheet.setColumnWidth(1, 160); // Submission ID
  sheet.setColumnWidth(2, 160); // Timestamp
  sheet.setColumnWidth(3, 190); // Status
  sheet.setColumnWidth(4, 160); // Activity
  sheet.setColumnWidth(5, 180); // Availability
  sheet.setColumnWidth(6, 140); // Preferred Date
  sheet.setColumnWidth(7, 140); // Preferred Time
  sheet.setColumnWidth(8, 280); // Message
}
