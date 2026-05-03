import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { adminService } from '../services/adminService.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { db, administrators } from '../db/index.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    console.log('Admin login attempt:', req.body.email);
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Query admin from database
        const result = await db.select()
            .from(administrators)
            .where(eq(administrators.email, email))
            .limit(1);
        
        console.log('Admin found:', result.length > 0 ? 'Yes' : 'No');
        
        if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const admin = result[0];
        console.log('Admin role:', admin.role);
        
        // Compare password
        const valid = await bcrypt.compare(password, admin.passwordHash);
        console.log('Password valid:', valid);
        
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: admin.adminId, email: admin.email, role: 'admin', adminRole: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('Login successful for:', admin.email);
        
        res.json({
            message: 'Login successful',
            token,
            admin: { id: admin.adminId, name: admin.fullName, email: admin.email, role: admin.role }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
});

// Get Dashboard Stats
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
    try {
        const stats = await adminService.getStats();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get All Donors
router.get('/donors', authenticate, authorize('admin'), async (req, res) => {
    try {
        const donors = await adminService.getAllDonors();
        res.json(donors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch donors' });
    }
});

// Get Single Donor
router.get('/donors/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const donor = await adminService.getDonorById(parseInt(req.params.id));
        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }
        res.json(donor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch donor' });
    }
});

// Delete Donor
router.delete('/donors/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await adminService.deleteDonor(parseInt(req.params.id));
        res.json({ message: 'Donor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete donor' });
    }
});

// Get All Hospitals
router.get('/hospitals', authenticate, authorize('admin'), async (req, res) => {
    try {
        const hospitals = await adminService.getAllHospitals();
        res.json(hospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
});

// Verify Hospital
router.put('/hospitals/:id/verify', authenticate, authorize('admin'), async (req, res) => {
    try {
        const hospital = await adminService.verifyHospital(parseInt(req.params.id));
        res.json({ message: 'Hospital verified successfully', hospital });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to verify hospital' });
    }
});

// Delete Hospital
router.delete('/hospitals/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await adminService.deleteHospital(parseInt(req.params.id));
        res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete hospital' });
    }
});

// Get All Blood Requests
router.get('/requests', authenticate, authorize('admin'), async (req, res) => {
    try {
        const requests = await adminService.getAllBloodRequests();
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get All Donations
router.get('/donations', authenticate, authorize('admin'), async (req, res) => {
    try {
        const donations = await adminService.getAllDonations();
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});

export default router;