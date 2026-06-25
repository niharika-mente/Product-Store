import {
  base32Encode,
  base32Decode,
  generateSecret,
  generateTOTP,
  verifyTOTP,
  buildOtpauthURL,
} from "../services/totp.service.js";

// The RFC 6238 Appendix B reference seed for HMAC-SHA1, as base32 (what an
// authenticator app actually stores).
const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890"));

describe("base32 encoding", () => {
  it("round-trips arbitrary bytes", () => {
    const original = Buffer.from("12345678901234567890");
    expect(base32Decode(base32Encode(original))).toEqual(original);
  });

  it("tolerates lowercase, whitespace and padding when decoding", () => {
    const encoded = base32Encode(Buffer.from("hello-totp"));
    const messy = `  ${encoded.toLowerCase()}==  `;
    expect(base32Decode(messy)).toEqual(Buffer.from("hello-totp"));
  });

  it("throws on an invalid base32 character", () => {
    expect(() => base32Decode("ABC!189")).toThrow(/Invalid base32/);
  });
});

describe("generateTOTP — RFC 6238 SHA1 reference vectors", () => {
  // [unix time (s), expected 8-digit code]
  const vectors = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
    [20000000000, "65353130"],
  ];

  it.each(vectors)("at t=%i produces %s", (time, expected) => {
    expect(generateTOTP(RFC_SECRET, { time, digits: 8 })).toBe(expected);
  });

  it("derives the 6-digit code as the last 6 digits of the 8-digit code", () => {
    expect(generateTOTP(RFC_SECRET, { time: 59, digits: 6 })).toBe("287082");
  });
});

describe("verifyTOTP", () => {
  it("accepts the code generated for the same time step", () => {
    const time = 1_000_000;
    const code = generateTOTP(RFC_SECRET, { time });
    expect(verifyTOTP(code, RFC_SECRET, { time })).toBe(true);
  });

  it("accepts a code from an adjacent step (clock drift within the window)", () => {
    const code = generateTOTP(RFC_SECRET, { time: 1_000_000 });
    // Verify one full step (30s) later — still inside the default ±1 window.
    expect(verifyTOTP(code, RFC_SECRET, { time: 1_000_030 })).toBe(true);
  });

  it("rejects a code that has drifted beyond the window", () => {
    const code = generateTOTP(RFC_SECRET, { time: 1_000_000 });
    expect(verifyTOTP(code, RFC_SECRET, { time: 1_000_120 })).toBe(false);
  });

  it("rejects a wrong code", () => {
    expect(verifyTOTP("000000", RFC_SECRET, { time: 1_000_000 })).toBe(false);
  });

  it.each([null, undefined, "", "12ab56", "1234567", "abcdef"])(
    "rejects malformed input %p",
    (bad) => {
      expect(verifyTOTP(bad, RFC_SECRET, { time: 1_000_000 })).toBe(false);
    }
  );
});

describe("generateSecret", () => {
  it("returns a decodable base32 secret of the expected length", () => {
    const secret = generateSecret(20);
    // 20 bytes -> 32 base32 chars (unpadded).
    expect(secret).toHaveLength(32);
    expect(base32Decode(secret)).toHaveLength(20);
  });

  it("returns a different secret on each call", () => {
    expect(generateSecret()).not.toBe(generateSecret());
  });

  it("produces a secret that round-trips through generate/verify", () => {
    const secret = generateSecret();
    const time = 1_500_000;
    expect(verifyTOTP(generateTOTP(secret, { time }), secret, { time })).toBe(true);
  });
});

describe("buildOtpauthURL", () => {
  it("builds an otpauth:// URI carrying the secret and metadata", () => {
    const url = buildOtpauthURL({
      secret: RFC_SECRET,
      accountName: "user@example.com",
      issuer: "Product-Store",
    });

    expect(url.startsWith("otpauth://totp/")).toBe(true);
    expect(url).toContain(encodeURIComponent("Product-Store:user@example.com"));

    const query = new URLSearchParams(url.split("?")[1]);
    expect(query.get("secret")).toBe(RFC_SECRET);
    expect(query.get("issuer")).toBe("Product-Store");
    expect(query.get("algorithm")).toBe("SHA1");
    expect(query.get("digits")).toBe("6");
    expect(query.get("period")).toBe("30");
  });
});
