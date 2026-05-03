import express from 'express';
import { donorService } from '../services/donorService.js';
import { authenticate } from '../middleware/auth.js';  // Only authenticate, no authorize needed for donors

const router = express.Router();
// Search donors (public)
router.get('/search', async (req, res) => {
    const { blood_type, city_name } = req.query;
    
    if (!blood_type || !city_name) {
        return res.status(400).json({ error: 'Blood type and city are required' });
    }
    
    try {
        const results = await donorService.searchMatchingDonors(blood_type, city_name);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get donor profile (protected)
router.get('/profile', authenticate, async (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const profile = await donorService.getProfile(req.user.id);
        if (!profile) {
            return res.status(404).json({ error: 'Donor not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update donor availability
router.put('/availability', authenticate, async (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    const { is_available } = req.body;
    
    try {
        const updated = await donorService.updateAvailability(req.user.id, is_available);
        res.json({ message: `Availability updated to ${is_available}`, donor: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// Get all blood groups
router.get('/blood-groups', async (req, res) => {
    try {
        const bloodGroups = await donorService.getBloodGroups();
        res.json(bloodGroups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blood groups' });
    }
});

// Get all cities
router.get('/cities', async (req, res) => {
    try {
        const cities = await donorService.getCities();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

router.get('/requests/:id/matching-donors', authenticate, async (req, res) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const requestId = parseInt(req.params.id);
        
        // Get the request details - use db directly
        const { bloodRequests, bloodGroups, cities } = await import('../db/index.js');
        const { eq } = await import('drizzle-orm');
        
        const requestResult = await db.select({
            bloodGroupId: bloodRequests.bloodGroupId,
            cityId: bloodRequests.cityId,
        })
        .from(bloodRequests)
        .where(eq(bloodRequests.requestId, requestId))
        .limit(1);
        
        if (!requestResult[0]) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        const donors = await hospitalService.getMatchingDonors(requestResult[0].bloodGroupId, requestResult[0].cityId);
        res.json(donors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to find matching donors: ' + error.message });
    }
});

export default router;