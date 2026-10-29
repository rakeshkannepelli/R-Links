const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

describe('RLINKS Backend Security & Logic Test Suite', () => {
  it('correctly hashes reset password tokens using SHA-256 and matches incoming tokens', () => {
    const rawResetToken = '1234567890abcdef1234567890abcdef';
    const storedHashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // Simulate incoming token from password reset link
    const incomingToken = '1234567890abcdef1234567890abcdef';
    const computedHash = crypto.createHash('sha256').update(incomingToken).digest('hex');

    assert.strictEqual(computedHash, storedHashedToken);

    // Tampered token must fail
    const tamperedToken = '0000000000abcdef1234567890abcdef';
    const tamperedHash = crypto.createHash('sha256').update(tamperedToken).digest('hex');
    assert.notStrictEqual(tamperedHash, storedHashedToken);
  });

  it('supports backward compatibility matching for both raw legacy tokens and SHA-256 hashed tokens', () => {
    const legacyRawToken = 'abc123legacytoken';
    const modernRawToken = 'def456moderntoken';
    const modernHashedToken = crypto.createHash('sha256').update(modernRawToken).digest('hex');

    // Mock query logic from routes/auth.js:
    // $or: [{ resetPasswordToken: hashedToken }, { resetPasswordToken: token }]
    const matchToken = (incoming, storedInDb) => {
      const incomingHash = crypto.createHash('sha256').update(incoming).digest('hex');
      return storedInDb === incomingHash || storedInDb === incoming;
    };

    assert.strictEqual(matchToken(legacyRawToken, legacyRawToken), true);
    assert.strictEqual(matchToken(modernRawToken, modernHashedToken), true);
    assert.strictEqual(matchToken('wrongtoken', modernHashedToken), false);
  });

  it('safely sorts links chronologically even when date fields are missing or strings', () => {
    const mockLinks = [
      { id: '1', title: 'Old Link', date: '2023-01-01T00:00:00.000Z' },
      { id: '2', title: 'Newest Link', date: '2026-05-01T00:00:00.000Z' },
      { id: '3', title: 'Corrupted Date Link', date: null },
      { id: '4', title: 'Mid Link', date: '2025-01-01T00:00:00.000Z' }
    ];

    const sorted = [...mockLinks].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

    assert.strictEqual(sorted[0].id, '2'); // Newest first
    assert.strictEqual(sorted[1].id, '4'); // Mid
    assert.strictEqual(sorted[2].id, '1'); // Old
    assert.strictEqual(sorted[3].id, '3'); // Corrupted / null date last
  });

  it('validates operator ID regex escaping to prevent RegExp injection & collision', () => {
    const rawOperator = 'operator[test]+';
    const escaped = rawOperator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escaped}$`, 'i');

    assert.strictEqual(regex.test('operator[test]+'), true);
    assert.strictEqual(regex.test('OPERATOR[TEST]+'), true);
    // Malicious attempt to match unexpected string via regex injection must fail
    assert.strictEqual(regex.test('operator123'), false);
  });

  it('resolves account query whether operator ID or email is supplied', () => {
    const mockUsers = [
      { operatorId: 'rakesh', email: 'rakeshkannepelli@gmail.com' },
      { operatorId: 'Bhanu', email: 'bhanu@test.com' }
    ];

    const findUser = (input) => {
      const clean = input.trim();
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`^${escaped}$`, 'i');
      return mockUsers.find(u => u.email === clean.toLowerCase() || reg.test(u.operatorId));
    };

    assert.strictEqual(findUser('rakesh')?.email, 'rakeshkannepelli@gmail.com');
    assert.strictEqual(findUser('RAKESH')?.email, 'rakeshkannepelli@gmail.com');
    assert.strictEqual(findUser('rakeshkannepelli@gmail.com')?.operatorId, 'rakesh');
    assert.strictEqual(findUser('nonexistent'), undefined);
  });

  it('verifies bcrypt password hashing and verification', async () => {
    const password = 'SuperSecretVaultPassphrase123!';
    const hash = await bcrypt.hash(password, 8);

    assert.notStrictEqual(password, hash);
    const isMatch = await bcrypt.compare(password, hash);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(isWrongMatch, false);
  });
});
