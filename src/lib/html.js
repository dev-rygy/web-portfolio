// Tiny HTML templating helper.
// `html` is a tagged template that escapes every interpolated value unless it is
// already safe (another `html` result or a `raw()` string). Arrays are joined.

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Mark a string as trusted HTML (e.g. rendered Markdown). */
export function raw(value) {
  return new SafeHtml(String(value ?? ''));
}

function renderValue(value) {
  if (value === null || value === undefined || value === false) return '';
  if (Array.isArray(value)) return value.map(renderValue).join('');
  if (value instanceof SafeHtml) return value.value;
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += renderValue(values[i]) + strings[i + 1];
  }
  return new SafeHtml(out);
}

/** Build a class attribute value from strings / falsy values. */
export function cx(...names) {
  return names.filter(Boolean).join(' ');
}
