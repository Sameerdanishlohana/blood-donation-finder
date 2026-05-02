import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { testConnection } from './db/index.js';
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';

const app = express();

app.use(cors());
app.use(express.json());

// Test database connection
await testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Blood Donation API 🩸 is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});