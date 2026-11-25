import bcrypt from 'bcryptjs';
import { AccountTypeEnum } from '../../cms-users/permissions/account-type.enum';
import {
  ALL_MODULE_PERMISSIONS,
  ModulePermission,
} from '../../cms-users/permissions/module-permission.enum';
import { StatusEnum } from '../../statuses/statuses.enum';

/** Minimum password length accepted by the create-cms-user script. */
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALUE_FLAGS = ['--email', '--first-name', '--last-name'];

/** Parsed command line arguments of the create-cms-user script. */
export interface CreateCmsUserArgs {
  email?: string;
  firstName: string;
  lastName: string;
  resetPassword: boolean;
  help: boolean;
}

/** Document written to the cms_users collection for a new account. */
export interface NewCmsUserDocument {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: ModulePermission[];
  accountType: AccountTypeEnum;
  status: StatusEnum;
}

/** Minimal persistence port so the account logic can be tested without MongoDB. */
export interface CmsUserStore {
  findIdByEmail(email: string): Promise<string | null>;
  create(document: NewCmsUserDocument): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}

export type CreateCmsUserResult = 'created' | 'password-reset';

/** Input of {@link saveCmsUser}. The password is plain text and is hashed here. */
export interface SaveCmsUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  resetPassword: boolean;
}

/**
 * Parses the script arguments. Accepts "--flag value" and "--flag=value".
 * The password is intentionally not an argument: it would end up in the shell
 * history and in the process list.
 *
 * @param argv - Arguments without the node binary and script path
 * @returns The parsed arguments
 * @throws Error when a flag is unknown or a value is missing
 */
export function parseArgs(argv: string[]): CreateCmsUserArgs {
  const args: CreateCmsUserArgs = {
    firstName: 'Admin',
    lastName: '',
    resetPassword: false,
    help: false,
  };

  let index = 0;
  while (index < argv.length) {
    const token = argv[index];
    index += 1;

    const equalsAt = token.startsWith('--') ? token.indexOf('=') : -1;
    const flag = equalsAt === -1 ? token : token.slice(0, equalsAt);
    const inlineValue = equalsAt === -1 ? undefined : token.slice(equalsAt + 1);

    if (flag === '--reset-password') {
      args.resetPassword = true;
      continue;
    }
    if (flag === '--help' || flag === '-h') {
      args.help = true;
      continue;
    }
    if (!VALUE_FLAGS.includes(flag)) {
      throw new Error(`Tham số không hợp lệ: ${token}`);
    }

    let value = inlineValue;
    if (value === undefined) {
      value = argv[index];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`Thiếu giá trị cho ${flag}`);
      }
      index += 1;
    }

    if (flag === '--email') args.email = value;
    if (flag === '--first-name') args.firstName = value;
    if (flag === '--last-name') args.lastName = value;
  }

  return args;
}

/**
 * Trims and lower-cases an email the same way the CMS login does.
 *
 * @param email - Raw email
 * @returns Normalized email
 * @throws Error when the email is not valid
 */
export function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error(`Email không hợp lệ: ${email}`);
  }
  return normalized;
}

/**
 * Rejects passwords that are too short or blank.
 *
 * @param password - Plain text password
 * @throws Error when the password is too weak
 */
export function assertPasswordStrength(password: string): void {
  if (password.trim().length === 0) {
    throw new Error('Mật khẩu không được để trống.');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
  }
}

/**
 * Creates a full-permission CMS account, or resets the password of an
 * existing one when `resetPassword` is set.
 *
 * @param store - Persistence port
 * @param input - Account data with a plain text password
 * @returns Whether the account was created or only its password was reset
 * @throws Error when the account exists without `resetPassword`, or when
 * `resetPassword` is set for an account that does not exist
 */
export async function saveCmsUser(
  store: CmsUserStore,
  input: SaveCmsUserInput,
): Promise<CreateCmsUserResult> {
  const email = normalizeEmail(input.email);
  assertPasswordStrength(input.password);

  const existingId = await store.findIdByEmail(email);

  if (existingId && !input.resetPassword) {
    throw new Error(
      `Tài khoản ${email} đã tồn tại. Thêm --reset-password để đặt lại mật khẩu.`,
    );
  }
  if (!existingId && input.resetPassword) {
    throw new Error(
      `Không tìm thấy tài khoản ${email} để đặt lại mật khẩu. Bỏ --reset-password để tạo mới.`,
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    await bcrypt.genSalt(),
  );

  if (existingId) {
    await store.updatePassword(existingId, passwordHash);
    return 'password-reset';
  }

  await store.create({
    email,
    password: passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    permissions: ALL_MODULE_PERMISSIONS,
    accountType: AccountTypeEnum.website_admin,
    status: StatusEnum.active,
  });
  return 'created';
}
