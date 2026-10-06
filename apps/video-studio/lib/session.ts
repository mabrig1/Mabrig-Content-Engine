export const SESSION_COOKIE = 'mabrig_session';

export type SessionPayload = {
  sub: string;
  email: string;
  role: 'member' | 'premium' | 'admin';
  iat: number;
  exp: number;
};

function encodeBytes(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBytes(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function secret() {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET must be configured with at least 32 characters.');
  }
  return value;
}

async function hmacKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(
  input: Omit<SessionPayload, 'iat' | 'exp'>,
  ttlSeconds = 60 * 60 * 24 * 30,
) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...input,
    iat: now,
    exp: now + ttlSeconds,
  };
  const body = encodeBytes(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      'HMAC',
      await hmacKey(),
      new TextEncoder().encode(body),
    ),
  );
  return `${body}.${encodeBytes(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(),
      decodeBytes(signature),
      new TextEncoder().encode(body),
    );
    if (!ok) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBytes(body)),
    ) as SessionPayload;
    if (!payload.sub || !payload.email || !payload.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
