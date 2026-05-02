// auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { donorService } from '../services/donorService.js';

const router = express.Router();

// Register
router.post('/donor/register', async (req, res) => {
    try {
        const { full_name, email, phone, password, blood_group_id, city_id } = req.body;
        
        const existing = await donorService.findByEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const donor = await donorService.registerDonor({
            fullName: full_name,
            email,
            phone,
            password,
            bloodGroupId: blood_group_id,
            cityId: city_id,
        });
        
        const token = jwt.sign(
            { id: donor.donorId, email: donor.email, role: 'donor' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ 
            message: 'Registration successful', 
            token,
            donor: { id: donor.donorId, name: donor.fullName, email: donor.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/donor/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const donor = await donorService.findByEmail(email);
        if (!donor) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const valid = await bcrypt.compare(password, donor.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: donor.donorId, email: donor.email, role: 'donor' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get blood groups
router.get('/blood-groups', async (req, res) => {
    try {
        const groups = await donorService.getBloodGroups();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

// Get cities
router.get('/cities', async (req, res) => {
    try {
        const cities = await donorService.getCities();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

export default router;