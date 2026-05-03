import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Now import everything else
import express from 'express';
import cors from 'cors';
import { testConnection } from './db/index.js';
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import hospitalRoutes from './routes/hospitals.js';
import adminRoutes from './routes/admin.js';
import donationRoutes from './routes/donations.js';
import donorRequestRoutes from './routes/donorRequests.js';

const app = express();

app.use(cors());
app.use(express.json());

// Test database connection
await testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donor', donorRequestRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Blood Donation API 🩸 is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});