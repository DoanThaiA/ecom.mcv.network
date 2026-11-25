import bcrypt from 'bcryptjs';
import {
  CmsUserStore,
  MIN_PASSWORD_LENGTH,
  NewCmsUserDocument,
  assertPasswordStrength,
  normalizeEmail,
  parseArgs,
  saveCmsUser,
} from '../../src/database/scripts/create-cms-user.helpers';
import { AccountTypeEnum } from '../../src/cms-users/permissions/account-type.enum';
import { ModulePermission } from '../../src/cms-users/permissions/module-permission.enum';
import { StatusEnum } from '../../src/statuses/statuses.enum';

describe('create-cms-user helpers', () => {
  describe('parseArgs', () => {
    it('should apply defaults when no arguments are given', () => {
      expect(parseArgs([])).toEqual({
        email: undefined,
        firstName: 'Admin',
        lastName: '',
        resetPassword: false,
        help: false,
      });
    });

    it('should parse "--flag value" and "--flag=value" forms', () => {
      const args = parseArgs([
        '--email',
        'me@example.com',
        '--first-name=Ha',
        '--last-name',
        'Nguyen',
        '--reset-password',
      ]);

      expect(args).toEqual({
        email: 'me@example.com',
        firstName: 'Ha',
        lastName: 'Nguyen',
        resetPassword: true,
        help: false,
      });
    });

    it('should recognise --help and -h', () => {
      expect(parseArgs(['--help']).help).toBe(true);
      expect(parseArgs(['-h']).help).toBe(true);
    });

    it('should reject unknown flags, including a password flag', () => {
      expect(() => parseArgs(['--password', 'secret123'])).toThrow(
        'Tham số không hợp lệ',
      );
    });

    it.each([[['--email']], [['--email', '--reset-password']]])(
      'should reject a flag without a value: %j',
      (argv) => {
        expect(() => parseArgs(argv)).toThrow('Thiếu giá trị cho --email');
      },
    );
  });

  describe('normalizeEmail', () => {
    it('should trim and lower-case the email', () => {
      expect(normalizeEmail('  Me@Example.COM ')).toBe('me@example.com');
    });

    it.each(['', 'no-at-sign', 'a@b', 'a b@example.com'])(
      'should reject invalid email "%s"',
      (email) => {
        expect(() => normalizeEmail(email)).toThrow('Email không hợp lệ');
      },
    );
  });

  describe('assertPasswordStrength', () => {
    it('should accept a password at the minimum length', () => {
      expect(() =>
        assertPasswordStrength('a'.repeat(MIN_PASSWORD_LENGTH)),
      ).not.toThrow();
    });

    it('should reject a password one character too short', () => {
      expect(() =>
        assertPasswordStrength('a'.repeat(MIN_PASSWORD_LENGTH - 1)),
      ).toThrow('ít nhất');
    });

    it('should reject the default seed password and blank input', () => {
      expect(() => assertPasswordStrength('secret')).toThrow('ít nhất');
      expect(() => assertPasswordStrength('        ')).toThrow('để trống');
    });
  });

  describe('saveCmsUser', () => {
    const input = {
      email: 'Me@Example.com',
      password: 'a-strong-pass',
      firstName: 'Ha',
      lastName: 'Nguyen',
      resetPassword: false,
    };

    const createStore = (existingId: string | null) => {
      const created: NewCmsUserDocument[] = [];
      const updated: Array<{ id: string; hash: string }> = [];
      const store: CmsUserStore = {
        findIdByEmail: jest.fn().mockResolvedValue(existingId),
        create: jest.fn((document: NewCmsUserDocument) => {
          created.push(document);
          return Promise.resolve();
        }),
        updatePassword: jest.fn((id: string, hash: string) => {
          updated.push({ id, hash });
          return Promise.resolve();
        }),
      };
      return { store, created, updated };
    };

    it('should create an active full-permission admin with a hashed password', async () => {
      const { store, created } = createStore(null);

      const result = await saveCmsUser(store, input);

      expect(result).toBe('created');
      expect(store.findIdByEmail).toHaveBeenCalledWith('me@example.com');
      expect(created).toHaveLength(1);
      expect(created[0]).toMatchObject({
        email: 'me@example.com',
        firstName: 'Ha',
        lastName: 'Nguyen',
        accountType: AccountTypeEnum.website_admin,
        status: StatusEnum.active,
      });
      expect(created[0].permissions).toContain(ModulePermission.super_admin);
      expect(created[0].password).not.toBe(input.password);
      expect(await bcrypt.compare(input.password, created[0].password)).toBe(
        true,
      );
    });

    it('should refuse to touch an existing account without --reset-password', async () => {
      const { store, created, updated } = createStore('abc123');

      await expect(saveCmsUser(store, input)).rejects.toThrow('đã tồn tại');

      expect(created).toHaveLength(0);
      expect(updated).toHaveLength(0);
    });

    it('should only replace the password hash when resetting', async () => {
      const { store, created, updated } = createStore('abc123');

      const result = await saveCmsUser(store, {
        ...input,
        resetPassword: true,
      });

      expect(result).toBe('password-reset');
      expect(created).toHaveLength(0);
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe('abc123');
      expect(await bcrypt.compare(input.password, updated[0].hash)).toBe(true);
    });

    it('should not create an account when resetting one that does not exist', async () => {
      const { store, created, updated } = createStore(null);

      await expect(
        saveCmsUser(store, { ...input, resetPassword: true }),
      ).rejects.toThrow('Không tìm thấy tài khoản');

      expect(created).toHaveLength(0);
      expect(updated).toHaveLength(0);
    });

    it('should reject a weak password before touching the store', async () => {
      const { store } = createStore(null);

      await expect(
        saveCmsUser(store, { ...input, password: 'short' }),
      ).rejects.toThrow('ít nhất');

      expect(store.findIdByEmail).not.toHaveBeenCalled();
    });
  });
});
