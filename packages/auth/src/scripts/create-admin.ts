import * as dotenv from 'dotenv';
import { db, user, client } from '@repo/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../password';

dotenv.config();

const parseArgs = () => {
  const args = process.argv.slice(2);
  let email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  let userName = process.env.ADMIN_USERNAME || 'admin';
  let password = process.env.ADMIN_PASSWORD;

  let positionalCount = 0;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--username' || arg === '-u') {
      userName = args[++i] || userName;
    } else if (arg === '--password' || arg === '-p') {
      password = args[++i] || password;
    } else if (!arg.startsWith('-')) {
      if (positionalCount === 0) userName = arg;
      if (positionalCount === 1) password = arg;
      positionalCount++;
    }
  }

  if (!password) {
    console.error('❌ Error: Admin password must be provided via ADMIN_PASSWORD environment variable or --password / positional argument.');
    process.exit(1);
  }

  return { email, userName, password };
};

export const createAdmin = async () => {
  const { email, userName, password } = parseArgs();

  console.log(`\n🔑 Initializing Admin User creation/update process...`);
  console.log(`👤 Target Username: ${userName}`);

  try {
    const existingUsers = await db.select().from(user).where(eq(user.name, userName));
    const hashedPassword = await hashPassword(password);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const updatedUser = await db
        .update(user)
        .set({
          password: hashedPassword,
          role: 'admin',
          updatedAt: new Date(),
        })
        .where(eq(user.id, existingUser.id))
        .returning();

      console.log(`\n✅ Admin user updated successfully!`);
      console.log(`   ID: ${updatedUser[0].id}`);
      console.log(`   Username: ${updatedUser[0].name}`);
      console.log(`   Role: ${updatedUser[0].role}`);
    } else {
      const newUser = await db
        .insert(user)
        .values({
          name: userName,
          email,
          password: hashedPassword,
          role: 'admin',
        })
        .returning();

      console.log(`\n🎉 Admin user created successfully!`);
      console.log(`   ID: ${newUser[0].id}`);
      console.log(`   Username: ${newUser[0].name}`);
      console.log(`   Role: ${newUser[0].role}`);
    }
  } catch (error) {
    console.error(`\n❌ Failed to create/update admin user:`, error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

createAdmin();
