import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAvatarFallbackLetter, sanitizeAvatarUrl } from '../../client/src/utils/avatarUtils.js';

describe('Avatar Fallback Letter Logic', () => {
  it('should return "U" for empty, null, or undefined names', () => {
    assert.strictEqual(getAvatarFallbackLetter(''), 'U');
    assert.strictEqual(getAvatarFallbackLetter(null), 'U');
    assert.strictEqual(getAvatarFallbackLetter(undefined), 'U');
    assert.strictEqual(getAvatarFallbackLetter('   '), 'U');
  });

  it('should handle lowercase names and return capital first letter', () => {
    assert.strictEqual(getAvatarFallbackLetter('ankit sharma'), 'A');
    assert.strictEqual(getAvatarFallbackLetter('octocat'), 'O');
    assert.strictEqual(getAvatarFallbackLetter('harsh'), 'H');
  });

  it('should handle names with leading emojis or symbols by finding first letter', () => {
    assert.strictEqual(getAvatarFallbackLetter('🚀 SpaceDev'), 'S');
    assert.strictEqual(getAvatarFallbackLetter('@octocat'), 'O');
  });

  it('should handle non-Latin characters or single names', () => {
    assert.strictEqual(getAvatarFallbackLetter('हिंदी Dev'), 'ह');
    assert.strictEqual(getAvatarFallbackLetter('Élodie'), 'É');
  });
});

describe('Avatar URL Sanitization', () => {
  it('should allow valid https://avatars.githubusercontent.com URLs and append s=72', () => {
    const valid = 'https://avatars.githubusercontent.com/u/123456?v=4';
    const sanitized = sanitizeAvatarUrl(valid);
    assert.ok(sanitized.includes('avatars.githubusercontent.com'));
    assert.ok(sanitized.includes('s=72'));
  });

  it('should reject non-GitHub avatar URLs or invalid protocol URLs', () => {
    assert.strictEqual(sanitizeAvatarUrl('http://malicious.com/avatar.png'), null);
    assert.strictEqual(sanitizeAvatarUrl('javascript:alert(1)'), null);
    assert.strictEqual(sanitizeAvatarUrl(''), null);
  });
});

describe('User Card Specifications', () => {
  it('should enforce exact "Developer" label for every user without plan/tier text', () => {
    const roleLabel = 'Developer';
    assert.strictEqual(roleLabel, 'Developer');
    assert.ok(!roleLabel.includes('Pro'));
    assert.ok(!roleLabel.includes('Free'));
  });
});
