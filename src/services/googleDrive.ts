/**
 * Minimal Google Drive v3 REST client for one JSON file in the hidden
 * appDataFolder. Docs: https://developers.google.com/drive/api/guides/appdata
 */
import { BACKUP_FILE_NAME } from '../constants/google';
import { discardAccessToken, getGoogleAccessToken } from './googleAuth';

const FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export type DriveFileInfo = {
  id: string;
  modifiedTime: string;
};

/** fetch() with a Google access token. Retries once with a new token after a 401. */
async function driveFetch(url: string, init: RequestInit = {}): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getGoogleAccessToken();
    const response = await fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
    if (response.status === 401 && attempt === 0) {
      await discardAccessToken(token);
      continue;
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Google Drive request failed (${response.status}). ${body.slice(0, 200)}`);
    }
    return response;
  }
  throw new Error('Google Drive rejected the sign-in. Please sign out and sign in again.');
}

export async function findBackupFile(): Promise<DriveFileInfo | null> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name = '${BACKUP_FILE_NAME}' and trashed = false`,
    fields: 'files(id, modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '1',
  });
  const response = await driveFetch(`${FILES_URL}?${params}`);
  const { files } = (await response.json()) as { files: DriveFileInfo[] };
  return files[0] ?? null;
}

/** Creates the backup file, or overwrites it if it already exists. */
export async function uploadBackupFile(contents: string): Promise<DriveFileInfo> {
  const existing = await findBackupFile();

  if (existing) {
    const response = await driveFetch(
      `${UPLOAD_URL}/${existing.id}?uploadType=media&fields=id,modifiedTime`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: contents,
      },
    );
    return (await response.json()) as DriveFileInfo;
  }

  const boundary = `taskbeacon-${Date.now()}`;
  const metadata = { name: BACKUP_FILE_NAME, parents: ['appDataFolder'] };
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    contents,
    `--${boundary}--`,
  ].join('\r\n');

  const response = await driveFetch(`${UPLOAD_URL}?uploadType=multipart&fields=id,modifiedTime`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  return (await response.json()) as DriveFileInfo;
}

export async function downloadFile(fileId: string): Promise<string> {
  const response = await driveFetch(`${FILES_URL}/${fileId}?alt=media`);
  return response.text();
}
