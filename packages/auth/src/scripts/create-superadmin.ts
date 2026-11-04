import * as dotenv from 'dotenv';
import { db, user, client } from '@repo/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../password.js';

dotenv.config();

const parseArgs = () => {
  const args = process.argv.slice(2);
  let email = process.env.SUPERADMIN_EMAIL || 'superadmin@admin.com';
  let userName = process.env.SUPERADMIN_USERNAME || 'superadmin';
  let password = process.env.SUPERADMIN_PASSWORD || 'superadmin001';

  let positionalCount = 0;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--username' || arg === '-u') {
      userName = args[++i] || userName;
    } else if (arg === '--password' || arg === '-p') {
      password = args[++i] || password;
    } else if (arg === '--email' || arg === '-e') {
      email = args[++i] || email;
    } else if (!arg.startsWith('-')) {
      if (positionalCount === 0) email = arg;
      if (positionalCount === 1) password = arg;
      positionalCount++;
    }
  }

  return { email, userName, password };
};

export const createSuperAdmin = async () => {
  const { email, userName, password } = parseArgs();

  console.log(`\n🔑 Initializing Superadmin User creation/update process...`);
  console.log(`👤 Target Email: ${email}`);
  console.log(`👤 Target Username: ${userName}`);

  try {
    // 1. Ensure the PostgreSQL enum type has 'superadmin' added
    try {
      await client`ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'superadmin';`;
      console.log(`✅ Verified PostgreSQL user_role enum includes 'superadmin'`);
    } catch (enumErr: any) {
      console.warn(`⚠️ Notice on enum alteration (may already exist):`, enumErr.message || enumErr);
    }

    const existingUsers = await db.select().from(user).where(eq(user.email, email.toLowerCase()));
    const hashedPassword = await hashPassword(password);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const updatedUser = await db
        .update(user)
        .set({
          password: hashedPassword,
          role: 'superadmin',
          updatedAt: new Date(),
        })
        .where(eq(user.id, existingUser.id))
        .returning();

      console.log(`\n✅ Superadmin user updated successfully!`);
      console.log(`   ID: ${updatedUser[0].id}`);
      console.log(`   Email: ${updatedUser[0].email}`);
      console.log(`   Role: ${updatedUser[0].role}`);
    } else {
      const newUser = await db
        .insert(user)
        .values({
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'superadmin',
        })
        .returning();

      console.log(`\n🎉 Superadmin user created successfully!`);
      console.log(`   ID: ${newUser[0].id}`);
      console.log(`   Email: ${newUser[0].email}`);
      console.log(`   Role: ${newUser[0].role}`);
    }
  } catch (error) {
    console.error(`\n❌ Failed to create/update superadmin user:`, error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

createSuperAdmin();
