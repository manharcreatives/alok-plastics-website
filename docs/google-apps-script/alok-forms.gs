const CONFIG = {
  SECRET: PropertiesService.getScriptProperties().getProperty('SECRET') || '',
  CLIENT_EMAIL: PropertiesService.getScriptProperties().getProperty('CLIENT_EMAIL') || '',
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '',
  RESUME_FOLDER_ID: PropertiesService.getScriptProperties().getProperty('RESUME_FOLDER_ID') || '',
};

const SHEETS = {
  career: {
    name: 'Careers',
    header: ['Received', 'Application ID', 'Name', 'Phone', 'Email', 'Position', 'Resume link', 'Resume file', 'Message', 'IP'],
  },
  order: {
    name: 'Orders',
    header: ['Received', 'Order ID', 'Name', 'Phone', 'Items', 'Total', 'IP'],
  },
};

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheetFor(kind) {
  const def = SHEETS[kind];
  const book = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = book.getSheetByName(def.name);
  if (!sheet) {
    sheet = book.insertSheet(def.name);
    sheet.appendRow(def.header);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveResume(data) {
  if (!data.resumeBase64 || !CONFIG.RESUME_FOLDER_ID) return '';
  const name = String(data.resumeName || 'resume').replace(/[^A-Za-z0-9._ -]/g, '_');
  const lower = name.toLowerCase();
  const mime = lower.endsWith('.pdf')
    ? 'application/pdf'
    : lower.endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/msword';
  const blob = Utilities.newBlob(Utilities.base64Decode(data.resumeBase64), mime, data.name + ' - ' + name);
  const file = DriveApp.getFolderById(CONFIG.RESUME_FOLDER_ID).createFile(blob);
  return file.getUrl();
}

function handleCareer(data) {
  const fileUrl = saveResume(data);
  sheetFor('career').appendRow([
    data.time,
    data.applicationId,
    data.name,
    data.phone,
    data.email,
    data.position,
    data.resumeLink || '',
    fileUrl,
    data.message || '',
    data.ip || '',
  ]);
  if (CONFIG.CLIENT_EMAIL) {
    const lines = [
      'New career application',
      '',
      'Name: ' + data.name,
      'Phone: ' + data.phone,
      'Email: ' + data.email,
      'Position: ' + data.position,
      data.resumeLink ? 'Resume link: ' + data.resumeLink : '',
      fileUrl ? 'Resume file: ' + fileUrl : '',
      data.message ? '\nMessage:\n' + data.message : '',
      '',
      'Submitted: ' + data.time,
      'IP: ' + (data.ip || ''),
    ].filter(function (l) { return l !== ''; });
    MailApp.sendEmail({
      to: CONFIG.CLIENT_EMAIL,
      replyTo: data.email,
      subject: 'Career application: ' + data.name + ' - ' + data.position,
      body: lines.join('\n'),
    });
  }
}

function handleOrder(data) {
  sheetFor('order').appendRow([data.time, data.code, data.name, data.phone, data.items, data.total === null ? '' : data.total, data.ip || '']);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!CONFIG.SECRET || data.secret !== CONFIG.SECRET) return json({ ok: false, error: 'unauthorised' });
    if (data.type === 'career') handleCareer(data);
    else if (data.type === 'order') handleOrder(data);
    else return json({ ok: false, error: 'unknown type' });
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}
