import { 
    pgTable, serial, varchar, integer, boolean, timestamp, date, text
} from 'drizzle-orm/pg-core';

// Blood Groups Table
export const bloodGroups = pgTable('blood_groups', {
    bloodGroupId: serial('blood_group_id').primaryKey(),
    bloodType: varchar('blood_type', { length: 3 }).unique().notNull(),
});

// Cities Table
export const cities = pgTable('cities', {
    cityId: serial('city_id').primaryKey(),
    cityName: varchar('city_name', { length: 100 }).unique().notNull(),
    province: varchar('province', { length: 100 }),
});

// Request Status Table
export const requestStatus = pgTable('request_status', {
    statusId: serial('status_id').primaryKey(),
    statusName: varchar('status_name', { length: 50 }).unique().notNull(),
});

// Donors Table
export const donors = pgTable('donors', {
    donorId: serial('donor_id').primaryKey(),
    fullName: varchar('full_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    bloodGroupId: integer('blood_group_id').references(() => bloodGroups.bloodGroupId).notNull(),
    cityId: integer('city_id').references(() => cities.cityId).notNull(),
    dateOfBirth: date('date_of_birth'),
    gender: varchar('gender', { length: 1 }),
    isAvailable: boolean('is_available').default(true),
    lastDonationDate: date('last_donation_date'),
    totalDonations: integer('total_donations').default(0),
    registrationDate: timestamp('registration_date').defaultNow(),
});

// Hospitals Table
export const hospitals = pgTable('hospitals', {
    hospitalId: serial('hospital_id').primaryKey(),
    hospitalName: varchar('hospital_name', { length: 200 }).notNull(),
    licenseNumber: varchar('license_number', { length: 50 }).unique().notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    address: text('address').notNull(),
    cityId: integer('city_id').references(() => cities.cityId).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    isVerified: boolean('is_verified').default(false),
    registrationDate: timestamp('registration_date').defaultNow(),
});

// Blood Requests Table (ONLY ONE DECLARATION)
export const bloodRequests = pgTable('blood_requests', {
    requestId: serial('request_id').primaryKey(),
    hospitalId: integer('hospital_id').references(() => hospitals.hospitalId).notNull(),
    patientName: varchar('patient_name', { length: 100 }).notNull(),
    bloodGroupId: integer('blood_group_id').references(() => bloodGroups.bloodGroupId).notNull(),
    cityId: integer('city_id').references(() => cities.cityId).notNull(),
    quantityUnits: integer('quantity_units').default(1),
    urgencyLevel: varchar('urgency_level', { length: 20 }).default('Normal'),
    statusId: integer('status_id').references(() => requestStatus.statusId).default(1),
    contactPerson: varchar('contact_person', { length: 100 }),
    contactPhone: varchar('contact_phone', { length: 20 }),
    requestedDate: timestamp('requested_date').defaultNow(),
    requiredByDate: date('required_by_date'),
    notes: text('notes'),
});
// Donor Responses Table (for tracking donor interest in requests)
export const donorResponses = pgTable('donor_responses', {
    responseId: serial('response_id').primaryKey(),
    donorId: integer('donor_id').references(() => donors.donorId).notNull(),
    requestId: integer('request_id').references(() => bloodRequests.requestId).notNull(),
    responseDate: timestamp('response_date').defaultNow(),
    status: varchar('status', { length: 20 }).default('pending'), // pending, contacted, completed
});

// Donations Table
export const donations = pgTable('donations', {
    donationId: serial('donation_id').primaryKey(),
    donorId: integer('donor_id').references(() => donors.donorId).notNull(),
    requestId: integer('request_id').references(() => bloodRequests.requestId),
    hospitalId: integer('hospital_id').references(() => hospitals.hospitalId).notNull(),
    donationDate: timestamp('donation_date').defaultNow(),
    quantityUnits: integer('quantity_units').default(1),
    notes: text('notes'),
    isConfirmed: boolean('is_confirmed').default(false),
});

// Administrators Table
export const administrators = pgTable('administrators', {
    adminId: serial('admin_id').primaryKey(),
    fullName: varchar('full_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('Moderator'),
    createdAt: timestamp('created_at').defaultNow(),
});