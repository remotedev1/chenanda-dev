const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";
const isTestMode = process.env.PHONEPE_ENV === "test";

export const PHONEPE_HOST = isTestMode
  ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
  : "https://api.phonepe.com/apis/identity-manager";

// Cache token in memory to avoid fetching on every request
let cachedToken = null;
let tokenExpiry = null;

export async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }
  const url = `${PHONEPE_HOST}/v1/oauth/token`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      client_version: CLIENT_VERSION,
      grant_type: "client_credentials",
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get PhonePe access token: ${response.status}`);
  }

  const data = await response.json();

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken;
}
