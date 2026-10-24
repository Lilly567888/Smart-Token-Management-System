/**
 * Smart Token Management System - Patient Portal Home Screen
 * Light Lavender Healthcare Aesthetic
 */

import React, { useState, useMemo } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Department } from '../../types/queue';
import { calculateWaitTime } from '../../utils/queueCalculator';
import {
  Search,
  Ticket,
  Clock,
  Radio,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Bone,
  Baby,
  Smile,
  Eye,
  Activity,
  FlaskConical,
  Ear,
  Info,
} from 'lucide-react';

interface PatientHomeProps {
  onOpenTokenGen: (deptId?: string) => void;
  onOpenAppointments: (deptId?: string) => void;
}

const getDepartmentIcon = (iconName: string) => {
  switch (iconName) {
    case 'Stethoscope':
      return Stethoscope;
    case 'HeartPulse':
      return HeartPulse;
    case 'Bone':
      return Bone;
    case 'Baby':
      return Baby;
    case 'Sparkles':
      return Sparkles;
    case 'Ear':
      return Ear;
    case 'Eye':
      return Eye;
    case 'Activity':
      return Activity;
    case 'Smile':
      return Smile;
    case 'FlaskConical':
      return FlaskConical;
    default:
      return Stethoscope;
  }
};

export const PatientHome: React.FC<PatientHomeProps> = ({
  onOpenTokenGen,
  onOpenAppointments,
}) => {
  const {
    departments,
    tokens,
    counters,
    appointments,
    checkInAppointment,
    setActiveView,
    setActiveTrackingTokenId,
    config,
  } = useQueue();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OPD' | 'LAB'>('ALL');

  // Calculate live hospital-wide metrics
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const servingTokens = tokens.filter((t) => t.status === 'SERVING');
  const activeCountersCount = counters.filter(
    (c) => c.status === 'OPEN' || c.status === 'BUSY'
  ).length;

  const avgWaitTime = useMemo(() => {
    if (waitingTokens.length === 0) return 0;
    const total = waitingTokens.reduce((sum, t) => sum + t.estimatedWaitMinutes, 0);
    return Math.round(total / waitingTokens.length);
  }, [waitingTokens]);

  const crowdLevel = useMemo(() => {
    if (waitingTokens.length > 20 || avgWaitTime > 30) {
      return { label: 'Heavy Traffic', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
    }
    if (waitingTokens.length > 10 || avgWaitTime > 15) {
      return { label: 'Moderate Load', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    }
    return { label: 'Normal Flow', color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' };
  }, [waitingTokens.length, avgWaitTime]);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedFilter === 'LAB') {
        return matchesSearch && dept.code === 'DL';
      }
      if (selectedFilter === 'OPD') {
        return matchesSearch && dept.code !== 'DL';
      }
      return matchesSearch;
    });
  }, [departments, searchQuery, selectedFilter]);

  // Upcoming confirmed appointments
  const upcomingAppointments = appointments.filter((a) => a.status === 'CONFIRMED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white">
      {/* Emergency Triage Safety Banner */}
      <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-rose-700">
              Immediate Emergency Triage Notice
            </h2>
            <p className="text-xs text-rose-800 font-medium mt-0.5 leading-relaxed">
              If you or a patient are experiencing chest pain, severe bleeding, or acute respiratory distress,
              <strong> do not register for a standard digital queue</strong>. Proceed directly to the{' '}
              <span className="underline font-bold">{config.emergencyRoomLocation}</span> or dial{' '}
              <span className="font-bold">{config.emergencyHotline}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Light Lavender Hero Welcome & Live Crowd Pulse */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50/90 via-purple-50/50 to-white border border-purple-200/80 text-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200 text-xs font-semibold text-purple-800">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Real-Time Intelligent Patient Flow</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Welcome to <span className="text-purple-700">{config.hospitalName}</span>
            </h1>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Experience seamless outpatient care with zero waiting uncertainty. Generate an instant digital queue token, track your live turn, or pre-book specialist appointments.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenTokenGen()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                Get Digital Token
              </button>
              <button
                onClick={() => setActiveView('tracker')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-purple-600 animate-pulse" />
                Track Live Token
              </button>
              <button
                onClick={() => onOpenAppointments()}
                className="px-5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200/80 text-purple-800 font-semibold text-xs border border-purple-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-purple-600" />
                Book Appointment
              </button>
            </div>
          </div>

          {/* Live Hospital Telemetry Card - Light & Airy */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  Hospital Operating Status
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${crowdLevel.color}`}>
                {crowdLevel.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/70">
                <div className="text-[11px] text-purple-800 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  Currently Waiting
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {waitingTokens.length}{' '}
                  <span className="text-xs font-normal text-purple-600">patients</span>
                </div>
              </div>

              <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/70">
                <div className="text-[11px] text-purple-800 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Avg Wait Time
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ~{avgWaitTime}{' '}
                  <span className="text-xs font-normal text-purple-600">mins</span>
                </div>
              </div>

              <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/70">
                <div className="text-[11px] text-purple-800 font-medium flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-600" />
                  Active Counters
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {activeCountersCount}{' '}
                  <span className="text-xs font-normal text-purple-600">operating</span>
                </div>
              </div>

              <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/70">
                <div className="text-[11px] text-purple-800 font-medium flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                  In Consultation
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {servingTokens.length}{' '}
                  <span className="text-xs font-normal text-purple-600">rooms</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>Hours: {config.operatingHours}</span>
              <span className="text-purple-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-purple-600" />
                All Counters Synced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Arrival Check-in Banner */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50/70 to-violet-50/50 border border-purple-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Scheduled Appointments Ready for Arrival Check-in
              </h3>
            </div>
            <span className="text-[11px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
              {upcomingAppointments.length} Booked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingAppointments.map((apt) => {
              const dept = departments.find((d) => d.id === apt.departmentId);
              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl p-3.5 border border-purple-100 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-semibold">
                        {apt.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {dept?.name} • Today at {apt.timeSlot}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const token = checkInAppointment(apt.id);
                      if (token) {
                        setActiveTrackingTokenId(token.id);
                        setActiveView('tracker');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                    title="Check-in and get queue token"
                  >
                    Check In
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Department Directory Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Hospital Departments &amp; Live Counter Wait Times
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any clinical department to register for an immediate token or pre-book a consultation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="flex bg-purple-50/70 p-1 rounded-xl text-xs font-semibold border border-purple-100">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'ALL' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                All (10)
              </button>
              <button
                onClick={() => setSelectedFilter('OPD')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'OPD' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Clinical OPD
              </button>
              <button
                onClick={() => setSelectedFilter('LAB')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'LAB' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Diagnostics
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* 10 Clinical Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => {
            const Icon = getDepartmentIcon(dept.iconName);

            // Department queue telemetry
            const deptWaiting = tokens.filter(
              (t) => t.departmentId === dept.id && t.status === 'WAITING'
            );
            const deptActiveCounters = counters.filter(
              (c) => c.departmentId === dept.id && (c.status === 'OPEN' || c.status === 'BUSY')
            );
            const deptServing = tokens.find(
              (t) => t.departmentId === dept.id && t.status === 'SERVING'
            );

            const estimation = calculateWaitTime(
              deptWaiting.length,
              dept.avgDurationMinutes,
              deptActiveCounters.length
            );

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-purple-100/90 p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Code & Live Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 text-purple-700 border border-purple-200/80 group-hover:bg-purple-100 transition-colors"
                      >
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                            {dept.name}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          Code: {dept.code}
                        </span>
                      </div>
                    </div>

                    {/* Active Counters Tag */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        deptActiveCounters.length > 0
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {deptActiveCounters.length > 0
                        ? `${deptActiveCounters.length} Counter(s) Open`
                        : 'Counters Paused'}
                    </span>
                  </div>

                  {/* Description & Location */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="text-[11px] text-slate-500 mb-4 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>{dept.location}</span>
                  </div>

                  {/* Queue Metrics Bar */}
                  <div className="bg-purple-50/40 rounded-xl p-3 border border-purple-100/70 mb-4 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-purple-700/70 tracking-wider">
                        Queue Size
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">
                        {deptWaiting.length}{' '}
                        <span className="text-[10px] font-normal text-slate-500">waiting</span>
                      </div>
                    </div>

                    <div className="border-l border-purple-200/80">
                      <div className="text-[10px] uppercase font-bold text-purple-700/70 tracking-wider">
                        Est. Wait Time
                      </div>
                      <div
                        className={`text-base font-extrabold mt-0.5 ${
                          estimation.status === 'NO_COUNTERS'
                            ? 'text-rose-600 text-xs mt-1'
                            : estimation.status === 'DELAYED'
                            ? 'text-amber-600'
                            : 'text-purple-700'
                        }`}
                      >
                        {estimation.status === 'NO_COUNTERS'
                          ? 'Pending Staff'
                          : `~${estimation.waitMinutes} mins`}
                      </div>
                    </div>
                  </div>

                  {/* Serving indicator if active */}
                  {deptServing && (
                    <div className="text-[11px] text-slate-600 bg-purple-50/80 border border-purple-200/70 px-2.5 py-1.5 rounded-lg mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-purple-900 font-semibold">
                        <Radio className="w-3 h-3 text-purple-600 animate-pulse" />
                        Now Serving:
                      </span>
                      <span className="font-mono font-bold text-purple-950">
                        {deptServing.id}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-purple-50">
                  <button
                    onClick={() => onOpenTokenGen(dept.id)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    Get Token
                  </button>
                  <button
                    onClick={() => onOpenAppointments(dept.id)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Book scheduled slot"
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
