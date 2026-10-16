export interface SheetRow {
  submissionId: string;
  timestamp: string;
  responseStatus: string;
  activity: string;
  availability: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

const SHEET_HEADERS = [
  'Submission ID',
  'Timestamp',
  'Response Status',
  'Activity',
  'Availability',
  'Preferred Date',
  'Preferred Time',
  'Message',
];

/**
 * Searches user's Google Drive for existing "Avanthi Hangout Responses 👻" spreadsheet.
 */
export async function findExistingSheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Avanthi Hangout Responses 👻' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to search Google Drive (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
}

/**
 * Creates a brand new Google Spreadsheet with cute pastel header styling.
 */
export async function createHangoutSheet(accessToken: string): Promise<{ id: string; webViewLink?: string }> {
  const createPayload = {
    properties: {
      title: 'Avanthi Hangout Responses 👻',
    },
    sheets: [
      {
        properties: {
          title: 'Responses',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 8,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create spreadsheet (HTTP ${response.status})`);
  }

  const spreadsheet = await response.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // Insert header row
  await appendRowToSheet(accessToken, spreadsheetId, SHEET_HEADERS, 'Responses!A1');

  // Format header row with pastel pink styling
  await formatHeaderRow(accessToken, spreadsheetId);

  return {
    id: spreadsheetId,
    webViewLink: spreadsheet.spreadsheetUrl,
  };
}

/**
 * Formats header with pastel pink background, bold dark red text.
 */
async function formatHeaderRow(accessToken: string, spreadsheetId: string) {
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 8,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1.0, green: 0.94, blue: 0.95 }, // #FFF0F2
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 0.53, green: 0.07, blue: 0.22 }, // #881337
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 8,
              },
              properties: {
                pixelSize: 160,
              },
              fields: 'pixelSize',
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Could not format header row:', err);
  }
}

/**
 * Appends a raw row array of strings to a spreadsheet range.
 */
export async function appendRowToSheet(
  accessToken: string,
  spreadsheetId: string,
  rowValues: string[],
  range: string = 'Responses!A:H'
): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to append row to Google Sheet (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Reads all rows from the spreadsheet.
 */
export async function readSheetRows(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetRow[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Responses!A2:H?majorDimension=ROWS`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    // Fallback: try default Sheet1
    const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A2:H?majorDimension=ROWS`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!fallbackRes.ok) {
      const err = await fallbackRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to read spreadsheet data (HTTP ${response.status})`);
    }
    const data = await fallbackRes.json();
    return (data.values || []).map(mapRowValues);
  }

  const data = await response.json();
  return (data.values || []).map(mapRowValues);
}

function mapRowValues(row: string[]): SheetRow {
  return {
    submissionId: row[0] || '',
    timestamp: row[1] || '',
    responseStatus: row[2] || '',
    activity: row[3] || '',
    availability: row[4] || '',
    preferredDate: row[5] || '',
    preferredTime: row[6] || '',
    message: row[7] || '',
  };
}
