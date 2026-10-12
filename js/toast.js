// Glass toast — transient messages, and the "new version ready" prompt.
// Sits above the mobile tab bar and respects safe-area insets.

let host = null;

function ensureHost() {
  if (host) return host;
  host = document.createElement('div');
  host.className = 'toast-host';
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);
  return host;
}

/**
 * toast({ msg, action, onAction, secondary, onSecondary, timeout, id, icon })
 * timeout 0 keeps it until dismissed. Reusing an id replaces the existing toast.
 */
export function toast(opts = {}) {
  const { msg = '', action, onAction, secondary, onSecondary, timeout = 3200, id, icon } = opts;
  const h = ensureHost();

  if (id) h.querySelector(`[data-toast-id="${id}"]`)?.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  if (id) el.dataset.toastId = id;
  el.innerHTML = `
    ${icon ? `<span class="toast-icon">${icon}</span>` : ''}
    <span class="toast-msg"></span>
    ${secondary ? `<button class="toast-btn sec" data-sec>${secondary}</button>` : ''}
    ${action ? `<button class="toast-btn" data-act>${action}</button>` : ''}
    <button class="toast-x" aria-label="Dismiss">×</button>`;
  el.querySelector('.toast-msg').textContent = msg;

  const close = () => {
    el.classList.remove('in');
    setTimeout(() => el.remove(), 220);
  };

  el.querySelector('[data-act]')?.addEventListener('click', () => { onAction?.(el); });
  el.querySelector('[data-sec]')?.addEventListener('click', () => { onSecondary?.(); close(); });
  el.querySelector('.toast-x').addEventListener('click', close);

  h.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  if (timeout > 0) setTimeout(close, timeout);

  return { el, close, setMsg: t => { el.querySelector('.toast-msg').textContent = t; } };
}

export function dismissToast(id) {
  host?.querySelector(`[data-toast-id="${id}"]`)?.remove();
}
