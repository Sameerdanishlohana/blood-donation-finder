import { eq, and, desc, sql } from 'drizzle-orm';
import { db, hospitals, bloodRequests, requestStatus, bloodGroups, cities, donors } from '../db/index.js';
import bcrypt from 'bcrypt';

export const hospitalService = {
    // Register hospital
    async registerHospital(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const result = await db.insert(hospitals).values({
            hospitalName: data.hospitalName,
            licenseNumber: data.licenseNumber,
            email: data.email,
            phone: data.phone,
            address: data.address,
            cityId: data.cityId,
            passwordHash: hashedPassword,
            isVerified: false,
        }).returning();
        
        return result[0];
    },
    
    // Find hospital by email
    async findByEmail(email) {
        const result = await db.select()
            .from(hospitals)
            .where(eq(hospitals.email, email))
            .limit(1);
        return result[0];
    },
    
    // Find hospital by ID
    async findById(hospitalId) {
        const result = await db.select()
            .from(hospitals)
            .where(eq(hospitals.hospitalId, hospitalId))
            .limit(1);
        return result[0];
    },
    
    // Get hospital profile
    async getProfile(hospitalId) {
        const result = await db.select({
            hospitalId: hospitals.hospitalId,
            hospitalName: hospitals.hospitalName,
            email: hospitals.email,
            phone: hospitals.phone,
            address: hospitals.address,
            cityId: hospitals.cityId,
            isVerified: hospitals.isVerified,
            registrationDate: hospitals.registrationDate,
        })
        .from(hospitals)
        .where(eq(hospitals.hospitalId, hospitalId))
        .limit(1);
        
        return result[0];
    },
    
    // Create blood request
    async createBloodRequest(data) {
        const result = await db.insert(bloodRequests).values({
            hospitalId: data.hospitalId,
            patientName: data.patientName,
            bloodGroupId: data.bloodGroupId,
            cityId: data.cityId,
            quantityUnits: data.quantityUnits || 1,
            urgencyLevel: data.urgencyLevel || 'Normal',
            contactPerson: data.contactPerson || null,
            contactPhone: data.contactPhone || null,
            requiredByDate: data.requiredByDate || null,
            notes: data.notes || null,
            statusId: 1, // Pending
        }).returning();
        
        return result[0];
    },
    
    // Get all requests for a hospital
    async getHospitalRequests(hospitalId) {
        const result = await db.select({
            requestId: bloodRequests.requestId,
            patientName: bloodRequests.patientName,
            bloodGroup: bloodGroups.bloodType,
            bloodGroupId: bloodGroups.bloodGroupId,
            cityName: cities.cityName,
            quantityUnits: bloodRequests.quantityUnits,
            urgencyLevel: bloodRequests.urgencyLevel,
            statusId: bloodRequests.statusId,
            statusName: requestStatus.statusName,
            contactPerson: bloodRequests.contactPerson,
            contactPhone: bloodRequests.contactPhone,
            requestedDate: bloodRequests.requestedDate,
            requiredByDate: bloodRequests.requiredByDate,
            notes: bloodRequests.notes,
        })
        .from(bloodRequests)
        .innerJoin(bloodGroups, eq(bloodRequests.bloodGroupId, bloodGroups.bloodGroupId))
        .innerJoin(cities, eq(bloodRequests.cityId, cities.cityId))
        .innerJoin(requestStatus, eq(bloodRequests.statusId, requestStatus.statusId))
        .where(eq(bloodRequests.hospitalId, hospitalId))
        .orderBy(desc(bloodRequests.requestedDate));
        
        return result;
    },
    
    // Update request status
    async updateRequestStatus(requestId, statusId) {
        const result = await db.update(bloodRequests)
            .set({ statusId: statusId })
            .where(eq(bloodRequests.requestId, requestId))
            .returning();
        return result[0];
    },
    
    // Get matching donors for a request
    async getMatchingDonors(bloodGroupId, cityId) {
        // First get the blood group type and city name
        const bloodGroup = await db.select().from(bloodGroups).where(eq(bloodGroups.bloodGroupId, bloodGroupId)).limit(1);
        const city = await db.select().from(cities).where(eq(cities.cityId, cityId)).limit(1);
        
        if (!bloodGroup[0] || !city[0]) {
            return [];
        }
        
        // Search for available donors
        const result = await db.select({
            donorId: donors.donorId,
            fullName: donors.fullName,
            phone: donors.phone,
            email: donors.email,
            bloodGroup: bloodGroups.bloodType,
            cityName: cities.cityName,
            totalDonations: donors.totalDonations,
            isAvailable: donors.isAvailable,
        })
        .from(donors)
        .innerJoin(bloodGroups, eq(donors.bloodGroupId, bloodGroups.bloodGroupId))
        .innerJoin(cities, eq(donors.cityId, cities.cityId))
        .where(
            and(
                eq(donors.isAvailable, true),
                eq(bloodGroups.bloodType, bloodGroup[0].bloodType),
                eq(cities.cityName, city[0].cityName)
            )
        )
        .orderBy(desc(donors.totalDonations))
        .limit(50);
        
        return result;
    },
    
    // Get all statuses
    async getStatuses() {
        return await db.select().from(requestStatus);
    },

    // Confirm donation and update donor stats
    async confirmDonation(donationId) {
    // First get the donation details
    const donation = await db.select()
        .from(donations)
        .where(eq(donations.donationId, donationId))
        .limit(1);
    
    if (!donation[0]) {
        throw new Error('Donation not found');
    }
    
    // Update donation as confirmed
    const result = await db.update(donations)
        .set({ isConfirmed: true })
        .where(eq(donations.donationId, donationId))
        .returning();
    
    // Note: total_donations is already incremented when donor responded
    // So we don't increment again here
    
    return result[0];
},
};