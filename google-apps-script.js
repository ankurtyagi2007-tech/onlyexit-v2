// =============================================================
// OnlyExit Google Apps Script — Deploy as Web App
// =============================================================
// This script handles form submissions from both the main site
// and the /apply page. It writes to separate tabs in the same
// spreadsheet, uploads recordings to Google Drive, and sends
// email notifications.
//
// SETUP:
// 1. Open https://script.google.com and create a new project
// 2. Paste this entire file into Code.gs
// 3. Replace SPREADSHEET_ID with your existing spreadsheet ID
//    (the long string in the Google Sheets URL between /d/ and /edit)
// 4. Replace DRIVE_FOLDER_ID with a Google Drive folder ID
//    (create a folder called "OnlyExit Applications", then copy
//    the ID from its URL)
// 5. Click Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the new deployment URL and paste it into apply/index.html
//    (replace the existing GOOGLE_SHEETS_URL value)
//
// NOTE: If you want to keep the main site using the OLD script,
// only update the URL in apply/index.html. If you want both
// pages to use this new script, update app.js too.
// =============================================================

var SPREADSHEET_ID = '1wj7OguaryfvVC82KgLKCqi1FlPJfD1Dy7DdIFYLS56w';
var DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';

var NOTIFY_EMAILS = ['ankur@onlyexit.vc', 'sahil@onlyexit.vc'];

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var formType = payload.formType || 'main-site';

    if (formType === 'apply-page') {
      return handleApplySubmission(payload);
    } else {
      return handleMainSiteSubmission(payload);
    }
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Main site form (existing behavior) ----
function handleMainSiteSubmission(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Main Site') || ss.getSheets()[0];

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers[0] === '') {
    headers = Object.keys(data);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  var row = headers.map(function(h) { return data[h] || ''; });
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Apply page form ----
function handleApplySubmission(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Applications');

  if (!sheet) {
    sheet = ss.insertSheet('Applications');
    sheet.appendRow([
      'Timestamp',
      'Full Name',
      'Email',
      'LinkedIn',
      'Phone',
      'What Are You Building',
      'Customer',
      'Pitch Link',
      'Pitch Recording',
      'Seattle Commitment',
      'Start Date'
    ]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }

  var pitchFileUrl = '';

  // Handle video/audio upload
  if (data.pitch_recording_base64) {
    try {
      var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      var mimeType = data.pitch_mime_type || 'video/webm';
      var ext = mimeType.indexOf('audio') > -1 ? '.webm' : '.webm';
      var fileName = (data.full_name || 'unknown').replace(/[^a-zA-Z0-9]/g, '-') + '-pitch-' + new Date().getTime() + ext;

      var blob = Utilities.newBlob(
        Utilities.base64Decode(data.pitch_recording_base64),
        mimeType,
        fileName
      );
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      pitchFileUrl = file.getUrl();
    } catch (uploadErr) {
      pitchFileUrl = 'Upload failed: ' + uploadErr.toString();
    }

    // Remove base64 data before writing to sheet
    delete data.pitch_recording_base64;
    delete data.pitch_mime_type;
  }

  // Write to sheet
  sheet.appendRow([
    new Date().toISOString(),
    data.full_name || '',
    data.email || '',
    data.linkedin || '',
    data.phone || '',
    data.what_building || '',
    data.customer || '',
    data.pitch_link || '',
    pitchFileUrl,
    data.seattle_commitment || '',
    data.start_date || ''
  ]);

  // Send email notification
  sendNotificationEmail(data, pitchFileUrl);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', pitchUrl: pitchFileUrl }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendNotificationEmail(data, pitchFileUrl) {
  var subject = 'New Hacker House Application: ' + (data.full_name || 'Unknown');

  var body = 'New application received for the OnlyExit Hacker House.\n\n'
    + '--- APPLICANT ---\n'
    + 'Name: ' + (data.full_name || '') + '\n'
    + 'Email: ' + (data.email || '') + '\n'
    + 'LinkedIn: ' + (data.linkedin || '') + '\n'
    + 'Phone: ' + (data.phone || '') + '\n\n'
    + '--- STARTUP ---\n'
    + 'Building: ' + (data.what_building || '') + '\n'
    + 'Customer: ' + (data.customer || '') + '\n\n'
    + '--- PITCH ---\n'
    + 'Recording: ' + (pitchFileUrl || 'No recording') + '\n'
    + 'Link: ' + (data.pitch_link || 'None') + '\n\n'
    + '--- FILTER ---\n'
    + 'Seattle commitment: ' + (data.seattle_commitment || '') + '\n'
    + 'Start date: ' + (data.start_date || '') + '\n\n'
    + '---\n'
    + 'Submitted: ' + new Date().toISOString() + '\n';

  NOTIFY_EMAILS.forEach(function(email) {
    try {
      MailApp.sendEmail({
        to: email,
        subject: subject,
        body: body
      });
    } catch (mailErr) {
      Logger.log('Failed to email ' + email + ': ' + mailErr.toString());
    }
  });
}
