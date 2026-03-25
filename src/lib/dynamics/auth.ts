/**
 * Dynamics 365 OAuth 2.0 client credentials token management.
 * Tokens are cached in memory and refreshed automatically on expiry.
 */

interface TokenCache {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let cache: TokenCache | null = null;

export async function getDynamicsToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cache && Date.now() < cache.expiresAt - 60_000) {
    return cache.accessToken;
  }

  const tenantId = process.env.DYNAMICS_TENANT_ID;
  const clientId = process.env.DYNAMICS_CLIENT_ID;
  const clientSecret = process.env.DYNAMICS_CLIENT_SECRET;
  const resource = process.env.DYNAMICS_RESOURCE;

  if (!tenantId || !clientId || !clientSecret || !resource) {
    throw new Error(
      "Missing Dynamics credentials. Set DYNAMICS_TENANT_ID, DYNAMICS_CLIENT_ID, DYNAMICS_CLIENT_SECRET, DYNAMICS_RESOURCE in .env.local"
    );
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: `${resource}/.default`,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dynamics token fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cache.accessToken;
}

export function clearTokenCache(): void {
  cache = null;
}
