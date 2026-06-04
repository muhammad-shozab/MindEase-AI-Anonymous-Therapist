/**
 * Google Drive OAuth scope for MindEase.
 */
/** Full Drive access — required to create folders. Bump SCOPE_VERSION if this changes. */
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

export const GOOGLE_DRIVE_SCOPE_VERSION = 'drive-full-v2';

export const googleDriveLoginOptions = {
  scope: GOOGLE_DRIVE_SCOPE,
  prompt: 'consent' as const,
};

/** Pre-configured Drive subfolder label (usually your Gmail). Set in .env */
export function getConfiguredDriveFolderEmail(): string | null {
  const value = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_EMAIL?.trim();
  if (!value || value === 'your_email@example.com') {
    return null;
  }
  return value.toLowerCase();
}

export function hasGoogleDriveClientId(): boolean {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return Boolean(clientId && clientId !== 'your_google_client_id_here');
}
