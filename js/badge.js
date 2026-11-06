// Advisor Employee ID & Authorization Badge View.
// Displays an authentic physical/digital liquid-glass employee badge
// paired with a real-time credential editor. All data persists locally.
import { store } from './store.js';
import { esc } from './render.js';
import { toast } from './toast.js';
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

  const totalW = Math.max(x + 12, width);
  const rects = bars.map(b => `<rect x="${b.x.toFixed(1)}" y="4" width="${b.w.toFixed(1)}" height="${height - 20}" fill="currentColor" />`).join('');

  return `<svg class="badge-barcode-svg" viewBox="0 0 ${totalW} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    ${rects}
    <text x="${(totalW / 2).toFixed(1)}" y="${height - 3}" text-anchor="middle" class="badge-barcode-txt">*${esc(clean)}*</text>
  </svg>`;
}

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
  const streakDays = store.all.streak?.count || 0;
  const debriefCount = store.all.debriefs?.length || 0;
  const dueCards = Object.values(store.all.cards || {}).filter(c => !c.due || c.due <= Date.now()).length;

  const initials = getInitials(prof.name, prof.role);
  const currentTheme = prof.badgeTheme || 'gold';

  main.innerHTML = `<section class="screen screen-active badge-screen">
    <div class="screen-inner" style="max-width:1080px">
      <header class="view-head">
        <div>
          <span class="kicker">Security Credential · Frontline Authorization</span>
          <h1 class="h-xl">Advisor ID &amp; Employee Badge</h1>
          <p class="lede">Your operational identification, direct frontline contact routing, and policy authority tier. Tied to your local training record on this device.</p>
        </div>
      </header>

      <div class="badge-workspace-grid">
        <!-- ═════════ LEFT: Physical/Digital Employee Badge ═════════ -->
        <div class="badge-preview-column">
          <div class="badge-lanyard-assembly" aria-hidden="true">
            <div class="badge-lanyard-strap"></div>
            <div class="badge-clip-bracket">
              <div class="badge-clip-rivet"></div>
              <div class="badge-clip-metal"></div>
            </div>
          </div>

          <div class="badge-holder" id="badgeHolder">
            <div class="badge-slot-hole" aria-hidden="true"></div>

            <div class="badge-card theme-${esc(currentTheme)}" id="badgeCard">
              <div class="badge-sheen" id="badgeSheen" aria-hidden="true"></div>

              <!-- Header banner -->
              <div class="badge-header">
                <div class="badge-brand">
                  <div class="badge-brand-glyph" id="badgeBrandGlyph">
                    ${renderRoughCardLogo({ width: 30, height: 21, seed: 'badge-card-glyph' })}
                  </div>
                  <div class="badge-brand-text">
                    <span class="badge-corp">BANK CARDS OPERATIONS</span>
                    <span class="badge-subcorp">Resolution Desk · Credential</span>
                  </div>
                </div>
                <div class="badge-status-pill">
                  <span class="badge-status-dot"></span>
                  <span class="badge-status-text">ACTIVE</span>
                </div>
              </div>

              <!-- Chip & Hologram security row -->
              <div class="badge-security-row">
                <div class="badge-emv-container" id="badgeEmvContainer" title="Smart Access Chip">
                  ${renderRoughBadgeChipSvg({ width: 44, height: 32, seed: 'badge-emv' })}
                </div>
                <div class="badge-nfc-indicator" title="Contactless RFID">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M7 6C9.5 7.5 11 10 11 12.5C11 15 9.5 17.5 7 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 4C15.5 6 17.5 9 17.5 12.5C17.5 16 15.5 19 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M17 2C21.5 4.5 24 8 24 12.5C24 17 21.5 20.5 17 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="badge-seal">
                  <span>SECURE · VERIFIED</span>
                </div>
              </div>

              <!-- Advisor Portrait & Name Section -->
              <div class="badge-portrait-section">
                <div class="badge-photo-wrapper">
                  <div class="badge-photo-frame" id="badgePhotoFrame" style="${prof.photo ? `background-image:url(${prof.photo});background-size:cover;background-position:center;` : ''}">
                    <span class="badge-monogram" id="badgeMonogram" ${prof.photo ? 'hidden' : ''}>${esc(initials)}</span>
                  </div>
                  <span class="badge-verified-badge" title="Identity Verified">✓</span>
                </div>

                <div class="badge-id-titles">
                  <h2 class="badge-name" id="badgeNameDisp">${esc(prof.name || 'Authorized Advisor')}</h2>
                  <div class="badge-role-title" id="badgeRoleDisp">${esc(prof.role || 'Cards Resolution Specialist')}</div>
                  <div class="badge-emp-pill">
                    <span class="badge-emp-lbl">EMPLOYEE ID</span>
                    <span class="badge-emp-code" id="badgeEmpDisp">${esc(prof.empNumber || 'EMP-84291')}</span>
                  </div>
                </div>
              </div>

              <!-- Key Credentials Grid -->
              <div class="badge-details-grid">
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">DIRECT EMAIL</span>
                  <span class="b-cell-val" id="badgeEmailDisp">${esc(prof.email || 'advisor.cards@bank.internal')}</span>
                </div>
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">PHONE / EXT</span>
                  <span class="b-cell-val" id="badgePhoneDisp">${esc(prof.phone || '+1 (555) 438-2900')}</span>
                </div>
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">DEPARTMENT</span>
                  <span class="b-cell-val" id="badgeDeptDisp">${esc(prof.dept || 'Frontline Cards & Escalation Desk')}</span>
                </div>
                <div class="badge-detail-cell">
                  <span class="b-cell-lbl">STATION</span>
                  <span class="b-cell-val" id="badgeStationDisp">${esc(prof.station || 'Station 14 · Remote / Hub')}</span>
                </div>
              </div>

              <!-- Clearance Tier Banner -->
              <div class="badge-clearance-bar">
                <span class="b-clearance-shield">🛡</span>
                <span class="b-clearance-txt" id="badgeClearanceDisp">${esc(prof.clearance || 'Tier 2 — Cards Policy & Fee Authority')}</span>
              </div>

              <!-- Live Cards Advisor Mastery Strip -->
              <div class="badge-stats-row" title="Live training statistics from this device">
                <div class="b-stat-chip">
                  <span class="b-stat-num">${totalCompleted}/44</span>
                  <span class="b-stat-lbl">Mastered</span>
                </div>
                <div class="b-stat-chip">
                  <span class="b-stat-num">${streakDays}d</span>
                  <span class="b-stat-lbl">Streak</span>
                </div>
                <div class="b-stat-chip">
                  <span class="b-stat-num">${dueCards}</span>
                  <span class="b-stat-lbl">Cards Due</span>
                </div>
                <div class="b-stat-chip">
                  <span class="b-stat-num">${debriefCount}</span>
                  <span class="b-stat-lbl">Debriefs</span>
                </div>
              </div>

              <!-- Bottom Barcode & Security Strip -->
              <div class="badge-barcode-container" id="badgeBarcodeContainer">
                ${renderBarcodeSvg(prof.empNumber || 'EMP-84291')}
              </div>
            </div>
          </div>

          <div class="badge-hint-bar">
            <span>Tilt badge to inspect liquid-glass holographic sheen</span>
          </div>
        </div>

        <!-- ═════════ RIGHT: Credential Editor Form ═════════ -->
        <div class="badge-form-column">
          <div class="card-box badge-editor-card">
            <div class="badge-editor-head">
              <div>
                <h2 class="h-md" style="margin:0 0 4px">Employee Credential Profile</h2>
                <p class="muted" style="font-size:13px;margin:0">Set your advisor badge identification, frontline contact routing, and role authority level.</p>
              </div>
            </div>

            <form class="badge-form" id="badgeForm" onsubmit="return false;">
              <!-- 1. Employee Number & Role -->
              <div class="form-row two-col">
                <div class="form-field">
                  <label for="f_empNumber">Employee Number <span class="req">*</span></label>
                  <input type="text" id="f_empNumber" class="input" value="${esc(prof.empNumber || 'EMP-84291')}" placeholder="e.g. EMP-84291" autocomplete="off" spellcheck="false" required>
                  <span class="field-hint">Generates the scannable barcode at the badge base.</span>
                </div>

                <div class="form-field">
                  <label for="f_role">Role Title <span class="req">*</span></label>
                  <input type="text" id="f_role" class="input" value="${esc(prof.role || 'Cards Resolution Specialist')}" placeholder="e.g. Cards Resolution Specialist" autocomplete="off" spellcheck="false" required>
                  <span class="field-hint">Your operational designation and call role.</span>
                </div>
              </div>

              <!-- Quick Role Presets -->
              <div class="role-presets-wrap">
                <span class="presets-lbl">Quick Role Suggestions:</span>
                <div class="role-presets" id="rolePresets">
                  <button type="button" class="preset-chip" data-preset-role="Cards Resolution Specialist">Resolution Specialist</button>
                  <button type="button" class="preset-chip" data-preset-role="Tier-2 Frontline Escalation Lead">Escalation Lead</button>
                  <button type="button" class="preset-chip" data-preset-role="Disputes &amp; Chargeback Analyst">Disputes Analyst</button>
                  <button type="button" class="preset-chip" data-preset-role="Senior Credit Risk &amp; Retention Advisor">Retention Advisor</button>
                  <button type="button" class="preset-chip" data-preset-role="Operations &amp; Compliance Lead">Operations Lead</button>
                </div>
              </div>

              <!-- 2. Email & Phone -->
              <div class="form-row two-col">
                <div class="form-field">
                  <label for="f_email">Direct Email Address <span class="req">*</span></label>
                  <input type="email" id="f_email" class="input" value="${esc(prof.email || 'advisor.cards@bank.internal')}" placeholder="advisor@bank.internal" autocomplete="email" spellcheck="false" required>
                  <span class="field-hint">Routing contact for escalations and case transfers.</span>
                </div>

                <div class="form-field">
                  <label for="f_phone">Phone / Direct Extension <span class="req">*</span></label>
                  <input type="tel" id="f_phone" class="input" value="${esc(prof.phone || '+1 (555) 438-2900')}" placeholder="+1 (555) 438-2900" autocomplete="tel" spellcheck="false" required>
                  <span class="field-hint">Internal softphone line or desk extension.</span>
                </div>
              </div>

              <!-- 3. Full Name & Department -->
              <div class="form-row two-col">
                <div class="form-field">
                  <label for="f_name">Advisor Full Name</label>
                  <input type="text" id="f_name" class="input" value="${esc(prof.name || 'Authorized Advisor')}" placeholder="e.g. Alex Vance" autocomplete="name" spellcheck="false">
                </div>

                <div class="form-field">
                  <label for="f_dept">Department / Line of Business</label>
                  <input type="text" id="f_dept" class="input" value="${esc(prof.dept || 'Frontline Cards & Escalation Desk')}" placeholder="e.g. Cards Dispute & Tier-2 Escalations" autocomplete="off" spellcheck="false">
                </div>
              </div>

              <!-- 4. Station & Clearance -->
              <div class="form-row two-col">
                <div class="form-field">
                  <label for="f_station">Station / Hub Location</label>
                  <input type="text" id="f_station" class="input" value="${esc(prof.station || 'Station 14 · Remote / Hub')}" placeholder="e.g. Station 14 · Remote / Hub" autocomplete="off" spellcheck="false">
                </div>

                <div class="form-field">
                  <label for="f_clearance">Clearance &amp; Policy Authority Tier</label>
                  <select id="f_clearance" class="input select">
                    <option value="Tier 1 — Frontline Client Care &amp; Card Activation" ${prof.clearance?.startsWith('Tier 1') ? 'selected' : ''}>Tier 1 — Frontline Client Care &amp; Card Activation</option>
                    <option value="Tier 2 — Cards Policy &amp; Fee Authority" ${(!prof.clearance || prof.clearance?.startsWith('Tier 2')) ? 'selected' : ''}>Tier 2 — Cards Policy &amp; Fee Authority (Default)</option>
                    <option value="Tier 3 — Escalations, Emergency Unblock &amp; Chargebacks" ${prof.clearance?.startsWith('Tier 3') ? 'selected' : ''}>Tier 3 — Escalations, Emergency Unblock &amp; Chargebacks</option>
                    <option value="Tier 4 — Operations Lead &amp; Regulatory Compliance" ${prof.clearance?.startsWith('Tier 4') ? 'selected' : ''}>Tier 4 — Operations Lead &amp; Regulatory Compliance</option>
                  </select>
                </div>
              </div>

              <!-- 5. Badge Accent Theme & Photo -->
              <div class="form-row two-col">
                <div class="form-field">
                  <label>Badge Accent Theme</label>
                  <div class="theme-picker" id="badgeThemePicker">
                    <button type="button" class="theme-choice-btn${currentTheme === 'gold' ? ' on' : ''}" data-badge-theme="gold" title="Midnight Sapphire &amp; Burnished Gold">
                      <span class="theme-swatch gold-swatch"></span>
                      <span>Gold</span>
                    </button>
                    <button type="button" class="theme-choice-btn${currentTheme === 'cyan' ? ' on' : ''}" data-badge-theme="cyan" title="Electric Cobalt &amp; Arctic Cyan">
                      <span class="theme-swatch cyan-swatch"></span>
                      <span>Cyan</span>
                    </button>
                    <button type="button" class="theme-choice-btn${currentTheme === 'sapphire' ? ' on' : ''}" data-badge-theme="sapphire" title="Deep Obsidian &amp; Royal Sapphire">
                      <span class="theme-swatch sapphire-swatch"></span>
                      <span>Sapphire</span>
                    </button>
                    <button type="button" class="theme-choice-btn${currentTheme === 'emerald' ? ' on' : ''}" data-badge-theme="emerald" title="Dark Forest &amp; Jade Gold">
                      <span class="theme-swatch emerald-swatch"></span>
                      <span>Emerald</span>
                    </button>
                  </div>
                </div>

                <div class="form-field">
                  <label>Advisor Portrait Photo</label>
                  <div class="photo-ctrls">
                    <label class="btn sm sec photo-upload-btn">
                      <span>Upload Photo</span>
                      <input type="file" id="f_photoFile" accept="image/*" hidden>
                    </label>
                    <button type="button" class="btn sm ghost" id="clearPhotoBtn" ${!prof.photo ? 'hidden' : ''}>Remove Photo</button>
                  </div>
                  <span class="field-hint">Compressed and kept strictly in local storage on this device.</span>
                </div>
              </div>

              <!-- Actions Toolbar -->
              <div class="badge-actions-bar">
                <button type="button" class="btn pri big" id="saveBadgeBtn">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 3h8l2 2v8H3V3z" stroke="currentColor" stroke-width="1.5"/><path d="M6 3v4h4V3M5 13v-4h6v4" stroke="currentColor" stroke-width="1.4"/></svg>
                  <span>Save Credential</span>
                </button>
                <button type="button" class="btn sec big" id="printBadgeBtn" title="Print physical badge card at standard ID card dimensions">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 6V2h8v4M4 11h8v3H4v-3z" stroke="currentColor" stroke-width="1.4"/><path d="M3 6h10a1.5 1.5 0 011.5 1.5v3.5a1 1 0 01-1 1H2.5a1 1 0 01-1-1V7.5A1.5 1.5 0 013 6z" stroke="currentColor" stroke-width="1.4"/></svg>
                  <span>Print Badge</span>
                </button>
                <button type="button" class="btn ghost sm" id="resetBadgeBtn" style="margin-left:auto">Reset to Demo</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  /* ═════════ Interactive Event Bindings & Live Preview ═════════ */
  const card = document.getElementById('badgeCard');
  const sheen = document.getElementById('badgeSheen');
  const fEmpNumber = document.getElementById('f_empNumber');
  const fRole = document.getElementById('f_role');
  const fEmail = document.getElementById('f_email');
  const fPhone = document.getElementById('f_phone');
  const fName = document.getElementById('f_name');
  const fDept = document.getElementById('f_dept');
  const fStation = document.getElementById('f_station');
  const fClearance = document.getElementById('f_clearance');

  const badgeEmpDisp = document.getElementById('badgeEmpDisp');
  const badgeRoleDisp = document.getElementById('badgeRoleDisp');
  const badgeEmailDisp = document.getElementById('badgeEmailDisp');
  const badgePhoneDisp = document.getElementById('badgePhoneDisp');
  const badgeNameDisp = document.getElementById('badgeNameDisp');
  const badgeDeptDisp = document.getElementById('badgeDeptDisp');
  const badgeStationDisp = document.getElementById('badgeStationDisp');
  const badgeClearanceDisp = document.getElementById('badgeClearanceDisp');
  const badgeBarcodeContainer = document.getElementById('badgeBarcodeContainer');
  const badgeMonogram = document.getElementById('badgeMonogram');
  const badgePhotoFrame = document.getElementById('badgePhotoFrame');
  const clearPhotoBtn = document.getElementById('clearPhotoBtn');
  const fPhotoFile = document.getElementById('f_photoFile');

  let activeTheme = currentTheme;
  let activePhoto = prof.photo || '';

  function syncLive() {
    const emp = fEmpNumber.value.trim() || 'EMP-84291';
    const role = fRole.value.trim() || 'Cards Resolution Specialist';
    const email = fEmail.value.trim() || 'advisor.cards@bank.internal';
    const phone = fPhone.value.trim() || '+1 (555) 438-2900';
    const name = fName.value.trim() || 'Authorized Advisor';
    const dept = fDept.value.trim() || 'Frontline Cards & Escalation Desk';
    const station = fStation.value.trim() || 'Station 14 · Remote / Hub';
    const clearance = fClearance.value || 'Tier 2 — Cards Policy & Fee Authority';

    badgeEmpDisp.textContent = emp;
    badgeRoleDisp.textContent = role;
    badgeEmailDisp.textContent = email;
    badgePhoneDisp.textContent = phone;
    badgeNameDisp.textContent = name;
    badgeDeptDisp.textContent = dept;
    badgeStationDisp.textContent = station;
    badgeClearanceDisp.textContent = clearance;

    // Recalculate initials
    badgeMonogram.textContent = getInitials(name, role);

    // Redraw vector barcode
    badgeBarcodeContainer.innerHTML = renderBarcodeSvg(emp);

    // Save debounced to store
    store.setProfile({
      empNumber: emp,
      role,
      email,
      phone,
      name,
      dept,
      station,
      clearance,
      badgeTheme: activeTheme,
      photo: activePhoto
    });
  }

  // Live input synchronization
  [fEmpNumber, fRole, fEmail, fPhone, fName, fDept, fStation].forEach(input => {
    input.addEventListener('input', syncLive);
  });
  fClearance.addEventListener('change', syncLive);

  // Quick Role Presets
  document.getElementById('rolePresets')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-preset-role]');
    if (!btn) return;
    fRole.value = btn.dataset.presetRole;
    syncLive();
    toast({ msg: `Role set to ${btn.dataset.presetRole}`, icon: '◆' });
  });

  // Badge Theme Selection
  document.getElementById('badgeThemePicker')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-badge-theme]');
    if (!btn) return;
    activeTheme = btn.dataset.badgeTheme;
    document.querySelectorAll('.theme-choice-btn').forEach(b => b.classList.toggle('on', b === btn));
    card.className = `badge-card theme-${activeTheme}`;
    store.setProfile({ badgeTheme: activeTheme });
  });

  // Photo Upload
  fPhotoFile?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ msg: 'Please select an image under 2MB', icon: '!' });
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      activePhoto = ev.target.result;
      badgePhotoFrame.style.backgroundImage = `url(${activePhoto})`;
      badgePhotoFrame.style.backgroundSize = 'cover';
      badgePhotoFrame.style.backgroundPosition = 'center';
      badgeMonogram.hidden = true;
      clearPhotoBtn.hidden = false;
      store.setProfile({ photo: activePhoto });
      toast({ msg: 'Advisor portrait photo updated', icon: '✓' });
    };
    reader.readAsDataURL(file);
  });

  clearPhotoBtn?.addEventListener('click', () => {
    activePhoto = '';
    badgePhotoFrame.style.backgroundImage = 'none';
    badgeMonogram.hidden = false;
    clearPhotoBtn.hidden = true;
    fPhotoFile.value = '';
    store.setProfile({ photo: '' });
    toast({ msg: 'Photo removed, reverted to monogram initials', icon: '✓' });
  });

  // Save Button
  document.getElementById('saveBadgeBtn')?.addEventListener('click', () => {
    syncLive();
    toast({ msg: 'Advisor badge profile saved successfully', icon: '✓' });
  });

  // Print Button
  document.getElementById('printBadgeBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Reset to Demo
  document.getElementById('resetBadgeBtn')?.addEventListener('click', () => {
    if (!confirm('Reset credential badge to demo defaults?')) return;
    store.resetProfile();
    badgeView(main);
    toast({ msg: 'Credential badge reset to default demo values', icon: '✓' });
  });

  // 3D Tilt & Holographic liquid-glass sheen on card pointer movement
  if (card) {
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
