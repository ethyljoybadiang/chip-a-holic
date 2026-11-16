# Chip-A-Holic: Registration & Check-in

**Chip-A-Holic: An IEEE CS TCVLSI Workshop on VLSI and Emerging Technologies**
Dec 10–11, 2026 · IEEE Computer Society Philippines Chapter · Sponsored by the IEEE Computer Society

| File | What it is |
|---|---|
| `index.html` | Public registration page |
| `checkin.html` | Staff check-in desk (PIN-protected; search by name) |
| `config.js` | **The only file you edit**: backend URL, venue, slots, contact |
| `apps-script.gs` | Google Sheets backend (stays in Google, not served by GitHub) |

## 1. Set up the Google Sheet backend (≈5 min)
1. Create a new Google Sheet, e.g. *Chip-A-Holic Registrations*.
2. **Extensions → Apps Script**. Delete the sample code and paste everything from `apps-script.gs`.
3. Change `STAFF_PIN = 'CHANGE-ME'` to your own PIN. Save.
4. **Deploy → New deployment → ⚙ Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize, and copy the **Web app URL** (ends in `/exec`).
6. Paste it into `config.js` as `ENDPOINT`, and fill in `VENUE` and `SEATS`.

> If you edit the script later, use **Deploy → Manage deployments → Edit → Version: New version** so the URL stays the same.

## 2. Publish on GitHub Pages (≈3 min)
1. On the repo: **Settings → Pages**.
2. Source: **Deploy from a branch** · Branch: **main** · Folder: **/ (root)** → **Save**.
3. After about a minute the site is live at:
   - Registration: `https://<account>.github.io/chip-a-holic/`
   - Check-in: `https://<account>.github.io/chip-a-holic/checkin.html`

## 3. On event day
- Organizers open `checkin.html` on their phones, enter their name and the staff PIN.
- Type 2+ letters of the participant's name → tick **Release form signed** → **Check in**.
- **NEEDS A LAPTOP** badge = hands-on participant who asked for a laptop.
- Walk-ins: **+ Add walk-in** (gets a `WALK-xxxxx` ID and is checked in immediately).
- Everything is saved live to the Sheet (`checkedInAt`, `releaseSigned`, `checkedInBy`).
- Backup: print the Sheet sorted by name in case the Wi-Fi fails.

## Privacy
Registrations hold personal data (Data Privacy Act of 2012, RA 10173). Keep the Sheet shared only with organizers and keep the staff PIN private.
