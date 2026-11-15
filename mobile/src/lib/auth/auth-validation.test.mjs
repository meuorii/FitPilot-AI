import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticatedDestination, onboardingBaselineKey, validateAboutYou, validateLogin, validateRegistration } from './auth-validation.ts';

test('login normalizes email and requires a password', () => {
  assert.deepEqual(validateLogin('  PERSON@Example.com ', 'secret'), {
    email: 'person@example.com', errors: { email: '', password: '' },
  });
  assert.equal(validateLogin('bad-email', '').errors.email, 'Enter a valid email address.');
  assert.equal(validateLogin('person@example.com', '').errors.password, 'Enter your password.');
});

test('registration trims name and email but preserves password characters', () => {
  const valid = validateRegistration('  Alex Runner  ', ' ALEX@EXAMPLE.COM ', ' pass word ', ' pass word ');
  assert.equal(valid.fullName, 'Alex Runner');
  assert.equal(valid.email, 'alex@example.com');
  assert.equal(valid.errors.password, '');
  assert.equal(valid.errors.confirmation, '');

  const invalid = validateRegistration(' ', 'alex@', 'short', 'different');
  assert.equal(invalid.errors.fullName, 'Enter your name.');
  assert.equal(invalid.errors.password, 'Use at least 8 characters.');
  assert.equal(invalid.errors.confirmation, 'Passwords do not match.');
});

test('about-you accepts documented numeric boundaries and backend enums', () => {
  const base = { age: '13', gender: 'female', height_cm: '100', weight_kg: '30', activity_level: 'sedentary' };
  const result = validateAboutYou(base);
  assert.deepEqual(result.payload, { age: 13, gender: 'female', height_cm: 100, weight_kg: 30, activity_level: 'sedentary' });

  const invalid = validateAboutYou({ ...base, age: '12', height_cm: '251', weight_kg: '351', activity_level: '' });
  assert.equal(invalid.payload, null);
  assert.ok(invalid.errors.age);
  assert.ok(invalid.errors.height_cm);
  assert.ok(invalid.errors.weight_kg);
  assert.ok(invalid.errors.activity_level);
});

test('changing any baseline field changes the calculation key', () => {
  const base = { age: '30', gender: 'male', height_cm: '180', weight_kg: '80', activity_level: 'moderately_active' };
  assert.notEqual(onboardingBaselineKey(base), onboardingBaselineKey({ ...base, weight_kg: '79' }));
});

test('authenticated destination follows the profile onboarding flag', () => {
  assert.equal(authenticatedDestination(false), '/(onboarding)/welcome');
  assert.equal(authenticatedDestination(true), '/(app)/(tabs)');
});
