import { eq, and, desc } from 'drizzle-orm';
import { db, donors, bloodGroups, cities } from '../db/index.js';
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
    
    // Find donor by ID
    async findById(donorId) {
        const result = await db.select()
            .from(donors)
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
};