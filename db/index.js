import dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

// Use DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in .env file');
    process.exit(1);
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Export all tables from schema
export const { 
    bloodGroups, 
    cities, 
    requestStatus,
    donors, 
    hospitals, 
    bloodRequests, 
    donations, 
    administrators 
} = schema;

export const testConnection = async () => {
    try {
        await sql`SELECT 1`;
        console.log('✅ Connected to Neon PostgreSQL');
        return true;
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        return false;
    }
};