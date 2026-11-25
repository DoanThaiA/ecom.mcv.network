import 'dotenv/config';
import * as readline from 'readline';
import { Writable } from 'stream';
import { connect, disconnect, model } from 'mongoose';
import {
  CmsUserSchema,
  CmsUserSchemaClass,
} from '../../cms-users/model/cms-user.schema';
import {
  CmsUserStore,
  assertPasswordStrength,
  normalizeEmail,
  parseArgs,
  saveCmsUser,
} from './create-cms-user.helpers';

const USAGE = `Tạo tài khoản CMS đầy đủ quyền, hoặc đặt lại mật khẩu của tài khoản có sẵn.

Cách dùng:
  node dist/database/scripts/create-cms-user.js --email <email> [--first-name <tên>] [--last-name <họ>] [--reset-password]

Mật khẩu được nhập ở dấu nhắc ẩn (chạy với -it), hoặc lấy từ biến môi trường
CMS_USER_PASSWORD. Mật khẩu không được truyền qua tham số dòng lệnh.

Tham số:
  --email            Email đăng nhập (bắt buộc)
  --first-name       Tên hiển thị (mặc định: Admin)
  --last-name        Họ
  --reset-password   Đặt lại mật khẩu cho tài khoản đã tồn tại
  --help, -h         Hiện hướng dẫn này
`;

/**
 * Reads one line from the terminal without echoing the typed characters.
 *
 * @param question - Prompt shown before the hidden input
 * @returns The typed line
 */
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    let muted = false;
    const output = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) process.stdout.write(chunk, encoding);
        callback();
      },
    });
    const rl = readline.createInterface({
      input: process.stdin,
      output,
      terminal: true,
    });

    process.stdout.write(question);
    muted = true;
    rl.question('', (answer) => {
      muted = false;
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

/**
 * Gets the password from CMS_USER_PASSWORD or from a hidden prompt.
 *
 * @returns The plain text password
 * @throws Error when no terminal is available or the confirmation differs
 */
async function readPassword(): Promise<string> {
  const fromEnvironment = process.env.CMS_USER_PASSWORD;
  if (fromEnvironment) return fromEnvironment;

  if (!process.stdin.isTTY) {
    throw new Error(
      'Không có terminal để nhập mật khẩu. Chạy với -it hoặc đặt biến CMS_USER_PASSWORD.',
    );
  }

  const first = await promptHidden('Mật khẩu: ');
  const second = await promptHidden('Nhập lại mật khẩu: ');
  if (first !== second) {
    throw new Error('Hai mật khẩu không khớp.');
  }
  return first;
}

/**
 * Builds the MongoDB-backed store used by the script.
 *
 * @returns Store reading and writing the cms_users collection
 */
function createStore(): CmsUserStore {
  const cmsUserModel = model(CmsUserSchemaClass.name, CmsUserSchema);

  return {
    findIdByEmail: async (email) => {
      const found = await cmsUserModel.findOne({ email }, { _id: 1 }).lean();
      return found ? String(found._id) : null;
    },
    create: async (document) => {
      await cmsUserModel.create(document);
    },
    updatePassword: async (id, passwordHash) => {
      await cmsUserModel.updateOne(
        { _id: id },
        { $set: { password: passwordHash } },
      );
    },
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.email) {
    console.log(USAGE);
    return;
  }

  const email = normalizeEmail(args.email);
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('Thiếu biến môi trường MONGODB_URL.');
  }

  const password = await readPassword();
  assertPasswordStrength(password);

  await connect(mongoUrl);
  try {
    const result = await saveCmsUser(createStore(), {
      email,
      password,
      firstName: args.firstName,
      lastName: args.lastName,
      resetPassword: args.resetPassword,
    });
    console.log(
      result === 'created'
        ? `Đã tạo tài khoản ${email} với đầy đủ quyền.`
        : `Đã đặt lại mật khẩu cho ${email}.`,
    );
  } finally {
    await disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    `Lỗi: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
