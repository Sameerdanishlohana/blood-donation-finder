import { eq, desc } from 'drizzle-orm';
import { db, donations, donors, bloodRequests, hospitals } from '../db/index.js';

export const donationService = {
    // Record a donation
    async recordDonation(data) {
        const result = await db.insert(donations).values({
            donorId: data.donorId,
            requestId: data.requestId || null,
            hospitalId: data.hospitalId,
            quantityUnits: data.quantityUnits || 1,
            notes: data.notes,
            isConfirmed: true,
        }).returning();
        
        // Update donor's total donations and last donation date
        await db.update(donors)
            .set({ 
                totalDonations: sql`${donors.totalDonations} + 1`,
                lastDonationDate: new Date(),
                isAvailable: false
            })
            .where(eq(donors.donorId, data.donorId));
        
        // Update request status if this donation fulfills it
        if (data.requestId) {
            await db.update(bloodRequests)
                .set({ statusId: 4 }) // Completed
                .where(eq(bloodRequests.requestId, data.requestId));
        }
        
        return result[0];
    },
    
    // Get donor's donation history
    async getDonorHistory(donorId) {
        const result = await db.select({
            donationId: donations.donationId,
            hospitalName: hospitals.hospitalName,
            quantityUnits: donations.quantityUnits,
            donationDate: donations.donationDate,
            notes: donations.notes,
        })
        .from(donations)
        .innerJoin(hospitals, eq(donations.hospitalId, hospitals.hospitalId))
        .where(eq(donations.donorId, donorId))
        .orderBy(desc(donations.donationDate));
        
        return result;
    },
    
    // Get hospital's received donations
    async getHospitalDonations(hospitalId) {
        const result = await db.select({
            donationId: donations.donationId,
            donorName: donors.fullName,
            donorPhone: donors.phone,
            bloodGroup: bloodGroups.bloodType,
            quantityUnits: donations.quantityUnits,
            donationDate: donations.donationDate,
        })
        .from(donations)
        .innerJoin(donors, eq(donations.donorId, donors.donorId))
        .innerJoin(bloodGroups, eq(donors.bloodGroupId, bloodGroups.bloodGroupId))
        .where(eq(donations.hospitalId, hospitalId))
        .orderBy(desc(donations.donationDate));
        
        return result;
    },
};