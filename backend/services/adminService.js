import { eq, desc, sql } from 'drizzle-orm';
import { db, donors, hospitals, bloodRequests, donations, administrators, bloodGroups, cities, requestStatus } from '../db/index.js';
import bcrypt from 'bcrypt';

export const adminService = {
    // Get all donors
    async getAllDonors() {
        const result = await db.select({
            donorId: donors.donorId,
            fullName: donors.fullName,
            email: donors.email,
            phone: donors.phone,
            bloodGroup: bloodGroups.bloodType,
            cityName: cities.cityName,
            isAvailable: donors.isAvailable,
            totalDonations: donors.totalDonations,
            registrationDate: donors.registrationDate,
        })
        .from(donors)
        .innerJoin(bloodGroups, eq(donors.bloodGroupId, bloodGroups.bloodGroupId))
        .innerJoin(cities, eq(donors.cityId, cities.cityId))
        .orderBy(desc(donors.registrationDate));
        
        return result;
    },
    
    // Get single donor
    async getDonorById(donorId) {
        const result = await db.select({
            donorId: donors.donorId,
            fullName: donors.fullName,
            email: donors.email,
            phone: donors.phone,
            bloodGroup: bloodGroups.bloodType,
            cityName: cities.cityName,
            isAvailable: donors.isAvailable,
            totalDonations: donors.totalDonations,
            lastDonationDate: donors.lastDonationDate,
            registrationDate: donors.registrationDate,
        })
        .from(donors)
        .innerJoin(bloodGroups, eq(donors.bloodGroupId, bloodGroups.bloodGroupId))
        .innerJoin(cities, eq(donors.cityId, cities.cityId))
        .where(eq(donors.donorId, donorId))
        .limit(1);
        
        return result[0];
    },
    
    // Delete donor
    async deleteDonor(donorId) {
        const result = await db.delete(donors).where(eq(donors.donorId, donorId)).returning();
        return result[0];
    },
    
    // Get all hospitals
    async getAllHospitals() {
        const result = await db.select({
            hospitalId: hospitals.hospitalId,
            hospitalName: hospitals.hospitalName,
            email: hospitals.email,
            phone: hospitals.phone,
            address: hospitals.address,
            cityName: cities.cityName,
            isVerified: hospitals.isVerified,
            registrationDate: hospitals.registrationDate,
        })
        .from(hospitals)
        .innerJoin(cities, eq(hospitals.cityId, cities.cityId))
        .orderBy(desc(hospitals.registrationDate));
        
        return result;
    },
    
    // Verify hospital
    async verifyHospital(hospitalId) {
        const result = await db.update(hospitals)
            .set({ isVerified: true })
            .where(eq(hospitals.hospitalId, hospitalId))
            .returning();
        return result[0];
    },
    
    // Delete hospital
    async deleteHospital(hospitalId) {
        const result = await db.delete(hospitals).where(eq(hospitals.hospitalId, hospitalId)).returning();
        return result[0];
    },
    
    // Get all blood requests
    async getAllBloodRequests() {
        const result = await db.select({
            requestId: bloodRequests.requestId,
            hospitalName: hospitals.hospitalName,
            patientName: bloodRequests.patientName,
            bloodGroup: bloodGroups.bloodType,
            cityName: cities.cityName,
            quantityUnits: bloodRequests.quantityUnits,
            urgencyLevel: bloodRequests.urgencyLevel,
            statusName: requestStatus.statusName,
            requestedDate: bloodRequests.requestedDate,
        })
        .from(bloodRequests)
        .innerJoin(hospitals, eq(bloodRequests.hospitalId, hospitals.hospitalId))
        .innerJoin(bloodGroups, eq(bloodRequests.bloodGroupId, bloodGroups.bloodGroupId))
        .innerJoin(cities, eq(bloodRequests.cityId, cities.cityId))
        .innerJoin(requestStatus, eq(bloodRequests.statusId, requestStatus.statusId))
        .orderBy(desc(bloodRequests.requestedDate));
        
        return result;
    },
    
    // Get all donations
    async getAllDonations() {
        const result = await db.select({
            donationId: donations.donationId,
            donorName: donors.fullName,
            hospitalName: hospitals.hospitalName,
            bloodGroup: bloodGroups.bloodType,
            quantityUnits: donations.quantityUnits,
            donationDate: donations.donationDate,
            isConfirmed: donations.isConfirmed,
        })
        .from(donations)
        .innerJoin(donors, eq(donations.donorId, donors.donorId))
        .innerJoin(hospitals, eq(donations.hospitalId, hospitals.hospitalId))
        .innerJoin(bloodGroups, eq(donors.bloodGroupId, bloodGroups.bloodGroupId))
        .orderBy(desc(donations.donationDate));
        
        return result;
    },
    
    // Get statistics
    async getStats() {
        const totalDonors = await db.select({ count: sql`count(*)` }).from(donors);
        const totalHospitals = await db.select({ count: sql`count(*)` }).from(hospitals);
        const totalRequests = await db.select({ count: sql`count(*)` }).from(bloodRequests);
        const totalDonations = await db.select({ count: sql`count(*)` }).from(donations);
        const pendingRequests = await db.select({ count: sql`count(*)` }).from(bloodRequests).where(eq(bloodRequests.statusId, 1));
        
        return {
            totalDonors: Number(totalDonors[0]?.count) || 0,
            totalHospitals: Number(totalHospitals[0]?.count) || 0,
            totalRequests: Number(totalRequests[0]?.count) || 0,
            totalDonations: Number(totalDonations[0]?.count) || 0,
            pendingRequests: Number(pendingRequests[0]?.count) || 0,
        };
    },
};