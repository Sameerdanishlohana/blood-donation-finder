import { eq, and, desc, sql } from 'drizzle-orm';
import { db, donors, bloodGroups, cities, bloodRequests, hospitals, donations, donorResponses } from '../db/index.js';
import bcrypt from 'bcrypt';

export const donorService = {
    // Register new donor
    async registerDonor(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const result = await db.insert(donors).values({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            passwordHash: hashedPassword,
            bloodGroupId: data.bloodGroupId,
            cityId: data.cityId,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
        }).returning();
        
        return result[0];
    },
    
    // Find donor by email
    async findByEmail(email) {
        const result = await db.select()
            .from(donors)
            .where(eq(donors.email, email))
            .limit(1);
        return result[0];
    },
    
    // Find donor by ID with complete details
    async findById(donorId) {
        const result = await db.select({
            donorId: donors.donorId,
            fullName: donors.fullName,
            email: donors.email,
            phone: donors.phone,
            passwordHash: donors.passwordHash,
            bloodGroupId: donors.bloodGroupId,
            bloodGroup: bloodGroups.bloodType,
            cityId: donors.cityId,
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
    
    // Search matching donors
    async searchMatchingDonors(bloodType, cityName) {
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
                eq(bloodGroups.bloodType, bloodType),
                eq(cities.cityName, cityName)
            )
        )
        .orderBy(desc(donors.totalDonations))
        .limit(50);
        
        return result;
    },
    
    // Get donor profile
    async getProfile(donorId) {
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
    
    // Update availability
    async updateAvailability(donorId, isAvailable) {
        const result = await db.update(donors)
            .set({ isAvailable: isAvailable })
            .where(eq(donors.donorId, donorId))
            .returning();
        return result[0];
    },
    
    // Get all blood groups
    async getBloodGroups() {
        return await db.select().from(bloodGroups).orderBy(bloodGroups.bloodType);
    },
    
    // Get all cities
    async getCities() {
        return await db.select().from(cities).orderBy(cities.cityName);
    },
    
    // Get all active emergency requests for donors (matching their blood type and city)
    async getActiveEmergencyRequests(donorId) {
        console.log('Getting emergency requests for donor:', donorId);
        
        // First get donor's details
        const donor = await this.findById(donorId);
        if (!donor) {
            console.log('Donor not found');
            return [];
        }
        
        console.log('Donor blood group ID:', donor.bloodGroupId);
        console.log('Donor city ID:', donor.cityId);
        
        // Get matching requests
        const result = await db.select({
            requestId: bloodRequests.requestId,
            patientName: bloodRequests.patientName,
            bloodGroup: bloodGroups.bloodType,
            bloodGroupId: bloodGroups.bloodGroupId,
            cityName: cities.cityName,
            hospitalName: hospitals.hospitalName,
            quantityUnits: bloodRequests.quantityUnits,
            urgencyLevel: bloodRequests.urgencyLevel,
            contactPerson: bloodRequests.contactPerson,
            contactPhone: bloodRequests.contactPhone,
            requestedDate: bloodRequests.requestedDate,
            requiredByDate: bloodRequests.requiredByDate,
            notes: bloodRequests.notes,
            statusId: bloodRequests.statusId,
        })
        .from(bloodRequests)
        .innerJoin(bloodGroups, eq(bloodRequests.bloodGroupId, bloodGroups.bloodGroupId))
        .innerJoin(cities, eq(bloodRequests.cityId, cities.cityId))
        .innerJoin(hospitals, eq(bloodRequests.hospitalId, hospitals.hospitalId))
        .where(
            and(
                eq(bloodRequests.statusId, 1), // Status 1 = Pending
                eq(bloodRequests.bloodGroupId, donor.bloodGroupId),
                eq(bloodRequests.cityId, donor.cityId)
            )
        )
        .orderBy(
            sql`CASE 
                WHEN ${bloodRequests.urgencyLevel} = 'Emergency' THEN 1 
                WHEN ${bloodRequests.urgencyLevel} = 'High' THEN 2 
                ELSE 3 
            END`
        )
        .limit(20);
        
        console.log('Found requests:', result.length);
        return result;
    },
    
    // Record donor's interest in a request and create donation record
   // Record donor's interest in a request and create donation record
async respondToRequest(donorId, requestId) {
    // Check if donor already responded
    const existing = await db.select()
        .from(donorResponses)
        .where(
            and(
                eq(donorResponses.donorId, donorId),
                eq(donorResponses.requestId, requestId)
            )
        )
        .limit(1);
    
    if (existing.length > 0) {
        throw new Error('You have already responded to this request');
    }
    
    // Get the request details to get hospital_id
    const request = await db.select()
        .from(bloodRequests)
        .where(eq(bloodRequests.requestId, requestId))
        .limit(1);
    
    if (!request[0]) {
        throw new Error('Request not found');
    }
    
    // Record the response
    const response = await db.insert(donorResponses).values({
        donorId: donorId,
        requestId: requestId,
        responseDate: new Date(),
        status: 'pending',
    }).returning();
    
    // Create donation record (pending confirmation)
    const donation = await db.insert(donations).values({
        donorId: donorId,
        requestId: requestId,
        hospitalId: request[0].hospitalId,
        donationDate: new Date(),
        quantityUnits: request[0].quantityUnits || 1,
        notes: `Responded to emergency request for patient: ${request[0].patientName}`,
        isConfirmed: false,
    }).returning();
    
    // IMPORTANT: Update donor's total_donations count
    // Get current total and increment by 1
    await db.update(donors)
        .set({ 
            totalDonations: sql`${donors.totalDonations} + 1`,
            lastDonationDate: new Date()
        })
        .where(eq(donors.donorId, donorId));
    
    // Update request status to "Donor Found" (status 3)
    await db.update(bloodRequests)
        .set({ statusId: 3 })
        .where(eq(bloodRequests.requestId, requestId));
    
    console.log(`Donor ${donorId} responded to request ${requestId}, donation recorded with ID: ${donation[0].donationId}`);
    console.log(`Donor ${donorId} total donations incremented`);
    
    return { response: response[0], donation: donation[0] };
},
    
    // Get donor's responses
    async getMyResponses(donorId) {
        const result = await db.select({
            responseId: donorResponses.responseId,
            requestId: donorResponses.requestId,
            patientName: bloodRequests.patientName,
            bloodGroup: bloodGroups.bloodType,
            hospitalName: hospitals.hospitalName,
            cityName: cities.cityName,
            responseDate: donorResponses.responseDate,
            status: donorResponses.status,
        })
        .from(donorResponses)
        .innerJoin(bloodRequests, eq(donorResponses.requestId, bloodRequests.requestId))
        .innerJoin(bloodGroups, eq(bloodRequests.bloodGroupId, bloodGroups.bloodGroupId))
        .innerJoin(hospitals, eq(bloodRequests.hospitalId, hospitals.hospitalId))
        .innerJoin(cities, eq(bloodRequests.cityId, cities.cityId))
        .where(eq(donorResponses.donorId, donorId))
        .orderBy(desc(donorResponses.responseDate));
        
        return result;
    },
    
    // Get donor's pending donations (not yet confirmed)
    async getPendingDonations(donorId) {
        const result = await db.select({
            donationId: donations.donationId,
            requestId: donations.requestId,
            patientName: bloodRequests.patientName,
            hospitalName: hospitals.hospitalName,
            cityName: cities.cityName,
            bloodGroup: bloodGroups.bloodType,
            quantityUnits: donations.quantityUnits,
            donationDate: donations.donationDate,
            isConfirmed: donations.isConfirmed,
        })
        .from(donations)
        .innerJoin(bloodRequests, eq(donations.requestId, bloodRequests.requestId))
        .innerJoin(hospitals, eq(donations.hospitalId, hospitals.hospitalId))
        .innerJoin(cities, eq(bloodRequests.cityId, cities.cityId))
        .innerJoin(bloodGroups, eq(bloodRequests.bloodGroupId, bloodGroups.bloodGroupId))
        .where(
            and(
                eq(donations.donorId, donorId),
                eq(donations.isConfirmed, false)
            )
        )
        .orderBy(desc(donations.donationDate));
        
        return result;
    },
};