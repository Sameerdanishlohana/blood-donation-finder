import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in .env file');
    console.error('Looking for .env at:', path.join(__dirname, '../../.env'));
    process.exit(1);
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Re-export all schema tables for easy access
export const { 
    bloodGroups, 
    cities, 
    requestStatus,
    donors, 
    hospitals, 
    patients,
    bloodRequests, 
    donations, 
    administrators,
    donorResponses 
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