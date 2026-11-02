const STORAGE_KEY = "fyp_pending_email";

export function rememberPendingEmail(email: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, email);
  } catch {}
}

export function readPendingEmail() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}
