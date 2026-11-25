const ALLOWED_LINK_FIELDS = ['title', 'url', 'category', 'description', 'tags', 'pinned', 'icon', 'date'];

/**
 * Validates that a URL uses an http: or https: scheme.
 * Prevents javascript:, data:, or vbscript: XSS payloads.
 */
function isValidHttpUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts only whitelisted link properties into a plain object.
 */
function sanitizeLinkInput(body) {
  const sanitized = {};
  if (!body || typeof body !== 'object') return sanitized;
  for (const field of ALLOWED_LINK_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  }
  return sanitized;
}

module.exports = {
  ALLOWED_LINK_FIELDS,
  isValidHttpUrl,
  sanitizeLinkInput
};
