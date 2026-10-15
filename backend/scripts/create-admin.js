import 'dotenv/config';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { prisma } from '../src/lib/prisma.js';
import { generateTemporaryPassword, hashPassword } from '../src/lib/password.js';
import { email, name } from '../src/modules/auth/auth.schema.js';

const USAGE = 'Usage: npm run create-admin -- --name "Full Name" --email admin@example.com';

async function main() {
  const { values } = parseArgs({ options: { name: { type: 'string' }, email: { type: 'string' } } });
  const input = z.object({ name, email }).safeParse(values);

  if (!input.success) {
    const issues = input.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`${issues.join('\n')}\n${USAGE}`);
  }

  if (await prisma.user.findUnique({ where: { email: input.data.email } })) {
    throw new Error(`A user with email ${input.data.email} already exists.`);
  }

  const temporaryPassword = generateTemporaryPassword();
  await prisma.user.create({
    data: {
      ...input.data,
      role: 'admin',
      mustChangePassword: true,
      passwordHash: await hashPassword(temporaryPassword),
    },
  });

  console.log(`Admin created: ${input.data.email}`);
  console.log(`Temporary password: ${temporaryPassword}`);
  console.log('They will be asked to choose a new password after their first login.');
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
