import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db, hospitals, requestStatus, bloodGroups, cities, donors } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { hospitalService } from '../services/hospitalService.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Hospital Login
router.post('/login', async (req, res) => {
    console.log('Hospital login attempt:', req.body.email);
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const hospital = await hospitalService.findByEmail(email);
        console.log('Hospital found:', hospital ? 'Yes' : 'No');
        
        if (!hospital) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const valid = await bcrypt.compare(password, hospital.passwordHash);
        console.log('Password valid:', valid);
        
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (!hospital.isVerified) {
            console.log('Hospital not verified:', hospital.hospitalId);
            return res.status(403).json({ error: 'Account pending admin verification' });
        }
        
        const token = jwt.sign(
            { id: hospital.hospitalId, email: hospital.email, role: 'hospital' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('Login successful for:', hospital.email);
        
        res.json({
            message: 'Login successful',
            token,
            hospital: { id: hospital.hospitalId, name: hospital.hospitalName, email: hospital.email }
        });
    } catch (error) {
        console.error('Hospital login error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
});

// Hospital Registration
router.post('/register', async (req, res) => {
    console.log('Hospital registration attempt:', req.body.email);
    
    try {
        const { hospital_name, license_number, email, phone, address, city_id, password } = req.body;
        
        // Validate required fields
        if (!hospital_name || !license_number || !email || !phone || !address || !city_id || !password) {
            console.log('Missing fields:', { hospital_name, license_number, email, phone, address, city_id, password: !!password });
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Validate city_id is a number
        const cityIdNum = parseInt(city_id);
        if (isNaN(cityIdNum)) {
            return res.status(400).json({ error: 'Invalid city ID' });
        }
        
        const existing = await hospitalService.findByEmail(email);
        if (existing) {
            console.log('Email already exists:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hospital = await hospitalService.registerHospital({
            hospitalName: hospital_name,
            licenseNumber: license_number,
            email,
            phone,
            address,
            cityId: cityIdNum,
            password,
        });
        
        const token = jwt.sign(
            { id: hospital.hospitalId, email: hospital.email, role: 'hospital' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('Registration successful for:', hospital.email);
        
        res.status(201).json({
            message: 'Hospital registered successfully. Awaiting admin verification.',
            token,
            hospital: { id: hospital.hospitalId, name: hospital.hospitalName, email: hospital.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// Get Hospital Profile
router.get('/profile', authenticate, async (req, res) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const profile = await hospitalService.getProfile(req.user.id);
        if (!profile) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Create Blood Request
router.post('/requests', authenticate, async (req, res) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const { patient_name, blood_group_id, city_id, quantity_units, urgency_level, contact_person, contact_phone, required_by_date, notes } = req.body;
        
        if (!patient_name || !blood_group_id || !city_id) {
            return res.status(400).json({ error: 'Patient name, blood group, and city are required' });
        }
        
        const request = await hospitalService.createBloodRequest({
            hospitalId: req.user.id,
            patientName: patient_name,
            bloodGroupId: parseInt(blood_group_id),
            cityId: parseInt(city_id),
            quantityUnits: quantity_units || 1,
            urgencyLevel: urgency_level || 'Normal',
            contactPerson: contact_person || null,
            contactPhone: contact_phone || null,
            requiredByDate: required_by_date || null,
            notes: notes || null,
        });
        
        res.status(201).json({ message: 'Blood request created successfully', request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create request: ' + error.message });
    }
});

// Get Hospital's Requests
router.get('/requests', authenticate, async (req, res) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const requests = await hospitalService.getHospitalRequests(req.user.id);
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Update Request Status
router.put('/requests/:id/status', authenticate, async (req, res) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const { status_id } = req.body;
        const requestId = parseInt(req.params.id);
        
        if (!status_id) {
            return res.status(400).json({ error: 'Status ID required' });
        }
        
        const request = await hospitalService.updateRequestStatus(requestId, parseInt(status_id));
        res.json({ message: 'Status updated successfully', request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Get All Statuses
router.get('/statuses', async (req, res) => {
    try {
        const statuses = await hospitalService.getStatuses();
        res.json(statuses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch statuses' });
    }
});

export default router;