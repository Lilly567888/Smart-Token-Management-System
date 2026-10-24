/**
 * Smart Token Management System - Appointment Booking System
 * Light Lavender Outpatient Scheduling Flow
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Department, Doctor } from '../../types/queue';
import {
  X,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Sparkles,
  Phone,
  Stethoscope,
  Trash2,
} from 'lucide-react';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDepartmentId?: string;
}

const AVAILABLE_SLOTS = [
  '08:30 AM',
  '09:15 AM',
  '10:00 AM',
  '10:45 AM',
  '11:30 AM',
  '02:00 PM',
  '02:45 PM',
  '03:30 PM',
  '04:15 PM',
  '05:00 PM',
];

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  initialDepartmentId,
}) => {
  const {
    departments,
    doctors,
    appointments,
    bookAppointment,
    cancelAppointment,
    checkInAppointment,
    setActiveTrackingTokenId,
    setActiveView,
  } = useQueue();

  const [activeTab, setActiveTab] = useState<'BOOK' | 'MY_APPOINTMENTS'>('BOOK');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    initialDepartmentId || departments[0]?.id || 'dept-gm'
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-24');
  const [selectedSlot, setSelectedSlot] = useState<string>('09:15 AM');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('female');
  const [reason, setReason] = useState<string>('');
  const [bookedConfirmation, setBookedConfirmation] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId);
    }
  }, [initialDepartmentId]);

  const deptDoctors = useMemo(() => {
    return doctors.filter((doc) => doc.departmentId === selectedDeptId);
  }, [doctors, selectedDeptId]);

  useEffect(() => {
    if (deptDoctors.length > 0) {
      setSelectedDoctorId(deptDoctors[0].id);
    } else {
      setSelectedDoctorId('');
    }
  }, [deptDoctors]);

  const upcomingDates = useMemo(() => {
    const list = [];
    const base = new Date('2026-10-24T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      list.push({ iso, dayName, monthDay });
    }
    return list;
  }, []);

  const bookedSlots = useMemo(() => {
    return appointments
      .filter((a) => a.date === selectedDate && a.doctorId === selectedDoctorId && a.status !== 'CANCELLED')
      .map((a) => a.timeSlot);
  }, [appointments, selectedDate, selectedDoctorId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!patientName.trim()) err.patientName = 'Patient full name is required.';
    if (!patientPhone.trim()) err.patientPhone = 'Phone number is required.';
    if (!patientAge) err.patientAge = 'Patient age is required.';
    if (!reason.trim()) err.reason = 'Please provide the primary reason for consultation.';
    if (bookedSlots.includes(selectedSlot)) err.slot = 'This slot has already been reserved. Please select another time.';

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const newApt = bookAppointment({
      departmentId: selectedDeptId,
      doctorId: selectedDoctorId,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: parseInt(patientAge, 10),
      patientGender,
      date: selectedDate,
      timeSlot: selectedSlot,
      reason: reason.trim(),
    });

    setBookedConfirmation(newApt.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden my-6">
        {/* Header - Light Royal Lavender */}
        <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-purple-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close appointments"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-white/20 text-purple-200">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
              Outpatient Scheduling System
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">Specialist Appointment Booking</h2>
          <p className="text-xs text-purple-100 mt-0.5">
            Pre-schedule consultation slots. Real-time arrival check-in converts bookings into queue tokens.
          </p>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              onClick={() => {
                setActiveTab('BOOK');
                setBookedConfirmation(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'BOOK'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-purple-100 hover:bg-white/10'
              }`}
            >
              Book New Appointment
            </button>
            <button
              onClick={() => setActiveTab('MY_APPOINTMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'MY_APPOINTMENTS'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-purple-100 hover:bg-white/10'
              }`}
            >
              Upcoming &amp; Past Appointments ({appointments.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {bookedConfirmation ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Appointment Successfully Confirmed!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your confirmation number is{' '}
                <strong className="text-purple-700 font-mono text-sm">{bookedConfirmation}</strong>.
              </p>

              <div className="bg-purple-50/70 p-4 rounded-2xl max-w-sm mx-auto text-left text-xs space-y-2 border border-purple-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date &amp; Slot:</span>
                  <span className="font-bold text-slate-900">
                    {selectedDate} at {selectedSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold text-slate-900">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room:</span>
                  <span className="font-bold text-slate-900">{selectedDoctor?.roomNumber}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-purple-200">
                  Note: Upon arrival at the hospital lobby on your appointment day, click &apos;Check In&apos; to receive your digital queue token.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setBookedConfirmation(null);
                    setActiveTab('MY_APPOINTMENTS');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  View My Appointments
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : activeTab === 'BOOK' ? (
            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialist Doctor
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                  >
                    {deptDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedDoctor && (
                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{selectedDoctor.name}</span>
                    <p className="text-[11px] text-slate-500">
                      {selectedDoctor.specialty} • {selectedDoctor.experienceYears} Years Exp • {selectedDoctor.qualifications}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Available Today
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Date
                </label>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {upcomingDates.map((item) => {
                    const isSelected = selectedDate === item.iso;
                    return (
                      <button
                        type="button"
                        key={item.iso}
                        onClick={() => setSelectedDate(item.iso)}
                        className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold shadow-xs'
                            : 'bg-purple-50/40 hover:bg-purple-100/60 text-slate-700 border border-purple-100'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-80">{item.dayName}</div>
                        <div className="text-xs font-extrabold mt-0.5">{item.monthDay}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Available Consultation Slots ({selectedDate})
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          isBooked
                            ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed border border-slate-200'
                            : isSelected
                            ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-600/30'
                            : 'bg-white hover:bg-purple-50 text-slate-800 border border-purple-200'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {errors.slot && <p className="text-[11px] text-rose-600 mt-1">{errors.slot}</p>}
              </div>

              <div className="space-y-3 pt-2 border-t border-purple-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Thomas Shelby"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                    />
                    {errors.patientName && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{errors.patientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                    />
                    {errors.patientPhone && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{errors.patientPhone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 46"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                    />
                    {errors.patientAge && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{errors.patientAge}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reason for Visit *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Routine consultation / followup"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                    />
                    {errors.reason && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{errors.reason}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Confirm Appointment
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No appointments booked yet.
                </div>
              ) : (
                appointments.map((apt) => {
                  const dept = departments.find((d) => d.id === apt.departmentId);
                  const doc = doctors.find((d) => d.id === apt.doctorId);
                  return (
                    <div
                      key={apt.id}
                      className="p-4 rounded-2xl border border-purple-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{apt.patientName}</span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            {apt.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              apt.status === 'CONFIRMED'
                                ? 'bg-purple-100 text-purple-800'
                                : apt.status === 'CHECKED_IN'
                                ? 'bg-violet-100 text-violet-800'
                                : apt.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {dept?.name} • {doc?.name} ({doc?.roomNumber})
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Date: {apt.date} at {apt.timeSlot}</span>
                          <span>•</span>
                          <span>{apt.reason}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {apt.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => {
                                const token = checkInAppointment(apt.id);
                                if (token) {
                                  setActiveTrackingTokenId(token.id);
                                  setActiveView('tracker');
                                  onClose();
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
                            >
                              Check In Now
                            </button>
                            <button
                              onClick={() => cancelAppointment(apt.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {apt.status === 'CHECKED_IN' && apt.checkedInTokenId && (
                          <button
                            onClick={() => {
                              setActiveTrackingTokenId(apt.checkedInTokenId!);
                              setActiveView('tracker');
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer"
                          >
                            Track Token {apt.checkedInTokenId}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
