export interface SessionTokenResponse {
  token?: string;
  ok: boolean;
  error?: string;
}

export async function fetchLiveSessionToken(): Promise<string> {
  try {
    const res = await fetch('/api/session-token');
    if (!res.ok) {
      throw new Error(`Failed to obtain session token: HTTP ${res.status}`);
    }
    const data: SessionTokenResponse = await res.json();
    if (!data.ok || !data.token) {
      throw new Error(data.error || 'Server did not return a valid ephemeral Live token');
    }
    return data.token;
  } catch (err) {
    console.error('[AuthService] Error fetching session token:', err);
    throw err;
  }
}
