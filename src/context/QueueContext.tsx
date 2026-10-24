/**
 * Smart Token Management System - Application State & Queue Context
 * Real-time queue management, state persistence, audio alerts & role handling
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Department,
  Doctor,
  Counter,
  Token,
  Appointment,
  HospitalConfig,
  QueueAuditLog,
  PriorityLevel,
  CounterStatus,
} from '../types/queue';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_COUNTERS,
  INITIAL_TOKENS,
  INITIAL_APPOINTMENTS,
  INITIAL_HOSPITAL_CONFIG,
} from '../data/sampleData';
import {
  generateNextTokenId,
  updateDepartmentQueue,
  countActiveCounters,
} from '../utils/queueCalculator';

export type UserRole = 'PATIENT' | 'ADMIN' | 'RECEPTION';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

interface QueueContextType {
  departments: Department[];
  doctors: Doctor[];
  counters: Counter[];
  tokens: Token[];
  appointments: Appointment[];
  auditLogs: QueueAuditLog[];
  config: HospitalConfig;
  currentRole: UserRole;
  activeTrackingTokenId: string | null;
  activeView: string;
  toasts: ToastMessage[];
  audioEnabled: boolean;
  themeMode: 'light' | 'dark';
  // Actions
  setCurrentRole: (role: UserRole) => void;
  setActiveTrackingTokenId: (tokenId: string | null) => void;
  setActiveView: (view: string) => void;
  toggleThemeMode: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  playChime: (tone?: 'chime' | 'success' | 'alert') => void;
  dismissToast: (id: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  // Queue operations
  generateToken: (params: {
    departmentId: string;
    doctorId?: string;
    patientName: string;
    patientPhone: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    reason: string;
    type: 'WALK_IN' | 'APPOINTMENT';
    priority: PriorityLevel;
    priorityReason?: string;
    appointmentId?: string;
  }) => Token;
  callToken: (tokenId: string, counterId: string) => void;
  startServingToken: (tokenId: string) => void;
  completeToken: (tokenId: string) => void;
  skipToken: (tokenId: string, reason: string) => void;
  cancelToken: (tokenId: string, reason: string) => void;
  toggleCounterStatus: (counterId: string, specificStatus?: CounterStatus) => void;
  addCounter: (newCounter: {
    counterNumber: string;
    departmentId: string;
    assignedDoctorId?: string;
    roomNumber: string;
  }) => void;
  updateDepartmentDuration: (departmentId: string, minutes: number) => void;
  bookAppointment: (params: {
    patientName: string;
    patientPhone: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    departmentId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
  }) => Appointment;
  cancelAppointment: (appointmentId: string) => void;
  checkInAppointment: (appointmentId: string) => Token | null;
  updateHospitalConfig: (updates: Partial<HospitalConfig>) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'smart_token_v1_store';
const LEGACY_STORAGE_KEY = 'queuesmart_v1_store';

function loadStored<T>(suffix: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${suffix}`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_${suffix}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
  // Load initial state from LocalStorage if available
  const [departments, setDepartments] = useState<Department[]>(() =>
    loadStored('departments', INITIAL_DEPARTMENTS)
  );

  const [doctors, setDoctors] = useState<Doctor[]>(() =>
    loadStored('doctors', INITIAL_DOCTORS)
  );

  const [counters, setCounters] = useState<Counter[]>(() =>
    loadStored('counters', INITIAL_COUNTERS)
  );

  const [tokens, setTokens] = useState<Token[]>(() =>
    loadStored('tokens', INITIAL_TOKENS)
  );

  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadStored('appointments', INITIAL_APPOINTMENTS)
  );

  const [config, setConfig] = useState<HospitalConfig>(() =>
    loadStored('config', INITIAL_HOSPITAL_CONFIG)
  );

  const [auditLogs, setAuditLogs] = useState<QueueAuditLog[]>(() =>
    loadStored('audit', [
      {
        id: 'log-init-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: 'TOKEN_CALLED',
        tokenId: 'GM-102',
        counterNumber: 'Counter 2',
        departmentName: 'General Medicine',
        performedBy: 'Reception Staff',
        details: 'Arthur Henderson called to Counter 2 (Senior Citizen Priority)',
      },
    ])
  );

  const [currentRole, setCurrentRole] = useState<UserRole>('PATIENT');
  const [activeTrackingTokenId, setActiveTrackingTokenId] = useState<string | null>('GM-103');
  const [activeView, setActiveView] = useState<string>('patient');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
      localStorage.setItem(`${STORAGE_KEY}_doctors`, JSON.stringify(doctors));
      localStorage.setItem(`${STORAGE_KEY}_counters`, JSON.stringify(counters));
      localStorage.setItem(`${STORAGE_KEY}_tokens`, JSON.stringify(tokens));
      localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(appointments));
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
    } catch {
      // Ignore storage errors in sandbox
    }
  }, [departments, doctors, counters, tokens, appointments, config, auditLogs]);

  // Audio synthesizer chime using Web Audio API (cross-browser, self-contained, crisp)
  const playChime = useCallback((tone: 'chime' | 'success' | 'alert' = 'chime') => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (tone === 'chime') {
        // High-low two-tone hospital chime
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, now + 0.25); // C5
        gain2.gain.setValueAtTime(0.18, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 0.85);
      } else if (tone === 'success') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (tone === 'alert') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [audioEnabled]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Recalculate queue for department helper
  const rebalanceQueue = useCallback((currTokens: Token[], currCounters: Counter[], deptId: string): Token[] => {
    const dept = departments.find((d) => d.id === deptId);
    const avgDuration = dept ? dept.avgDurationMinutes : 12;
    const activeCount = countActiveCounters(currCounters, deptId);
    return updateDepartmentQueue(currTokens, deptId, activeCount, avgDuration);
  }, [departments]);

  // Generate Digital Token
  const generateToken = useCallback((params: {
    departmentId: string;
    doctorId?: string;
    patientName: string;
    patientPhone: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    reason: string;
    type: 'WALK_IN' | 'APPOINTMENT';
    priority: PriorityLevel;
    priorityReason?: string;
    appointmentId?: string;
  }): Token => {
    const dept = departments.find((d) => d.id === params.departmentId) || departments[0];
    const newId = generateNextTokenId(dept.code, tokens);

    const newToken: Token = {
      id: newId,
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      patientAge: params.patientAge,
      patientGender: params.patientGender,
      reason: params.reason,
      departmentId: params.departmentId,
      doctorId: params.doctorId,
      type: params.type,
      priority: params.priority,
      priorityReason: params.priorityReason,
      queuePosition: 1, // Will be recalculated
      estimatedWaitMinutes: 0,
      status: 'WAITING',
      registeredAt: new Date().toISOString(),
      appointmentId: params.appointmentId,
    };

    const combined = [...tokens, newToken];
    const rebalanced = rebalanceQueue(combined, counters, params.departmentId);
    setTokens(rebalanced);
    setActiveTrackingTokenId(newId);

    // Audit log
    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'TOKEN_CREATED',
      tokenId: newId,
      departmentName: dept.name,
      performedBy: currentRole === 'PATIENT' ? 'Patient Self-Registration' : 'Staff Desk',
      details: `Generated Token ${newId} for ${params.patientName} (${params.priority} priority)`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    playChime('success');
    showToast({
      type: 'success',
      title: 'Token Generated Successfully!',
      message: `Your Token Number is ${newId}. You are registered in ${dept.name}.`,
    });

    return rebalanced.find((t) => t.id === newId) || newToken;
  }, [departments, tokens, counters, rebalanceQueue, currentRole, playChime, showToast]);

  // Call Token
  const callToken = useCallback((tokenId: string, counterId: string) => {
    const targetToken = tokens.find((t) => t.id === tokenId);
    const targetCounter = counters.find((c) => c.id === counterId);
    if (!targetToken || !targetCounter) return;

    const now = new Date().toISOString();

    const updatedCounters = counters.map((c) => {
      if (c.id === counterId) {
        return { ...c, status: 'BUSY' as CounterStatus, currentTokenId: tokenId };
      }
      return c;
    });
    setCounters(updatedCounters);

    const updatedTokens = tokens.map((t) => {
      if (t.id === tokenId) {
        return {
          ...t,
          status: 'CALLED' as const,
          assignedCounterId: counterId,
          assignedCounterNumber: targetCounter.counterNumber,
          calledAt: now,
          queuePosition: 0,
          estimatedWaitMinutes: 1,
        };
      }
      return t;
    });

    const rebalanced = rebalanceQueue(updatedTokens, updatedCounters, targetToken.departmentId);
    setTokens(rebalanced);

    // Audit log
    const dept = departments.find((d) => d.id === targetToken.departmentId);
    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      action: 'TOKEN_CALLED',
      tokenId,
      counterNumber: targetCounter.counterNumber,
      departmentName: dept?.name,
      performedBy: 'Counter Staff',
      details: `${targetToken.patientName} called to ${targetCounter.counterNumber} (${targetCounter.roomNumber})`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    playChime('chime');
    showToast({
      type: 'info',
      title: `Token ${tokenId} Called!`,
      message: `Please proceed to ${targetCounter.counterNumber} (${targetCounter.roomNumber}).`,
    });
  }, [tokens, counters, departments, rebalanceQueue, playChime, showToast]);

  // Start Serving Token
  const startServingToken = useCallback((tokenId: string) => {
    const targetToken = tokens.find((t) => t.id === tokenId);
    if (!targetToken) return;

    const now = new Date().toISOString();
    const updatedTokens = tokens.map((t) => {
      if (t.id === tokenId) {
        return {
          ...t,
          status: 'SERVING' as const,
          servingStartedAt: now,
        };
      }
      return t;
    });

    const rebalanced = rebalanceQueue(updatedTokens, counters, targetToken.departmentId);
    setTokens(rebalanced);

    // Audit
    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      action: 'TOKEN_SERVING',
      tokenId,
      departmentName: departments.find((d) => d.id === targetToken.departmentId)?.name,
      performedBy: 'Doctor Consultation',
      details: `Consultation started for ${targetToken.patientName}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showToast({
      type: 'info',
      title: 'Consultation In Progress',
      message: `Patient ${targetToken.patientName} is now in consultation.`,
    });
  }, [tokens, counters, departments, rebalanceQueue, showToast]);

  // Complete Token
  const completeToken = useCallback((tokenId: string) => {
    const targetToken = tokens.find((t) => t.id === tokenId);
    if (!targetToken) return;

    const now = new Date().toISOString();

    // Release counter
    const updatedCounters = counters.map((c) => {
      if (c.currentTokenId === tokenId || c.id === targetToken.assignedCounterId) {
        return {
          ...c,
          status: 'OPEN' as CounterStatus,
          currentTokenId: undefined,
          servicedTodayCount: c.servicedTodayCount + 1,
        };
      }
      return c;
    });
    setCounters(updatedCounters);

    const updatedTokens = tokens.map((t) => {
      if (t.id === tokenId) {
        return {
          ...t,
          status: 'COMPLETED' as const,
          completedAt: now,
          queuePosition: 0,
          estimatedWaitMinutes: 0,
        };
      }
      return t;
    });

    // Mark associated appointment as completed if present
    if (targetToken.appointmentId) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === targetToken.appointmentId ? { ...a, status: 'COMPLETED' } : a))
      );
    }

    const rebalanced = rebalanceQueue(updatedTokens, updatedCounters, targetToken.departmentId);
    setTokens(rebalanced);

    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      action: 'TOKEN_COMPLETED',
      tokenId,
      departmentName: departments.find((d) => d.id === targetToken.departmentId)?.name,
      performedBy: 'Doctor / Counter',
      details: `Consultation successfully completed for ${targetToken.patientName}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    playChime('success');
    showToast({
      type: 'success',
      title: 'Consultation Completed',
      message: `Token ${tokenId} completed. Waiting queue positions updated.`,
    });
  }, [tokens, counters, departments, rebalanceQueue, playChime, showToast]);

  // Skip Token with reason
  const skipToken = useCallback((tokenId: string, reason: string) => {
    const targetToken = tokens.find((t) => t.id === tokenId);
    if (!targetToken) return;

    const now = new Date().toISOString();

    // Free counter if assigned
    const updatedCounters = counters.map((c) => {
      if (c.currentTokenId === tokenId || c.id === targetToken.assignedCounterId) {
        return { ...c, status: 'OPEN' as CounterStatus, currentTokenId: undefined };
      }
      return c;
    });
    setCounters(updatedCounters);

    const updatedTokens = tokens.map((t) => {
      if (t.id === tokenId) {
        return {
          ...t,
          status: 'SKIPPED' as const,
          skippedReason: reason,
          queuePosition: 0,
          estimatedWaitMinutes: 0,
        };
      }
      return t;
    });

    const rebalanced = rebalanceQueue(updatedTokens, updatedCounters, targetToken.departmentId);
    setTokens(rebalanced);

    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      action: 'TOKEN_SKIPPED',
      tokenId,
      departmentName: departments.find((d) => d.id === targetToken.departmentId)?.name,
      performedBy: 'Administrator',
      details: `Token skipped: ${reason}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    playChime('alert');
    showToast({
      type: 'warning',
      title: `Token ${tokenId} Skipped`,
      message: `Reason: ${reason}`,
    });
  }, [tokens, counters, departments, rebalanceQueue, playChime, showToast]);

  // Cancel Token with reason
  const cancelToken = useCallback((tokenId: string, reason: string) => {
    const targetToken = tokens.find((t) => t.id === tokenId);
    if (!targetToken) return;

    const now = new Date().toISOString();

    const updatedCounters = counters.map((c) => {
      if (c.currentTokenId === tokenId || c.id === targetToken.assignedCounterId) {
        return { ...c, status: 'OPEN' as CounterStatus, currentTokenId: undefined };
      }
      return c;
    });
    setCounters(updatedCounters);

    const updatedTokens = tokens.map((t) => {
      if (t.id === tokenId) {
        return {
          ...t,
          status: 'CANCELLED' as const,
          cancelledReason: reason,
          queuePosition: 0,
          estimatedWaitMinutes: 0,
        };
      }
      return t;
    });

    const rebalanced = rebalanceQueue(updatedTokens, updatedCounters, targetToken.departmentId);
    setTokens(rebalanced);

    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      action: 'TOKEN_CANCELLED',
      tokenId,
      departmentName: departments.find((d) => d.id === targetToken.departmentId)?.name,
      performedBy: currentRole === 'PATIENT' ? 'Patient' : 'Administrator',
      details: `Token cancelled: ${reason}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showToast({
      type: 'info',
      title: `Token ${tokenId} Cancelled`,
      message: `Token has been removed from the active queue.`,
    });
  }, [tokens, counters, departments, rebalanceQueue, currentRole, showToast]);

  // Toggle Counter Status
  const toggleCounterStatus = useCallback((counterId: string, specificStatus?: CounterStatus) => {
    const target = counters.find((c) => c.id === counterId);
    if (!target) return;

    let nextStatus: CounterStatus = specificStatus || 'OPEN';
    if (!specificStatus) {
      if (target.status === 'OPEN') nextStatus = 'PAUSED';
      else if (target.status === 'PAUSED') nextStatus = 'CLOSED';
      else if (target.status === 'CLOSED') nextStatus = 'OPEN';
      else if (target.status === 'BUSY') nextStatus = 'OPEN';
    }

    const updatedCounters = counters.map((c) => {
      if (c.id === counterId) {
        return {
          ...c,
          status: nextStatus,
          currentTokenId: nextStatus === 'CLOSED' || nextStatus === 'PAUSED' ? undefined : c.currentTokenId,
        };
      }
      return c;
    });
    setCounters(updatedCounters);

    // Rebalance department queue
    const rebalanced = rebalanceQueue(tokens, updatedCounters, target.departmentId);
    setTokens(rebalanced);

    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'COUNTER_STATUS_CHANGED',
      counterNumber: target.counterNumber,
      departmentName: departments.find((d) => d.id === target.departmentId)?.name,
      performedBy: 'Administration',
      details: `${target.counterNumber} status changed from ${target.status} to ${nextStatus}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showToast({
      type: 'info',
      title: `${target.counterNumber} Updated`,
      message: `Status is now ${nextStatus}. Waiting times recalculated.`,
    });
  }, [counters, tokens, departments, rebalanceQueue, showToast]);

  // Add New Counter
  const addCounter = useCallback((newCounter: {
    counterNumber: string;
    departmentId: string;
    assignedDoctorId?: string;
    roomNumber: string;
  }) => {
    const id = `ctr-${Date.now()}`;
    const counter: Counter = {
      ...newCounter,
      id,
      status: 'OPEN',
      servicedTodayCount: 0,
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedCounters = [...counters, counter];
    setCounters(updatedCounters);

    const rebalanced = rebalanceQueue(tokens, updatedCounters, newCounter.departmentId);
    setTokens(rebalanced);

    showToast({
      type: 'success',
      title: 'Counter Added',
      message: `${newCounter.counterNumber} opened for service!`,
    });
  }, [counters, tokens, rebalanceQueue, showToast]);

  // Update Department Consultation Duration
  const updateDepartmentDuration = useCallback((departmentId: string, minutes: number) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === departmentId ? { ...d, avgDurationMinutes: minutes } : d))
    );

    const dept = departments.find((d) => d.id === departmentId);
    const activeCount = countActiveCounters(counters, departmentId);
    const rebalanced = updateDepartmentQueue(tokens, departmentId, activeCount, minutes);
    setTokens(rebalanced);

    showToast({
      type: 'info',
      title: 'Service Duration Updated',
      message: `${dept?.name} average consultation set to ${minutes} mins. Estimates refreshed.`,
    });
  }, [departments, counters, tokens, showToast]);

  // Book Appointment
  const bookAppointment = useCallback((params: {
    patientName: string;
    patientPhone: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    departmentId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
  }): Appointment => {
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const id = `APT-${randNum}`;

    const newAppointment: Appointment = {
      id,
      ...params,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    const dept = departments.find((d) => d.id === params.departmentId);
    const audit: QueueAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'APPOINTMENT_BOOKED',
      departmentName: dept?.name,
      performedBy: 'Patient Web Portal',
      details: `Appointment ${id} confirmed for ${params.patientName} on ${params.date} at ${params.timeSlot}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    playChime('success');
    showToast({
      type: 'success',
      title: 'Appointment Booked!',
      message: `Confirmation ID: ${id}. Date: ${params.date} at ${params.timeSlot}`,
    });

    return newAppointment;
  }, [departments, playChime, showToast]);

  // Cancel Appointment
  const cancelAppointment = useCallback((appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a))
    );
    showToast({
      type: 'info',
      title: 'Appointment Cancelled',
      message: `Appointment ${appointmentId} has been cancelled.`,
    });
  }, [showToast]);

  // Check In Appointment (converts confirmed appointment to queue token on arrival)
  const checkInAppointment = useCallback((appointmentId: string): Token | null => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt || apt.status !== 'CONFIRMED') {
      showToast({
        type: 'error',
        title: 'Check-in Error',
        message: 'Appointment cannot be checked in or is already active.',
      });
      return null;
    }

    const priority: PriorityLevel = apt.patientAge >= config.prioritySeniorAgeThreshold ? 'SENIOR' : 'STANDARD';

    const token = generateToken({
      departmentId: apt.departmentId,
      doctorId: apt.doctorId,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      patientAge: apt.patientAge,
      patientGender: apt.patientGender,
      reason: `[Scheduled Apt: ${apt.timeSlot}] ${apt.reason}`,
      type: 'APPOINTMENT',
      priority,
      priorityReason: priority === 'SENIOR' ? 'Senior Citizen Appointment Priority' : 'Pre-scheduled Slot Check-in',
      appointmentId: apt.id,
    });

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'CHECKED_IN', checkedInTokenId: token.id } : a))
    );

    showToast({
      type: 'success',
      title: 'Arrival Checked-In!',
      message: `Welcome ${apt.patientName}! Your queue token is ${token.id}.`,
    });

    return token;
  }, [appointments, config.prioritySeniorAgeThreshold, generateToken, showToast]);

  // Update Hospital Config
  const updateHospitalConfig = useCallback((updates: Partial<HospitalConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    showToast({
      type: 'success',
      title: 'Configuration Saved',
      message: 'Hospital operating parameters updated successfully.',
    });
  }, [showToast]);

  // Reset Demo Data
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_departments`);
    localStorage.removeItem(`${STORAGE_KEY}_doctors`);
    localStorage.removeItem(`${STORAGE_KEY}_counters`);
    localStorage.removeItem(`${STORAGE_KEY}_tokens`);
    localStorage.removeItem(`${STORAGE_KEY}_appointments`);
    localStorage.removeItem(`${STORAGE_KEY}_config`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);

    setDepartments(INITIAL_DEPARTMENTS);
    setDoctors(INITIAL_DOCTORS);
    setCounters(INITIAL_COUNTERS);
    setTokens(INITIAL_TOKENS);
    setAppointments(INITIAL_APPOINTMENTS);
    setConfig(INITIAL_HOSPITAL_CONFIG);
    setActiveTrackingTokenId('GM-103');
    setAuditLogs([
      {
        id: 'log-reset',
        timestamp: new Date().toISOString(),
        action: 'TOKEN_CALLED',
        tokenId: 'GM-102',
        counterNumber: 'Counter 2',
        departmentName: 'General Medicine',
        performedBy: 'Demo System',
        details: 'Demonstration dataset reset to initial state',
      },
    ]);

    playChime('chime');
    showToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'Prototype reset to clean state with 10 departments and active tokens.',
    });
  }, [playChime, showToast]);

  return (
    <QueueContext.Provider
      value={{
        departments,
        doctors,
        counters,
        tokens,
        appointments,
        auditLogs,
        config,
        currentRole,
        activeTrackingTokenId,
        activeView,
        toasts,
        audioEnabled,
        themeMode,
        setCurrentRole,
        setActiveTrackingTokenId,
        setActiveView,
        toggleThemeMode,
        setAudioEnabled,
        playChime,
        dismissToast,
        showToast,
        generateToken,
        callToken,
        startServingToken,
        completeToken,
        skipToken,
        cancelToken,
        toggleCounterStatus,
        addCounter,
        updateDepartmentDuration,
        bookAppointment,
        cancelAppointment,
        checkInAppointment,
        updateHospitalConfig,
        resetDemoData,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
