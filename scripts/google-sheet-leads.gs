/**
 * Oh My Greece Franchise — website applications → Google Sheet
 *
 * Receives leads from the website (src/lib/lead-sheet.ts) and appends one row
 * per lead. Each form gets its own tab ("Bewerbungen"); the tab and its
 * header row are created on the first lead.
 *
 * SETUP (about 5 minutes, once)
 *  1. Create a Google Sheet, e.g. "Oh My Greece – Franchise-Bewerbungen", in the account that
 *     should own the data (share it with the team as usual).
 *  2. In the sheet: Erweiterungen → Apps Script. Delete the sample code and
 *     paste this whole file. Save.
 *  3. Bereitstellen → Neue Bereitstellung → Typ "Web-App":
 *       Ausführen als:     Ich
 *       Zugriff:           Jeder
 *     → Bereitstellen, grant access, copy the Web-App URL (ends in /exec).
 *  4. Reload the sheet. Menu "Website-Leads" → "Secret anzeigen" creates the
 *     shared secret on first use and shows it.
 *  5. In Vercel → Project → Settings → Environment Variables add
 *       LEADS_SHEET_URL     = the /exec URL
 *       LEADS_SHEET_SECRET  = the secret from step 4
 *     and redeploy.
 *
 * "Jeder" only means the URL can be called without a Google login; requests
 * without the secret are rejected, and the sheet itself stays private. The
 * secret lives in the script's properties, not in this code. After editing
 * this script, deploy a new version (Bereitstellungen verwalten → Bearbeiten
 * → Version: Neu) — the URL stays the same.
 */

const SECRET_PROPERTY = 'LEADS_SHEET_SECRET';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Website-Leads')
    .addItem('Secret anzeigen', 'showSecret')
    .addToUi();
}

/** Creates the shared secret on first use and shows it for Vercel. */
function showSecret() {
  SpreadsheetApp.getUi().alert(
    'LEADS_SHEET_SECRET für Vercel',
    secret(true),
    SpreadsheetApp.getUi().ButtonSet.OK,
  );
}

function secret(create) {
  const props = PropertiesService.getScriptProperties();
  let value = props.getProperty(SECRET_PROPERTY);
  if (!value && create) {
    value = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    props.setProperty(SECRET_PROPERTY, value);
  }
  return value;
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }
  const expected = secret(false);
  if (!data || !expected || data.secret !== expected) {
    return json({ ok: false, error: 'unauthorized' });
  }

  const tab = String(data.sheet || 'Leads').slice(0, 50);
  const row = data.row || {};

  // Two leads arriving at once must not write to the same row.
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(tab) || book.insertSheet(tab);

    // Header row: "Eingegangen", the lead's fields, then "Status" for the team.
    let headers = sheet.getLastRow() > 0
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      : [];
    if (headers.length === 0) {
      headers = ['Eingegangen'].concat(Object.keys(row), ['Status']);
      sheet.getRange(1, 1, 1, headers.length)
        .setValues([headers])
        .setFontWeight('bold')
        .setBackground('#3b001b')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    } else {
      // A field the form gained later gets its own column before "Status".
      Object.keys(row).forEach(function (key) {
        if (headers.indexOf(key) === -1) {
          const at = Math.max(headers.indexOf('Status'), 1);
          sheet.insertColumnBefore(at + 1);
          sheet.getRange(1, at + 1).setValue(key).setFontWeight('bold')
            .setBackground('#3b001b').setFontColor('#ffffff');
          headers.splice(at, 0, key);
        }
      });
    }

    const values = headers.map(function (h) {
      if (h === 'Eingegangen') return new Date();
      if (h === 'Status') return 'Neu';
      return asText(row[h]);
    });
    sheet.appendRow(values);
    sheet.getRange(sheet.getLastRow(), 1).setNumberFormat('dd.MM.yyyy HH:mm');
  } finally {
    lock.releaseLock();
  }

  return json({ ok: true });
}

/** Stored as plain text: keeps leading zeros and "+49" in phone numbers and
 *  stops values like "=IMPORTXML(…)" from running as formulas. */
function asText(v) {
  const s = v == null ? '' : String(v).slice(0, 2000);
  return /^[=+\-@0-9]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
