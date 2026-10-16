import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  ExternalLink,
  Table,
  Check,
  HelpCircle,
  LogOut,
  RefreshCw,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../lib/googleAuth';
import {
  findExistingSheet,
  createHangoutSheet,
  appendRowToSheet,
  readSheetRows,
  SheetRow,
} from '../lib/googleSheetsService';
import { safeStorage } from '../lib/safeStorage';
import { apiUrl } from '../lib/api';

interface TesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSheetsConfigured: boolean;
  onRefreshStatus: () => void;
}

export const TesterModal: React.FC<TesterModalProps> = ({
  isOpen,
  onClose,
  isSheetsConfigured,
  onRefreshStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'oauth' | 'webhook'>('oauth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sheets state
  const [sheetId, setSheetId] = useState<string>(() => {
    return safeStorage.getItem('avanthi_google_sheet_id') || '';
  });
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [isSearchingSheet, setIsSearchingSheet] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [sheetRows, setSheetRows] = useState<SheetRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [operationFeedback, setOperationFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Webhook test state
  const [testUrl, setTestUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Listen to Auth State
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        checkDriveForSheet();
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        await checkDriveForSheet();
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setAuthError(err?.message || 'Google Sign-in was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setSheetRows([]);
  };

  const checkDriveForSheet = async () => {
    const token = await getAccessToken();
    if (!token) return;

    setIsSearchingSheet(true);
    try {
      const found = await findExistingSheet(token);
      if (found) {
        setSheetId(found.id);
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${found.id}/edit`);
        safeStorage.setItem('avanthi_google_sheet_id', found.id);
        fetchRows(found.id);
      }
    } catch (err) {
      console.warn('Drive search error:', err);
    } finally {
      setIsSearchingSheet(false);
    }
  };

  const [showConfirmCreate, setShowConfirmCreate] = useState(false);

  const handleCreateSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      setAuthError('Please sign in with Google first.');
      return;
    }

    setShowConfirmCreate(false);
    setIsCreatingSheet(true);
    setOperationFeedback(null);
    try {
      const newSheet = await createHangoutSheet(token);
      setSheetId(newSheet.id);
      const url = `https://docs.google.com/spreadsheets/d/${newSheet.id}/edit`;
      setSheetUrl(url);
      safeStorage.setItem('avanthi_google_sheet_id', newSheet.id);
      setOperationFeedback({
        success: true,
        message: 'Created spreadsheet in your Google Drive with formatted headers!',
      });
      fetchRows(newSheet.id);
    } catch (err: any) {
      setOperationFeedback({
        success: false,
        message: err?.message || 'Failed to create spreadsheet in Google Drive.',
      });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSendTestRowDirect = async () => {
    const token = await getAccessToken();
    if (!token || !sheetId) {
      setOperationFeedback({
        success: false,
        message: 'Spreadsheet ID or sign-in missing.',
      });
      return;
    }

    setOperationFeedback(null);
    try {
      const testData = [
        `test-${Date.now().toString(36)}`,
        new Date().toLocaleString(),
        'Accepted and submitted',
        '🌶️ Pani Puri',
        'This weekend',
        'Saturday',
        'Evening',
        'Test row sent directly via Google Sheets API! 👻',
      ];
      await appendRowToSheet(token, sheetId, testData);
      setOperationFeedback({
        success: true,
        message: 'Successfully added test row directly to your Google Sheet!',
      });
      fetchRows(sheetId);
    } catch (err: any) {
      setOperationFeedback({
        success: false,
        message: err?.message || 'Failed to append test row.',
      });
    }
  };

  const fetchRows = async (idToUse?: string) => {
    const targetId = idToUse || sheetId;
    const token = await getAccessToken();
    if (!token || !targetId) return;

    setIsLoadingRows(true);
    try {
      const rows = await readSheetRows(token, targetId);
      setSheetRows(rows);
    } catch (err) {
      console.warn('Could not read sheet rows:', err);
    } finally {
      setIsLoadingRows(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResult(null);

    try {
      const res = await fetch(apiUrl('/api/test-sheets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl.trim() || undefined }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookResult({
          success: true,
          message: data.message || 'Row appended successfully!',
        });
        onRefreshStatus();
      } else {
        setWebhookResult({
          success: false,
          message: data.error || 'Failed to connect to Google Apps Script.',
        });
      }
    } catch (err: any) {
      setWebhookResult({
        success: false,
        message: err?.message || 'Network error while testing.',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const copyAppsScript = () => {
    const scriptCode = `function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var item = payload.data || payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Submission ID", "Timestamp", "Response Status", "Activity", "Availability", "Preferred Date", "Preferred Time", "Message"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#FFF1F2").setFontColor("#881337");
      sheet.setFrozenRows(1);
    }

    var submissionId = item.submissionId || "sub-" + Utilities.getUuid().slice(0, 8);
    var timestamp = item.timestamp ? new Date(item.timestamp) : new Date();
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      submissionId,
      formattedDate,
      item.responseStatus || item.status || "Accepted and submitted",
      item.activity || "",
      item.availability || "",
      item.preferredDate || item.preferredDay || "-",
      item.preferredTime || "-",
      item.message || "-"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", submissionId: submissionId })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 md:p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 font-heading">
              Google Sheets Manager &amp; Status
            </h2>
            <p className="text-xs text-slate-400">
              Manage responses and verify real-time sheet connection
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 mt-4 mb-4 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('oauth')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'oauth'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Google Drive &amp; Sheets API
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'webhook'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Google Apps Script Webhook
          </button>
        </div>

        {/* TAB 1: GOOGLE DRIVE & SHEETS API */}
        {activeTab === 'oauth' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            {!currentUser ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Sign in with your Google account to connect directly to your Google Drive and auto-create or view your private responses spreadsheet.
                </p>

                {/* Official Google Sign-In Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="gsi-material-button mx-auto"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>

                {authError && (
                  <p className="text-xs text-rose-500 font-medium">{authError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account card */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {currentUser.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {currentUser.displayName || currentUser.email}
                      </p>
                      <p className="text-[11px] text-slate-500">Google Drive &amp; Sheets Ready</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Spreadsheet Connection card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Spreadsheet in Google Drive:
                    </span>
                    {sheetId && (
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-pink-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Open in Sheets</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {sheetId ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 break-all select-all">
                        ID: {sheetId}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSendTestRowDirect}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Test Row</span>
                        </button>
                        <button
                          onClick={() => fetchRows()}
                          disabled={isLoadingRows}
                          className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoadingRows ? 'animate-spin' : ''}`} />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 space-y-2">
                      <p className="text-xs text-slate-500">
                        {isSearchingSheet
                          ? 'Searching your Google Drive for existing sheet...'
                          : "No 'Avanthi Hangout Responses 👻' sheet linked yet."}
                      </p>
                      {!showConfirmCreate ? (
                        <button
                          onClick={() => setShowConfirmCreate(true)}
                          disabled={isCreatingSheet}
                          className="py-2 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Sheet on Drive</span>
                        </button>
                      ) : (
                        <div className="p-3 bg-white rounded-xl border border-pink-200 text-xs text-center space-y-2">
                          <p className="font-semibold text-slate-800">
                            Create &quot;Avanthi Hangout Responses 👻&quot; in your Google Drive?
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={handleCreateSheet}
                              disabled={isCreatingSheet}
                              className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold cursor-pointer"
                            >
                              {isCreatingSheet ? 'Creating...' : 'Yes, Create'}
                            </button>
                            <button
                              onClick={() => setShowConfirmCreate(false)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {operationFeedback && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-start gap-1.5 border ${
                        operationFeedback.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {operationFeedback.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <span>{operationFeedback.message}</span>
                    </div>
                  )}
                </div>

                {/* Live Sheet Rows Preview */}
                {sheetId && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Live Sheet Rows ({sheetRows.length}):
                      </span>
                    </div>

                    {sheetRows.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        No responses logged in the sheet yet. Use "Send Test Row" above or complete the questionnaire!
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                            <tr>
                              <th className="p-2 border-b">Status</th>
                              <th className="p-2 border-b">Activity</th>
                              <th className="p-2 border-b">Availability</th>
                              <th className="p-2 border-b">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sheetRows.map((r, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-medium text-emerald-700">
                                  {r.responseStatus}
                                </td>
                                <td className="p-2">{r.activity}</td>
                                <td className="p-2">{r.availability}</td>
                                <td className="p-2 text-slate-400">{r.timestamp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE APPS SCRIPT WEBHOOK */}
        {activeTab === 'webhook' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div
              className={`p-3 rounded-2xl flex items-start gap-2.5 border text-xs ${
                isSheetsConfigured
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              {isSheetsConfigured ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  {isSheetsConfigured ? 'Webhook is Active in Server Environment' : 'Webhook Not Yet Set'}
                </span>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  {isSheetsConfigured
                    ? 'Submissions sent from Avanthi are forwarded to your Google Apps Script URL automatically.'
                    : 'Configure GOOGLE_SHEET_WEBAPP_URL in .env to use the webhook bridge.'}
                </p>
              </div>
            </div>

            {/* Quick 3-step setup guide */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-pink-500" />
                  Quick Setup:
                </span>
                <button
                  onClick={copyAppsScript}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-pink-600 font-semibold hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? 'Copied!' : 'Copy Apps Script'}</span>
                </button>
              </div>

              <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>
                  Create a sheet at{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    sheets.new <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  Click <strong>Extensions &gt; Apps Script</strong>, paste the script code, and save.
                </li>
                <li>
                  Click <strong>Deploy &gt; New deployment &gt; Web app</strong> (Execute as: <em>Me</em>, Access: <em>Anyone</em>).
                </li>
              </ol>
            </div>

            {/* Test form */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Test Web App URL:
              </label>
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button
                onClick={handleTestWebhook}
                disabled={isTestingWebhook}
                className="w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
              >
                {isTestingWebhook ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                <span>Send Test Row via Webhook</span>
              </button>

              {webhookResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-1.5 border ${
                    webhookResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {webhookResult.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{webhookResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
