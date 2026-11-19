// ===== Chip-A-Holic backend: registration + staff check-in =====
// Paste this into a NEW Google Sheet: Extensions → Apps Script. See README for deploy steps.

const STAFF_PIN = 'CHANGE-ME';   // <-- set your own PIN and share it only with organizers

const HEADERS = ['submittedAt','chipId','track','name','email','mobile','org','role','program',
                 'ieee','level','laptop','diet','privacy','release',
                 'checkedInAt','releaseSigned','checkedInBy'];
const C = Object.fromEntries(HEADERS.map((h, i) => [h, i]));

function doPost(e) {
  const d = JSON.parse((e.postData && e.postData.contents) || '{}');
  if (!d.action) return register_(d);                         // public registration
  if (String(d.pin) !== STAFF_PIN) return out_({ ok: false, error: 'Wrong PIN' });
  switch (d.action) {
    case 'stats':   return out_(stats_());
    case 'search':  return out_(search_(d.q));
    case 'checkin': return out_(checkin_(d));
    case 'walkin':  return out_(walkin_(d));
  }
  return out_({ ok: false, error: 'Unknown action' });
}

function register_(d) {
  withLock_(() => sheet_().appendRow(HEADERS.map(h => d[h] || '')));
  return out_({ ok: true });
}

function stats_() {
  const rows = rows_();
  const onsite = rows.filter(r => String(r.track).includes('Onsite'));
  return { ok: true,
    registered: rows.length,
    onsite: onsite.length,
    online: rows.length - onsite.length,
    checkedIn: rows.filter(r => r.checkedInAt).length,
    releaseSigned: rows.filter(r => r.releaseSigned === 'Yes').length };
}

function search_(q) {
  q = String(q || '').toLowerCase().trim();
  if (q.length < 2) return { ok: true, results: [] };
  const results = rows_().filter(r =>
    [r.name, r.chipId, r.email, r.org].some(v => String(v).toLowerCase().includes(q))
  ).slice(0, 20).map(pick_);
  return { ok: true, results };
}

function checkin_(d) {
  return withLock_(() => {
    const sh = sheet_(), rows = rows_(sh);
    const r = rows.find(x => x.chipId === d.chipId);
    if (!r) return { ok: false, error: 'Chip ID not found' };
    if (d.undo) {
      sh.getRange(r._row, C.checkedInAt + 1, 1, 3).setValues([['', '', '']]);
      r.checkedInAt = ''; r.releaseSigned = ''; r.checkedInBy = '';
    } else {
      if (r.checkedInAt) return { ok: true, already: true, record: pick_(r) };
      const now = new Date();
      sh.getRange(r._row, C.checkedInAt + 1, 1, 3)
        .setValues([[now, d.release ? 'Yes' : 'No', d.by || '']]);
      r.checkedInAt = now; r.releaseSigned = d.release ? 'Yes' : 'No'; r.checkedInBy = d.by || '';
    }
    return { ok: true, record: pick_(r) };
  });
}

function walkin_(d) {
  return withLock_(() => {
    const id = 'WALK-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const row = HEADERS.map(() => '');
    Object.assign(row, {
      [C.submittedAt]: new Date(), [C.chipId]: id, [C.track]: d.track || 'Hands-on Workshop + Talks (Onsite)',
      [C.name]: d.name || '', [C.email]: d.email || '', [C.mobile]: d.mobile || '', [C.org]: d.org || '',
      [C.privacy]: 'Yes (on-site)', [C.release]: 'Yes',
      [C.checkedInAt]: new Date(), [C.releaseSigned]: d.release ? 'Yes' : 'No', [C.checkedInBy]: d.by || ''
    });
    sheet_().appendRow(row);
    return { ok: true, chipId: id };
  });
}

// ---- helpers ----
function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}
function rows_(sh) {
  sh = sh || sheet_();
  const v = sh.getDataRange().getValues();
  return v.slice(1).map((r, i) => {
    const o = { _row: i + 2 };
    HEADERS.forEach((h, j) => o[h] = r[j]);
    return o;
  });
}
function pick_(r) {
  return { chipId: r.chipId, name: r.name, org: r.org, track: r.track, laptop: r.laptop,
           checkedInAt: r.checkedInAt ? new Date(r.checkedInAt).toISOString() : '',
           releaseSigned: r.releaseSigned, checkedInBy: r.checkedInBy };
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
