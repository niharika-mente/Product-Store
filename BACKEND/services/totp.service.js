import crypto from "crypto";

// Time-based One-Time Password (TOTP) implementation following RFC 6238
// (built on HOTP / RFC 4226). Implemented with Node's crypto module so the 2FA
// feature carries no third-party dependency and is deterministically testable
// against the RFC test vectors.

// RFC 4648 base32 alphabet — the encoding authenticator apps expect for the
// shared secret.
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// Defaults match what Google Authenticator / Authy assume, so a secret works
// without the user tweaking anything.
const DEFAULT_STEP = 30; // seconds per code
const DEFAULT_DIGITS = 6;
const DEFAULT_ALGORITHM = "sha1";
// How many ±steps either side of "now" are accepted, to tolerate clock drift
// between the server and the user's device.
const DEFAULT_WINDOW = 1;

// Encodes a byte buffer to an unpadded RFC 4648 base32 string.
export const base32Encode = (buffer) => {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
};

// Decodes a base32 string back to a Buffer. Tolerates lowercase, whitespace and
// "=" padding (authenticator apps display secrets in grouped, mixed case) but
// rejects any character outside the alphabet so a malformed secret fails loudly
// instead of silently decoding to the wrong key.
export const base32Decode = (input) => {
  const cleaned = String(input).toUpperCase().replace(/\s/g, "").replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error("Invalid base32 character in secret");
    }
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

// Generates a cryptographically random base32 secret. 20 bytes (160 bits) is
// the size recommended by RFC 4226 for HMAC-SHA1.
export const generateSecret = (byteLength = 20) => base32Encode(crypto.randomBytes(byteLength));

// HOTP (RFC 4226): truncates an HMAC of the counter into a zero-padded code.
const hotp = (key, counter, digits, algorithm) => {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = crypto.createHmac(algorithm, key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, "0");
};

// Generates the TOTP code for a base32 secret at a given time (seconds since
// epoch; defaults to now).
export const generateTOTP = (
  secret,
  { time, step = DEFAULT_STEP, digits = DEFAULT_DIGITS, algorithm = DEFAULT_ALGORITHM } = {}
) => {
  const seconds = time ?? Math.floor(Date.now() / 1000);
  const counter = Math.floor(seconds / step);
  return hotp(base32Decode(secret), counter, digits, algorithm);
};

// Verifies a user-supplied token against the secret, scanning ±window steps to
// absorb clock drift. Rejects anything that isn't a digit string of the exact
// expected length, and compares in constant time to avoid leaking timing
// information about which step matched.
export const verifyTOTP = (
  token,
  secret,
  {
    time,
    step = DEFAULT_STEP,
    digits = DEFAULT_DIGITS,
    algorithm = DEFAULT_ALGORITHM,
    window = DEFAULT_WINDOW,
  } = {}
) => {
  if (token === undefined || token === null) return false;
  const normalized = String(token).trim();
  if (normalized.length !== digits || !/^\d+$/.test(normalized)) return false;

  const seconds = time ?? Math.floor(Date.now() / 1000);
  const counter = Math.floor(seconds / step);
  const key = base32Decode(secret);
  const provided = Buffer.from(normalized);

  for (let drift = -window; drift <= window; drift += 1) {
    const candidate = Buffer.from(hotp(key, counter + drift, digits, algorithm));
    if (candidate.length === provided.length && crypto.timingSafeEqual(candidate, provided)) {
      return true;
    }
  }
  return false;
};

// Builds the otpauth:// URI an authenticator app reads from a QR code.
export const buildOtpauthURL = ({
  secret,
  accountName,
  issuer = "Product-Store",
  digits = DEFAULT_DIGITS,
  period = DEFAULT_STEP,
  algorithm = DEFAULT_ALGORITHM,
}) => {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: algorithm.toUpperCase(),
    digits: String(digits),
    period: String(period),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
};
