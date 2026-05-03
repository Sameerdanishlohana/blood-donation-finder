import express from 'express';
import { donorService } from '../services/donorService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all active emergency requests (for donors)
router.get('/emergency', authenticate, async (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ error: 'Access denied. Donor only.' });
    }
    
    console.log('=== Emergency Requests API Called ===');
    console.log('Donor ID:', req.user.id);
    
    try {
        const requests = await donorService.getActiveEmergencyRequests(req.user.id);
        console.log('Returning requests count:', requests.length);
        console.log('First request:', requests[0]);
        res.json(requests);
    } catch (error) {
        console.error('Error fetching emergency requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests: ' + error.message });
    }
});

// Respond to a request (donor expresses interest)
router.post('/:requestId/respond', authenticate, async (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ error: 'Access denied. Donor only.' });
    }
    
    try {
        const requestId = parseInt(req.params.requestId);
        console.log('Donor responding to request:', requestId);
        
        const response = await donorService.respondToRequest(req.user.id, requestId);
        
        res.json({ 
            message: 'Thank you! The hospital will contact you shortly.',
            response 
        });
    } catch (error) {
        console.error('Error responding to request:', error);
        res.status(500).json({ error: error.message || 'Failed to respond' });
    }
});

// Get my responses
router.get('/my-responses', authenticate, async (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ error: 'Access denied. Donor only.' });
    }
    
    try {
        const responses = await donorService.getMyResponses(req.user.id);
        res.json(responses);
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
});

export default router;