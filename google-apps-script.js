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
var DRIVE_FOLDER_ID = '1ZVJ9ma9Gfxp0xeYH-3PKTVLvbQct_3ZQ';

var NOTIFY_EMAILS = ['ankur@onlyexit.vc', 'sahil@onlyexit.vc'];

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var formType = payload.formType || 'main-site';

    if (formType === 'apply-page') {
      return handleApplySubmission(payload);
    } else if (formType === 'creator') {
      return handleCreatorSubmission(payload);
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

// ---- Creator page form ----
function handleCreatorSubmission(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Creators');

  if (!sheet) {
    sheet = ss.insertSheet('Creators');
    sheet.appendRow([
      'Timestamp',
      'Full Name',
      'Email',
      'Phone',
      'City',
      'Instagram',
      'TikTok',
      'Follower Count',
      'Reel Link',
      'Reel Recording',
      'Available Days',
      'Own Transport',
      'Is 18+',
      'Can Get to Seattle'
    ]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold');
  }

  var reelFileUrl = '';

  if (data.reel_recording_base64) {
    try {
      var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      var mimeType = data.reel_mime_type || 'video/webm';
      var fileName = (data.full_name || 'unknown').replace(/[^a-zA-Z0-9]/g, '-') + '-reel-' + new Date().getTime() + '.webm';

      var blob = Utilities.newBlob(
        Utilities.base64Decode(data.reel_recording_base64),
        mimeType,
        fileName
      );
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      reelFileUrl = file.getUrl();
    } catch (uploadErr) {
      reelFileUrl = 'Upload failed: ' + uploadErr.toString();
    }

    delete data.reel_recording_base64;
    delete data.reel_mime_type;
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.full_name || '',
    data.email || '',
    data.phone || '',
    data.city || '',
    data.instagram || '',
    data.tiktok || '',
    data.follower_count || '',
    data.reel_link || '',
    reelFileUrl,
    data.available_days || '',
    data.own_transport || '',
    data.is_18_plus || '',
    data.can_get_to_seattle || ''
  ]);

  sendCreatorNotificationEmail(data, reelFileUrl);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', reelUrl: reelFileUrl }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendCreatorNotificationEmail(data, reelFileUrl) {
  var subject = 'New Creator Submission: ' + (data.full_name || 'Unknown');

  var body = 'New creator submission for OnlyExit shoots.\n\n'
    + '--- CREATOR ---\n'
    + 'Name: ' + (data.full_name || '') + '\n'
    + 'Email: ' + (data.email || '') + '\n'
    + 'Phone: ' + (data.phone || '') + '\n'
    + 'City: ' + (data.city || '') + '\n'
    + 'Instagram: ' + (data.instagram || '') + '\n'
    + 'TikTok: ' + (data.tiktok || '') + '\n'
    + 'Followers: ' + (data.follower_count || '') + '\n\n'
    + '--- REEL ---\n'
    + 'Recording: ' + (reelFileUrl || 'No recording') + '\n'
    + 'Link: ' + (data.reel_link || 'None') + '\n\n'
    + '--- AVAILABILITY ---\n'
    + 'Days: ' + (data.available_days || 'Not specified') + '\n'
    + 'Own transport: ' + (data.own_transport || 'Not specified') + '\n\n'
    + '--- FILTER ---\n'
    + '18+: ' + (data.is_18_plus || '') + '\n'
    + 'Can get to Seattle: ' + (data.can_get_to_seattle || '') + '\n\n'
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
