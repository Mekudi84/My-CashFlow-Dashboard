/**
 * Password hashing via PBKDF2 (Web Crypto).
 *
 * Why PBKDF2 over argon2/bcrypt: zero native dependencies, works identically
 * in Node 20, the Edge runtime, and Cloudflare Workers. OWASP recommends
 * PBKDF2-HMAC-SHA256 with >= 600,000 iterations for password storage
 * (NIST SP 800-132). We use 600,000 iterations and a 32-byte salt.
 *
 * The encoded format is `pbkdf2-sha256$<iter>$<base64-salt>$<base64-hash>` so
 * we can rotate to a stronger algorithm later by prefixing `argon2id$...`
 * and dispatching on the prefix.
 */
const ALGO = "PBKDF2";
const HASH = "SHA-256";
const ITERATIONS = 600_000;
const KEYLEN = 32;
const SALT_BYTES = 16;

const enc = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}
function fromBase64(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64"));
}

async function deriveBits(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    ALGO,
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: ALGO, salt, iterations: ITERATIONS, hash: HASH },
    key,
    KEYLEN * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt);
  return `pbkdf2-sha256$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 100_000) return false;
  const salt = fromBase64(parts[2] ?? "");
  const expected = fromBase64(parts[3] ?? "");
  const actual = await deriveBits(password, salt);
  // constant-time compare
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= (expected[i] ?? 0) ^ (actual[i] ?? 0);
  }
  return diff === 0;
}