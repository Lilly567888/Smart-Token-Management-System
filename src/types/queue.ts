/**
 * Smart Token Management System - Type Definitions
 * Data contracts for Hospital Queue Management System
 */

export type DepartmentCode =
  | 'GM' // General Medicine
  | 'CA' // Cardiology
  | 'OR' // Orthopedics
  | 'PD' // Pediatrics
  | 'DE' // Dermatology
  | 'EN' // ENT
  | 'OP' // Ophthalmology
  | 'GY' // Gynecology
  | 'DN' // Dental Care
  | 'DL'; // Diagnostics & Lab

export interface Department {
  id: string;
  code: DepartmentCode;
  name: string;
  description: string;
  avgDurationMinutes: number;
  location: string;
  iconName: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  departmentId: string;
  roomNumber: string;
  experienceYears: number;
  qualifications: string;
  availableToday: boolean;
  avatarUrl?: string;
  shiftHours: string;
}

export type CounterStatus = 'OPEN' | 'BUSY' | 'PAUSED' | 'CLOSED';

export interface Counter {
  id: string;
  counterNumber: string;
  departmentId: string;
  assignedDoctorId?: string;
  roomNumber: string;
  status: CounterStatus;
  currentTokenId?: string;
  servicedTodayCount: number;
  openedAt?: string;
}

export type TokenStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED';

export type PriorityLevel = 'STANDARD' | 'SENIOR' | 'ACCESSIBILITY' | 'PEDIATRIC_URGENT';

export interface Token {
  id: string; // e.g. "GM-104"
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  reason: string;
  departmentId: string;
  doctorId?: string;
  type: 'WALK_IN' | 'APPOINTMENT';
  priority: PriorityLevel;
  priorityReason?: string;
  queuePosition: number; // 1 = next to be served
  estimatedWaitMinutes: number;
  status: TokenStatus;
  assignedCounterId?: string;
  assignedCounterNumber?: string;
  registeredAt: string; // ISO string
  calledAt?: string;
  servingStartedAt?: string;
  completedAt?: string;
  skippedReason?: string;
  cancelledReason?: string;
  appointmentId?: string;
}

export type AppointmentStatus = 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string; // e.g. "APT-88219"
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  departmentId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  reason: string;
  status: AppointmentStatus;
  checkedInTokenId?: string;
  createdAt: string;
}

export interface HospitalConfig {
  hospitalName: string;
  tagline: string;
  address: string;
  operatingHours: string;
  emergencyHotline: string;
  emergencyRoomLocation: string;
  highWaitAlertThresholdMinutes: number;
  prioritySeniorAgeThreshold: number;
  soundAlertsEnabled: boolean;
}

export interface QueueAuditLog {
  id: string;
  timestamp: string;
  action: 'TOKEN_CREATED' | 'TOKEN_CALLED' | 'TOKEN_SERVING' | 'TOKEN_COMPLETED' | 'TOKEN_CANCELLED' | 'TOKEN_SKIPPED' | 'COUNTER_STATUS_CHANGED' | 'APPOINTMENT_BOOKED' | 'APPOINTMENT_CHECKED_IN';
  tokenId?: string;
  counterNumber?: string;
  departmentName?: string;
  performedBy: string;
  details: string;
}

export interface QueueEstimationResult {
  waitMinutes: number;
  patientsAhead: number;
  activeCounters: number;
  avgDurationMinutes: number;
  status: 'IMMEDIATE' | 'NORMAL' | 'DELAYED' | 'NO_COUNTERS';
  formulaExplanation: string;
}
