import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { db } from '../src/prisma/db.js';

type SeedUser = {
  email: string;
  password: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  name: string;
  isProtected?: boolean;
};

const seedUsers: SeedUser[] = [
  {
    email: 'employee@mail.com',
    password: 'employee.password',
    role: 'EMPLOYEE',
    name: 'Employee',
    isProtected: true,
  },
  {
    email: 'manager@mail.com',
    password: 'manager.password',
    role: 'MANAGER',
    name: 'Manager',
    isProtected: true,
  },
  {
    email: 'admin@mail.com',
    password: 'admin.password',
    role: 'ADMIN',
    name: 'Admin',
    isProtected: true,
  },
];

async function disconnectDb() {
  const lifecycle = db as {
    close?: () => Promise<void>;
    end?: () => Promise<void>;
    $disconnect?: () => Promise<void>;
  };

  if (typeof lifecycle.close === 'function') {
    await lifecycle.close();
    return;
  }

  if (typeof lifecycle.end === 'function') {
    await lifecycle.end();
    return;
  }

  if (typeof lifecycle.$disconnect === 'function') {
    await lifecycle.$disconnect();
  }
}

async function seed() {
  console.log('Starting seed: ensuring 3 base users (EMPLOYEE, MANAGER, ADMIN)');

  for (const user of seedUsers) {
    const existingUser = await db.orm.public.User.where({
      email: user.email,
    }).first();

    if (existingUser) {
      console.log(`Skipped existing user: ${user.email} (${user.role})`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await db.orm.public.User.create({
      email: user.email,
      password: hashedPassword,
      role: user.role,
      name: user.name,
      isProtected: user.isProtected,
    });

    console.log(`Created user: ${user.email} (${user.role})`);
  }

  console.log('Seed complete.');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDb();
  });