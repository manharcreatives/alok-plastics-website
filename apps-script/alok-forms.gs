// Google Apps Script: Alok Plastics website forms
// What it does for every POST from the website:
//   1. checks the shared secret
//   2. adds a row to a Google Sheet (tabs: Enquiries, Orders, Career; the Sheet is created automatically the first time)
//   3. career applications: saves the resume in the Google Drive folder and puts the link in the row
//   4. emails the details to TO_EMAILS
//
// Setup is in apps-script/README.md. Fill in the three values below (or use the alok-forms.local.gs copy).

const CONFIG = {
  SECRET: 'PASTE_SECRET',                 // same value as SCRIPT_SECRET on Vercel
  DRIVE_FOLDER_ID: 'PASTE_FOLDER_ID',     // the "Resumes" folder in Google Drive
  SHEET_ID: 'PASTE_SHEET_ID_OR_LEAVE_EMPTY',   // optional: your own Google Sheet; empty = the script creates one
  TO_EMAILS: ['PASTE_EMAIL'],             // who receives the notifications
};

const TABS = {
  enquiry: { name: 'Enquiries', head: ['Time', 'Name', 'Company', 'Phone', 'Email', 'City', 'State', 'Buyer type', 'Product', 'Quantity', 'Message', 'Source page'] },
  order:   { name: 'Orders',    head: ['Time', 'Order ID', 'Name', 'Phone', 'Address', 'Items', 'Estimated total', 'Customer note'] },
  career:  { name: 'Career',    head: ['Time', 'Name', 'Phone', 'Email', 'Position', 'Message', 'Link given', 'Resume (Drive)'] },
};

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function spreadsheet() {
  if (CONFIG.SHEET_ID && CONFIG.SHEET_ID.indexOf('PASTE') !== 0) return SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* deleted: make a new one */ }
  }
  const ss = SpreadsheetApp.create('Alok Plastics: website submissions');
  props.setProperty('SHEET_ID', ss.getId());
  CONFIG.TO_EMAILS.forEach(function (to) {
    MailApp.sendEmail(to, 'Alok Plastics: Google Sheet created', 'All website enquiries, orders and career applications are logged here:\n' + ss.getUrl());
  });
  return ss;
}

function tab(type) {
  const t = TABS[type] || TABS.enquiry;
  const ss = spreadsheet();
  let sh = ss.getSheetByName(t.name);
  if (!sh) {
    sh = ss.getSheets().length === 1 && ss.getSheets()[0].getLastRow() === 0 && ss.getSheets()[0].getName() !== t.name
      ? ss.getSheets()[0].setName(t.name)
      : ss.insertSheet(t.name);
    sh.appendRow(t.head);
    sh.getRange(1, 1, 1, t.head.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function clean(s) {
  return String(s == null ? '' : s).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
}

function appendRow(sh, values) {
  // Text format keeps "+91..." phone numbers and long order ids exactly as sent; "=..." can never run as a formula.
  const row = sh.getLastRow() + 1;
  const range = sh.getRange(row, 1, 1, values.length);
  range.setNumberFormat('@');
  range.setValues([values.map(function (v) { return String(v == null ? '' : v); })]);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data || data.secret !== CONFIG.SECRET) return json({ success: false, error: 'Forbidden' });
    const type = TABS[data.type] ? data.type : 'enquiry';
    const row = Array.isArray(data.row) ? data.row : [];
    const stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy HH:mm');

    let resumeLink = '';
    if (type === 'career' && data.resumeBase64) {
      const name = String(row[0] || 'Applicant');
      const position = String(row[3] || 'General');
      const original = String(data.resumeName || 'resume.pdf');
      const ext = original.indexOf('.') >= 0 ? '.' + original.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') : '.pdf';
      const fileName = clean(name) + '_' + clean(position) + '_' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd') + ext;
      const blob = Utilities.newBlob(Utilities.base64Decode(data.resumeBase64), data.resumeMime || 'application/pdf', fileName);
      resumeLink = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID).createFile(blob).getUrl();
    }

    const values = [stamp].concat(row.map(String));
    if (type === 'career') values.push(resumeLink || 'Not provided');
    appendRow(tab(type), values);

    const body = String(data.text || '') + (resumeLink ? '\nResume (Google Drive): ' + resumeLink + '\n' : '');
    const opts = {};
    if (data.replyTo) opts.replyTo = String(data.replyTo);
    MailApp.sendEmail(CONFIG.TO_EMAILS.join(','), String(data.subject || 'Alok Plastics website'), body, opts);

    return json({ success: true, resumeLink: resumeLink });
  } catch (err) {
    return json({ success: false, error: String(err) });
  }
}

// Run this once from the editor (Run > authorizeAll) so Google asks for Drive, Sheets and Gmail permission.
function authorizeAll() {
  DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID).getName();
  spreadsheet();
  MailApp.getRemainingDailyQuota();
}
