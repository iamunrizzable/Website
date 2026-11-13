// Where a login that started in the Hallie chat should come back to.
// Same-site page paths only: no scheme, no //host, and never an admin,
// API, auth or build path.
export function safeReturnPath(value) {
  if (typeof value !== 'string' || value.length > 200) return null;
  if (!/^\/(?!\/)[\w\-./]*$/.test(value)) return null;
  if (/^\/(admin|api|auth|_next)(\/|$)/.test(value)) return null;
  return value;
}
