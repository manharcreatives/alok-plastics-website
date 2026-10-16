#!/usr/bin/env node
/** Creates or updates an admin account in Neon.
 *  Usage: pnpm admin:user <username> "<Display name>" <password>   (password at least 10 characters) */
import { randomBytes, scryptSync } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const [username, name, password] = process.argv.slice(2);
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) { console.error('admin-user: DATABASE_URL is not set'); process.exit(1); }
if (!username || !name || !password) { console.error('usage: pnpm admin:user <username> "<Display name>" <password>'); process.exit(1); }
if (password.length < 10) { console.error('admin-user: password must be at least 10 characters'); process.exit(1); }

const salt = randomBytes(16);
const hash = `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;
const sql = neon(url);
await sql.query(
  `insert into admin_users (username, name, hash, created_at) values ($1,$2,$3,$4)
   on conflict (username) do update set name = excluded.name, hash = excluded.hash`,
  [username.trim().toLowerCase(), name, hash, Math.floor(Date.now() / 1000)],
);
console.log(`admin-user: saved "${username.trim().toLowerCase()}"`);
