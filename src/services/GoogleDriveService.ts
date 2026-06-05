// Enhanced Google Drive Service with proper OAuth and file management
import { GOOGLE_DRIVE_SCOPE_VERSION } from '../config/googleDrive';
import EncryptionService from './EncryptionService';
import { Session } from './StorageService';

interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  sessionId: string;
  therapistType: string;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private accessToken: string | null = null;
  private encryption = EncryptionService.getInstance();
  private readonly FOLDER_NAME = 'MindEase_Sessions';
  private readonly ROOT_FOLDER_STORAGE_KEY = 'mindease_drive_root_folder_id';
  private readonly EMAIL_FOLDER_MAP_KEY = 'mindease_drive_email_folder_map';
  private readonly TOKEN_SCOPE_VERSION_KEY = 'mindease_drive_scope_version';
  private folderId: string | null = null;

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('drive_token', token);
    localStorage.setItem(this.TOKEN_SCOPE_VERSION_KEY, GOOGLE_DRIVE_SCOPE_VERSION);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('drive_token');
    }
    return this.accessToken;
  }

  /** False if token missing or was issued before the current Drive scope. */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    if (localStorage.getItem(this.TOKEN_SCOPE_VERSION_KEY) !== GOOGLE_DRIVE_SCOPE_VERSION) {
      this.signOut();
      return false;
    }
    return true;
  }

  isInsufficientScopeError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('insufficient authentication scopes') ||
      lower.includes('insufficientpermissions') ||
      lower.includes('insufficient permissions')
    );
  }

  signOut() {
    this.accessToken = null;
    this.folderId = null;
    localStorage.removeItem('drive_token');
    localStorage.removeItem(this.TOKEN_SCOPE_VERSION_KEY);
    localStorage.removeItem(this.ROOT_FOLDER_STORAGE_KEY);
    localStorage.removeItem(this.EMAIL_FOLDER_MAP_KEY);
  }

  private getStoredRootFolderId(): string | null {
    return localStorage.getItem(this.ROOT_FOLDER_STORAGE_KEY);
  }

  private setStoredRootFolderId(id: string) {
    localStorage.setItem(this.ROOT_FOLDER_STORAGE_KEY, id);
  }

  private getEmailFolderMap(): Record<string, string> {
    try {
      const raw = localStorage.getItem(this.EMAIL_FOLDER_MAP_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  }

  private setEmailFolderId(emailKey: string, folderId: string) {
    const map = this.getEmailFolderMap();
    map[emailKey] = folderId;
    localStorage.setItem(this.EMAIL_FOLDER_MAP_KEY, JSON.stringify(map));
  }

  private async parseDriveError(response: Response, fallback: string): Promise<string> {
    try {
      const data = await response.json();
      const reason = data?.error?.errors?.[0]?.reason;
      const message = data?.error?.message as string | undefined;

      if (
        reason === 'accessNotConfigured' ||
        message?.includes('has not been used') ||
        message?.includes('is disabled') ||
        message?.includes('API has not been enabled')
      ) {
        return (
          'Google Drive API is not enabled for your OAuth project. In Google Cloud Console, open APIs & Services → Library, enable "Google Drive API", then try Save to Drive again.'
        );
      }

      if (message) {
        if (this.isInsufficientScopeError(message)) {
          this.signOut();
          return `${fallback}: Google needs updated Drive permission. Click Save to Drive again and approve access when sign-in opens.`;
        }
        if (response.status === 403) {
          return `${fallback}: ${message}`;
        }
        return `${fallback}: ${message}`;
      }

      if (response.status === 403) {
        return `${fallback} (403 Forbidden). Enable Google Drive API in Cloud Console, then try Save to Drive again.`;
      }
    } catch {
      // ignore JSON parse errors
    }
    return `${fallback} (${response.status} ${response.statusText})`;
  }

  private driveFetch(
    token: string,
    url: string,
    init?: RequestInit
  ): Promise<Response> {
    return fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  }

  private async isFolderAccessible(folderId: string): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,trashed,mimeType`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.mimeType === 'application/vnd.google-apps.folder' && data.trashed !== true;
  }

  private async createRootFolder(): Promise<string> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    const createResponse = await this.driveFetch(
      token,
      'https://www.googleapis.com/drive/v3/files?fields=id',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error(await this.parseDriveError(createResponse, 'Failed to create MindEase Drive folder'));
    }

    const createData = await createResponse.json();
    const folderId = this.requireDriveId(createData.id, 'Create MindEase folder');
    this.folderId = folderId;
    this.setStoredRootFolderId(folderId);
    return folderId;
  }

  // Create or get MindEase folder (drive.file scope: only app-created folders are writable)
  private async getMindEaseFolder(): Promise<string> {
    if (this.folderId) {
      return this.folderId;
    }

    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    const storedId = this.getStoredRootFolderId();
    if (storedId && (await this.isFolderAccessible(storedId))) {
      this.folderId = storedId;
      return storedId;
    }

    if (storedId) {
      localStorage.removeItem(this.ROOT_FOLDER_STORAGE_KEY);
    }

    return this.createRootFolder();
  }

  private requireDriveId(id: string | undefined | null, context: string): string {
    if (!id || typeof id !== 'string') {
      throw new Error(`${context}: Google Drive did not return a folder id. Use Save to Drive again and sign in with Google.`);
    }
    return id;
  }

  private escapeDriveQueryValue(value: string | undefined | null): string {
    if (value == null || typeof value !== 'string') {
      throw new Error('Invalid Drive path: missing folder or file name');
    }
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  private emailFolderKey(email: string): string {
    return email.trim().toLowerCase();
  }

  private async getOrCreateFolder(folderName: string, parentId: string): Promise<string> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    const emailKey = this.emailFolderKey(folderName);
    const cachedId = this.getEmailFolderMap()[emailKey];
    if (cachedId && (await this.isFolderAccessible(cachedId))) {
      return cachedId;
    }

    if (cachedId) {
      const map = this.getEmailFolderMap();
      delete map[emailKey];
      localStorage.setItem(this.EMAIL_FOLDER_MAP_KEY, JSON.stringify(map));
    }

    const createResponse = await this.driveFetch(
      token,
      'https://www.googleapis.com/drive/v3/files?fields=id',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error(await this.parseDriveError(createResponse, 'Failed to create export folder in Drive'));
    }

    const createData = await createResponse.json();
    const folderId = this.requireDriveId(createData.id, 'Create export folder');
    this.setEmailFolderId(emailKey, folderId);
    return folderId;
  }

  async uploadExportText(email: string, payload: string): Promise<{ fileName: string; folderName: string }> {
    const folderName = (email ?? '').trim().toLowerCase();
    if (!folderName) {
      throw new Error('Please enter an email address to label this export folder');
    }
    try {
      return await this.uploadExportTextOnce(folderName, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const shouldRetry =
        message.includes('403') ||
        message.includes('Forbidden') ||
        message.includes('permission');

      if (!shouldRetry) {
        throw error;
      }

      this.clearDriveFolderCache(folderName);
      return this.uploadExportTextOnce(folderName, payload, true);
    }
  }

  private clearDriveFolderCache(folderName?: string) {
    this.folderId = null;
    localStorage.removeItem(this.ROOT_FOLDER_STORAGE_KEY);
    if (folderName) {
      const map = this.getEmailFolderMap();
      delete map[this.emailFolderKey(folderName)];
      localStorage.setItem(this.EMAIL_FOLDER_MAP_KEY, JSON.stringify(map));
    } else {
      localStorage.removeItem(this.EMAIL_FOLDER_MAP_KEY);
    }
  }

  private async uploadExportTextOnce(
    folderName: string,
    payload: string,
    flatFallback = false
  ): Promise<{ fileName: string; folderName: string }> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    const rootFolderId = this.requireDriveId(
      await this.getMindEaseFolder(),
      'MindEase root folder'
    );

    const date = new Date().toISOString().split('T')[0];
    let parentId = rootFolderId;
    let fileName = `mindease-export-${date}.txt`;

    if (!flatFallback) {
      parentId = this.requireDriveId(
        await this.getOrCreateFolder(folderName, rootFolderId),
        'Export folder'
      );
    } else {
      const safeLabel = folderName.replace(/[^a-z0-9@._-]+/gi, '_');
      fileName = `mindease-export-${safeLabel}-${date}.txt`;
    }

    const metadata = {
      name: fileName,
      parents: [parentId],
      description: `MindEase chat export for ${folderName}`,
    };

    const file = new Blob([payload], { type: 'text/plain;charset=utf-8' });
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await this.driveFetch(
      token,
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(await this.parseDriveError(response, 'Failed to upload export to Drive'));
    }

    return { fileName, folderName: flatFallback ? 'MindEase_Sessions' : folderName };
  }

  /** Quick check that the token can talk to Drive (for diagnostics). */
  async verifyDriveAccess(): Promise<{ ok: true } | { ok: false; message: string }> {
    const token = this.getAccessToken();
    if (!token) {
      return { ok: false, message: 'Not signed in to Google Drive' };
    }

    try {
      const response = await this.driveFetch(
        token,
        'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota'
      );
      if (!response.ok) {
        return { ok: false, message: await this.parseDriveError(response, 'Drive access check failed') };
      }
      await this.getMindEaseFolder();
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Drive access check failed';
      return { ok: false, message };
    }
  }

  // Save session to Drive
  async saveSession(session: Session, sessionId: string): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    try {
      const folderId = await this.getMindEaseFolder();

      // Encrypt session data
      const key = this.encryption.deriveKey(sessionId);
      const sessionData = JSON.stringify(session);
      const encryptedData = this.encryption.encrypt(sessionData, key);

      // Create metadata
      const fileName = `session_${sessionId}.json`;
      const metadata = {
        name: fileName,
        parents: [folderId],
        description: `MindEase session - ${session.therapistType}`,
      };

      // Check if file exists
      const existingFile = await this.findFile(fileName);

      const file = new Blob([encryptedData], { type: 'application/json' });
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const url = existingFile
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const method = existingFile ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to save to Drive: ${response.statusText}`);
      }

      console.log('Session saved to Google Drive successfully');
    } catch (error) {
      console.error('Failed to save to Drive:', error);
      throw new Error('Failed to save session to Google Drive');
    }
  }

  // Load session from Drive
  async loadSession(sessionId: string): Promise<Session | null> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    try {
      const fileName = `session_${sessionId}.json`;
      const file = await this.findFile(fileName);

      if (!file) {
        return null;
      }

      // Download file content
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const encryptedData = await response.text();

      // Decrypt data
      const key = this.encryption.deriveKey(sessionId);
      const decryptedData = this.encryption.decrypt(encryptedData, key);

      return JSON.parse(decryptedData) as Session;
    } catch (error) {
      console.error('Failed to load from Drive:', error);
      return null;
    }
  }

  // List all sessions from Drive
  async listAllSessions(): Promise<DriveFile[]> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    try {
      const folderId = await this.getMindEaseFolder();

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,createdTime,modifiedTime,description)&orderBy=modifiedTime desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      return (data.files || [])
        .filter((file: { name?: string }) => typeof file.name === 'string' && file.name.startsWith('session_'))
        .map((file: { id: string; name: string; createdTime: string; modifiedTime: string; description?: string }) => {
          const sessionId = file.name.replace('session_', '').replace('.json', '');
          const therapistType = file.description?.split(' - ')[1] || 'unknown';

          return {
            id: file.id,
            name: file.name,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            sessionId,
            therapistType,
          };
        });
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  // Delete session from Drive
  async deleteSession(fileId: string): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete from Drive:', error);
      throw new Error('Failed to delete session from Google Drive');
    }
  }

  // Helper: Find file by name
  private async findFile(fileName: string): Promise<{ id: string; name: string } | null> {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const folderId = await this.getMindEaseFolder();
      const escapedName = this.escapeDriveQueryValue(fileName);
      const escapedParentId = this.escapeDriveQueryValue(folderId);
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${escapedName}' and '${escapedParentId}' in parents and trashed=false`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      return data.files && data.files.length > 0 ? data.files[0] : null;
    } catch (error) {
      console.error('Error finding file:', error);
      return null;
    }
  }
}

export default GoogleDriveService;
