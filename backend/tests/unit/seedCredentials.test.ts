import { assertSafeAdminCredentials } from '../../src/seed/seedAdmin';

describe('assertSafeAdminCredentials', () => {
  it('refuses the documented default admin password in production', () => {
    expect(() => assertSafeAdminCredentials('showroom-admin-2026', 'production')).toThrow(
      /ADMIN_PASSWORD is still the default/,
    );
  });

  it('accepts a custom password in production', () => {
    expect(() =>
      assertSafeAdminCredentials('a-unique-long-passphrase', 'production'),
    ).not.toThrow();
  });

  it('accepts the default locally', () => {
    expect(() => assertSafeAdminCredentials('showroom-admin-2026', 'development')).not.toThrow();
  });
});
