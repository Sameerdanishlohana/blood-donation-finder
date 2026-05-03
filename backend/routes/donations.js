import express from 'express';
import { eq, and, desc,sql } from 'drizzle-orm';
import { db, donations, donors, bloodRequests, hospitals, bloodGroups, cities, donorResponses } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get donor's donation history (confirmed donations)
router.get('/my-history', authenticate, async (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const result = await db.select({
            donationId: donations.donationId,
            hospitalName: hospitals.hospitalName,
            quantityUnits: donations.quantityUnits,
            donationDate: donations.donationDate,
            isConfirmed: donations.isConfirmed,
        })
        .from(donations)
        .innerJoin(hospitals, eq(donations.hospitalId, hospitals.hospitalId))
        .where(eq(donations.donorId, req.user.id))
        .orderBy(desc(donations.donationDate));
        
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch donation history' });
    }
});

// Get donor's pending donations (not yet confirmed by hospital)
router.get('/pending', authenticate, async (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const result = await db.select({
            donationId: donations.donationId,
            requestId: donations.requestId,
            patientName: bloodRequests.patientName,
            hospitalName: hospitals.hospitalName,
            cityName: cities.cityName,
            bloodGroup: bloodGroups.bloodType,
            quantityUnits: donations.quantityUnits,
            donationDate: donations.donationDate,
        })
        .from(donations)
        .innerJoin(bloodRequests, eq(donations.requestId, bloodRequests.requestId))
        .innerJoin(hospitals, eq(donations.hospitalId, hospitals.hospitalId))
        .innerJoin(cities, eq(bloodRequests.cityId, cities.cityId))
        .innerJoin(bloodGroups, eq(bloodRequests.bloodGroupId, bloodGroups.bloodGroupId))
        .where(
            and(
                eq(donations.donorId, req.user.id),
                eq(donations.isConfirmed, false)
            )
        )
        .orderBy(desc(donations.donationDate));
        
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending donations' });
    }
});

// Record a donation (Hospital or Admin only)
router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const { donor_id, request_id, hospital_id, quantity_units, notes } = req.body;
        
        const result = await db.insert(donations).values({
            donorId: donor_id,
            requestId: request_id || null,
            hospitalId: hospital_id,
            quantityUnits: quantity_units || 1,
            notes: notes || null,
            isConfirmed: true,
        }).returning();
        
        // Update donor's total donations
        await db.update(donors)
            .set({ 
                totalDonations: sql`${donors.totalDonations} + 1`,
                lastDonationDate: new Date()
            })
            .where(eq(donors.donorId, donor_id));
        
        // Update request status if this donation fulfills it
        if (request_id) {
            await db.update(bloodRequests)
                .set({ statusId: 4 }) // Completed
                .where(eq(bloodRequests.requestId, request_id));
        }
        
        res.status(201).json({ message: 'Donation recorded successfully', donation: result[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to record donation' });
    }
});

// Confirm a donation (Hospital only)
router.put('/:id/confirm', authenticate, async (req, res) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
        const donationId = parseInt(req.params.id);
        
        // Get donation details
        const donation = await db.select()
            .from(donations)
            .where(eq(donations.donationId, donationId))
            .limit(1);
        
        if (!donation[0]) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        
        // Update donation as confirmed
        const result = await db.update(donations)
            .set({ isConfirmed: true })
            .where(eq(donations.donationId, donationId))
            .returning();
        
        res.json({ message: 'Donation confirmed successfully', donation: result[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to confirm donation' });
    }
});

export default router;