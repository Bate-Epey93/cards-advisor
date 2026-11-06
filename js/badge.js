// Your badge: a study badge (not a bank ID) with a live editor.
// Everything saves on this device only.
import { store } from './store.js';
import { esc } from './render.js';
import { toast } from './toast.js';
import { data } from './data.js';
import { renderRoughCardLogo, renderRoughBadgeChipSvg } from './diagram.js';

/* ── Barcode SVG generator matching employee ID ── */
function renderBarcodeSvg(code, width = 260, height = 50) {
  const clean = String(code || 'EMP-84291').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') || 'EMP-84291';
  const bars = [];
  let x = 12;

  // Start guard
  bars.push({ x, w: 2.2 }); x += 4.5;
  bars.push({ x, w: 1.2 }); x += 3.5;

  for (let i = 0; i < clean.length; i++) {
    const c = clean.charCodeAt(i);
    const b1 = ((c * 7) % 3) + 1.2;
    const g1 = ((c * 11) % 2) + 1.6;
    const b2 = ((c * 13) % 3) + 1.2;
    const g2 = ((c * 17) % 2) + 1.6;
    const b3 = ((c * 19) % 2) + 1.1;
    bars.push({ x, w: b1 }); x += b1 + g1;
    bars.push({ x, w: b2 }); x += b2 + g2;
    bars.push({ x, w: b3 }); x += b3 + 2.2;
  }

  // Stop guard
  bars.push({ x, w: 1.2 }); x += 3.5;
  bars.push({ x, w: 2.2 }); x += 4.5;

  const contentW = x + 12;
  const totalW = Math.max(contentW, width);
  const off = (totalW - contentW) / 2;
  const rects = bars.map(b => `<rect x="${(b.x + off).toFixed(1)}" y="4" width="${b.w.toFixed(1)}" height="${height - 20}" fill="currentColor" />`).join('');

  return `<svg class="badge-barcode-svg" viewBox="0 0 ${totalW} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    ${rects}
    <text x="${(totalW / 2).toFixed(1)}" y="${height - 3}" text-anchor="middle" class="badge-barcode-txt">*${esc(clean)}*</text>
  </svg>`;
}

const BADGE_THEMES = ['gold', 'cyan', 'sapphire', 'emerald'];
const PHOTO_RE = /^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/i;

function getInitials(name, role) {
  const src = String(name || role || 'Advisor').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return src.slice(0, 2).toUpperCase() || 'AD';
}

export function badgeView(main) {
  document.body.classList.remove('reading');
  const prof = store.profile;
  const totalCompleted = store.completedIssuesCount;
  const D = data();
  const issueTotal = D?.issues?.length ?? 0;
  // Prefer the store getter; otherwise count the streak only if the last study day is today or yesterday.
  const streakDays = store.currentStreak ?? (() => {
    const s = store.all.streak, last = s?.days?.[s.days.length - 1];
    const today = new Date().toISOString().slice(0, 10), yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    return (last === today || last === yest) ? (s.count || 0) : 0;
  })();

  const initials = getInitials(prof.name, prof.role);
  const currentTheme = BADGE_THEMES.includes(prof.badgeTheme) ? prof.badgeTheme : 'gold';
  const photo = PHOTO_RE.test(prof.photo || '') ? prof.photo : '';
  const themeBtn = (t, label) => `<button type="button" class="theme-choice-btn${currentTheme === t ? ' on' : ''}" data-badge-theme="${t}" aria-pressed="${currentTheme === t}">
                      <span class="theme-swatch ${t}-swatch"></span>
                      <span>${label}</span>
                    </button>`;

  main.innerHTML = `<section class="screen screen-active badge-screen">
    <div class="screen-inner" style="max-width:1080px">
      <header class="view-head">
        <div>
          <h1 class="h-xl">Your badge</h1>
          <p class="lede">Your name, role and contact details for practice. Saved on this device only.</p>
        </div>
      </header>

      <div class="badge-workspace-grid">
        <!-- Badge preview -->
        <div class="badge-preview-column">
          <div class="badge-holder" id="badgeHolder">
            <div class="badge-card theme-${esc(currentTheme)}" id="badgeCard">
              <div class="badge-sheen" id="badgeSheen" aria-hidden="true"></div>

              <div class="badge-header">
                <div class="badge-brand">
                  <div class="badge-brand-glyph" id="badgeBrandGlyph" aria-hidden="true">
                    ${renderRoughCardLogo({ width: 30, height: 21, seed: 'badge-card-glyph' })}
                  </div>
                  <div class="badge-brand-text">
                    <span class="badge-corp">Cards Advisor</span>
                    <span class="badge-subcorp">Study badge, not a bank ID</span>
                  </div>
                </div>
              </div>

              <div class="badge-security-row">
                <div class="badge-emv-container" id="badgeEmvContainer" aria-hidden="true">
                  ${renderRoughBadgeChipSvg({ width: 44, height: 32, seed: 'badge-emv' })}
                </div>
              </div>

              <div class="badge-portrait-section">
                <div class="badge-photo-wrapper">
                  <div class="badge-photo-frame" id="badgePhotoFrame" style="${photo ? `background-image:url('${photo}');background-size:cover;background-position:center;` : ''}">
                    <span class="badge-monogram" id="badgeMonogram" ${photo ? 'hidden' : ''}>${esc(initials)}</span>
                  </div>
                </div>

                <div class="badge-id-titles">
                  <h2 class="badge-name" id="badgeNameDisp">${esc(prof.name || 'Authorized Advisor')}</h2>
                  <div class="badge-role-title" id="badgeRoleDisp">${esc(prof.role || 'Cards Resolution Specialist')}</div>
                  <div class="badge-emp-pill">
                    <span class="badge-emp-lbl">Employee ID</span>
                    <span class="badge-emp-code" id="badgeEmpDisp">${esc(prof.empNumber || 'EMP-84291')}</span>
                  </div>
                </div>
              </div>

              <div class="badge-details-grid">
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">Email</span>
                  <span class="b-cell-val" id="badgeEmailDisp">${esc(prof.email || 'advisor.cards@bank.internal')}</span>
                </div>
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">Phone</span>
                  <span class="b-cell-val" id="badgePhoneDisp">${esc(prof.phone || '+1 (555) 438-2900')}</span>
                </div>
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">Team</span>
                  <span class="b-cell-val" id="badgeDeptDisp">${esc(prof.dept || 'Frontline Cards & Escalation Desk')}</span>
                </div>
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">Location</span>
                  <span class="b-cell-val" id="badgeStationDisp">${esc(prof.station || 'Station 14 · Remote / Hub')}</span>
                </div>
              </div>

              <p class="badge-stat-line" style="position:relative;z-index:2;margin:0;font-size:12px;line-height:1.3;text-align:center;color:rgba(255,255,255,.72)">${totalCompleted} of ${issueTotal} issues done${streakDays > 0 ? `, ${streakDays}-day streak` : ''}</p>

              <div class="badge-barcode-container" id="badgeBarcodeContainer">
                ${renderBarcodeSvg(prof.empNumber || 'EMP-84291')}
              </div>
            </div>
          </div>
        </div>

        <!-- Editor -->
        <div class="badge-form-column">
          <div class="card-box badge-editor-card">
            <form class="badge-form" id="badgeForm" onsubmit="return false;">
              <div class="form-row two-col">
                <div class="form-field">
                  <label for="f_name">Name</label>
                  <input type="text" id="f_name" class="input" value="${esc(prof.name || 'Authorized Advisor')}" placeholder="e.g. Alex Vance" autocomplete="name" spellcheck="false">
                </div>

                <div class="form-field">
                  <label for="f_role">Role</label>
                  <input type="text" id="f_role" class="input" list="roleList" value="${esc(prof.role || 'Cards Resolution Specialist')}" placeholder="e.g. Cards advisor" autocomplete="off" spellcheck="false">
                  <datalist id="roleList">
                    <option value="Cards advisor"></option>
                    <option value="Senior advisor"></option>
                    <option value="Disputes"></option>
                    <option value="Retention"></option>
                    <option value="Team lead"></option>
                  </datalist>
                </div>
              </div>

              <div class="form-row two-col">
                <div class="form-field">
                  <label for="f_empNumber">Employee ID</label>
                  <input type="text" id="f_empNumber" class="input" value="${esc(prof.empNumber || 'EMP-84291')}" placeholder="e.g. EMP-84291" autocomplete="off" spellcheck="false">
                </div>

                <div class="form-field">
                  <label for="f_photoFile">Photo</label>
                  <div class="photo-ctrls">
                    <label class="btn sm sec photo-upload-btn" style="position:relative">
                      <span>Upload photo</span>
                      <input type="file" id="f_photoFile" class="vh-input" accept="image/*" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0">
                    </label>
                    <button type="button" class="gbtn ghost sm" id="clearPhotoBtn" ${!photo ? 'hidden' : ''}>Remove photo</button>
                  </div>
                  <span class="field-hint">Stays on this device.</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label id="badgeThemeLbl">Colour</label>
                  <div class="theme-picker" id="badgeThemePicker" role="group" aria-labelledby="badgeThemeLbl">
                    ${themeBtn('gold', 'Gold')}
                    ${themeBtn('cyan', 'Cyan')}
                    ${themeBtn('sapphire', 'Sapphire')}
                    ${themeBtn('emerald', 'Emerald')}
                  </div>
                </div>
              </div>

              <details class="badge-more">
                <summary>More details</summary>
                <div class="form-row two-col">
                  <div class="form-field">
                    <label for="f_email">Email</label>
                    <input type="email" id="f_email" class="input" value="${esc(prof.email || 'advisor.cards@bank.internal')}" placeholder="advisor@bank.internal" autocomplete="email" spellcheck="false">
                  </div>

                  <div class="form-field">
                    <label for="f_phone">Phone</label>
                    <input type="tel" id="f_phone" class="input" value="${esc(prof.phone || '+1 (555) 438-2900')}" placeholder="+1 (555) 438-2900" autocomplete="tel" spellcheck="false">
                  </div>
                </div>

                <div class="form-row two-col">
                  <div class="form-field">
                    <label for="f_dept">Team</label>
                    <input type="text" id="f_dept" class="input" value="${esc(prof.dept || 'Frontline Cards & Escalation Desk')}" placeholder="e.g. Cards disputes" autocomplete="off" spellcheck="false">
                  </div>

                  <div class="form-field">
                    <label for="f_station">Location</label>
                    <input type="text" id="f_station" class="input" value="${esc(prof.station || 'Station 14 · Remote / Hub')}" placeholder="e.g. Remote" autocomplete="off" spellcheck="false">
                  </div>
                </div>
              </details>

              <div class="badge-actions-bar">
                <button type="button" class="btn pri big" id="printBadgeBtn">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6V2h8v4M4 11h8v3H4v-3z" stroke="currentColor" stroke-width="1.4"/><path d="M3 6h10a1.5 1.5 0 011.5 1.5v3.5a1 1 0 01-1 1H2.5a1 1 0 01-1-1V7.5A1.5 1.5 0 013 6z" stroke="currentColor" stroke-width="1.4"/></svg>
                  <span>Print</span>
                </button>
                <span class="muted" id="badgeSaveStatus" role="status" aria-live="polite" style="font-size:13px">Saved on this device</span>
                <button type="button" class="gbtn ghost sm" id="resetBadgeBtn" style="margin-left:auto">Start over</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  /* Live preview and autosave */
  const card = document.getElementById('badgeCard');
  const sheen = document.getElementById('badgeSheen');
  const fEmpNumber = document.getElementById('f_empNumber');
  const fRole = document.getElementById('f_role');
  const fEmail = document.getElementById('f_email');
  const fPhone = document.getElementById('f_phone');
  const fName = document.getElementById('f_name');
  const fDept = document.getElementById('f_dept');
  const fStation = document.getElementById('f_station');

  const badgeEmpDisp = document.getElementById('badgeEmpDisp');
  const badgeRoleDisp = document.getElementById('badgeRoleDisp');
  const badgeEmailDisp = document.getElementById('badgeEmailDisp');
  const badgePhoneDisp = document.getElementById('badgePhoneDisp');
  const badgeNameDisp = document.getElementById('badgeNameDisp');
  const badgeDeptDisp = document.getElementById('badgeDeptDisp');
  const badgeStationDisp = document.getElementById('badgeStationDisp');
  const badgeBarcodeContainer = document.getElementById('badgeBarcodeContainer');
  const badgeMonogram = document.getElementById('badgeMonogram');
  const badgePhotoFrame = document.getElementById('badgePhotoFrame');
  const clearPhotoBtn = document.getElementById('clearPhotoBtn');
  const fPhotoFile = document.getElementById('f_photoFile');

  let activeTheme = currentTheme;
  let activePhoto = photo;

  function syncLive() {
    const emp = fEmpNumber.value.trim() || 'EMP-84291';
    const role = fRole.value.trim() || 'Cards Resolution Specialist';
    const email = fEmail.value.trim() || 'advisor.cards@bank.internal';
    const phone = fPhone.value.trim() || '+1 (555) 438-2900';
    const name = fName.value.trim() || 'Authorized Advisor';
    const dept = fDept.value.trim() || 'Frontline Cards & Escalation Desk';
    const station = fStation.value.trim() || 'Station 14 · Remote / Hub';

    badgeEmpDisp.textContent = emp;
    badgeRoleDisp.textContent = role;
    badgeEmailDisp.textContent = email;
    badgePhoneDisp.textContent = phone;
    badgeNameDisp.textContent = name;
    badgeDeptDisp.textContent = dept;
    badgeStationDisp.textContent = station;

    badgeMonogram.textContent = getInitials(name, role);
    badgeBarcodeContainer.innerHTML = renderBarcodeSvg(emp);

    store.setProfile({
      empNumber: emp,
      role,
      email,
      phone,
      name,
      dept,
      station,
      badgeTheme: activeTheme,
      photo: activePhoto
    });
  }

  [fEmpNumber, fRole, fEmail, fPhone, fName, fDept, fStation].forEach(input => {
    input.addEventListener('input', syncLive);
  });

  // Colour
  document.getElementById('badgeThemePicker')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-badge-theme]');
    if (!btn) return;
    activeTheme = btn.dataset.badgeTheme;
    document.querySelectorAll('.theme-choice-btn').forEach(b => { b.classList.toggle('on', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    card.className = `badge-card theme-${activeTheme}`;
    store.setProfile({ badgeTheme: activeTheme });
  });

  // Photo
  fPhotoFile?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 20 * 1024 * 1024) {
      toast({ msg: 'Choose an image under 20 MB', icon: '!' });
      fPhotoFile.value = '';
      return;
    }
    // Decode, cover-crop to 256x256 and re-encode as JPEG so the stored photo stays small.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const S = 256, c = document.createElement('canvas');
      c.width = c.height = S;
      const k = Math.max(S / img.naturalWidth, S / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
      c.getContext('2d').drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      URL.revokeObjectURL(url);
      const data = c.toDataURL('image/jpeg', 0.85);
      if (!PHOTO_RE.test(data)) {
        fPhotoFile.value = '';
        toast({ msg: 'That image could not be read', icon: '!' });
        return;
      }
      activePhoto = data;
      badgePhotoFrame.style.backgroundImage = `url('${activePhoto}')`;
      badgePhotoFrame.style.backgroundSize = 'cover';
      badgePhotoFrame.style.backgroundPosition = 'center';
      badgeMonogram.hidden = true;
      clearPhotoBtn.hidden = false;
      store.setProfile({ photo: activePhoto });
      toast({ msg: 'Photo added', icon: '✓' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      fPhotoFile.value = '';
      toast({ msg: 'That image could not be read', icon: '!' });
    };
    img.src = url;
  });

  clearPhotoBtn?.addEventListener('click', () => {
    activePhoto = '';
    badgePhotoFrame.style.backgroundImage = '';
    badgePhotoFrame.style.backgroundSize = '';
    badgePhotoFrame.style.backgroundPosition = '';
    badgeMonogram.hidden = false;
    clearPhotoBtn.hidden = true;
    fPhotoFile.value = '';
    store.setProfile({ photo: '' });
    toast({ msg: 'Photo removed', icon: '✓' });
  });

  // Print
  document.getElementById('printBadgeBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Start over
  document.getElementById('resetBadgeBtn')?.addEventListener('click', () => {
    if (!confirm('Clear your badge details?')) return;
    store.resetProfile();
    badgeView(main);
    toast({ msg: 'Badge cleared', icon: '✓' });
  });

  // Tilt and sheen on pointer movement
  if (card && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const onMove = e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = Math.max(-12, Math.min(12, ((y - centerY) / centerY) * -10));
      const rotateY = Math.max(-12, Math.min(12, ((x - centerX) / centerX) * 10));

      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      if (sheen) {
        sheen.style.opacity = '0.9';
        sheen.style.background = `radial-gradient(circle 240px at ${(x / rect.width * 100).toFixed(1)}% ${(y / rect.height * 100).toFixed(1)}%, rgba(255,255,255,0.22), rgba(76,201,240,0.18) 40%, rgba(229,184,105,0.15) 60%, transparent 80%)`;
      }
    };

    const onLeave = () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      if (sheen) sheen.style.opacity = '0';
    };

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
  }
}
