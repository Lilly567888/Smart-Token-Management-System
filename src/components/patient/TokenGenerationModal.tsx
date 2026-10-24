/**
 * Smart Token Management System - Digital Token Registration Workflow
 * Light Lavender Healthcare Aesthetic
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Department, Doctor, PriorityLevel } from '../../types/queue';
import { calculateWaitTime } from '../../utils/queueCalculator';
import confetti from 'canvas-confetti';
import {
  X,
  Ticket,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  User,
  Phone,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Accessibility,
  HeartHandshake,
  Baby,
} from 'lucide-react';

interface TokenGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDepartmentId?: string;
  onTokenGenerated: (tokenId: string) => void;
}

export const TokenGenerationModal: React.FC<TokenGenerationModalProps> = ({
  isOpen,
  onClose,
  initialDepartmentId,
  onTokenGenerated,
}) => {
  const { departments, doctors, counters, tokens, generateToken } = useQueue();

  const [step, setStep] = useState<number>(1);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    initialDepartmentId || departments[0]?.id || 'dept-gm'
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('any');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('female');
  const [visitReason, setVisitReason] = useState<string>('');
  const [tokenType, setTokenType] = useState<'WALK_IN' | 'APPOINTMENT'>('WALK_IN');
  const [priority, setPriority] = useState<PriorityLevel>('STANDARD');
  const [priorityReason, setPriorityReason] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId);
    }
  }, [initialDepartmentId]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
    }
  }, [isOpen]);

  const currentDept = useMemo(() => {
    return departments.find((d) => d.id === selectedDeptId) || departments[0];
  }, [departments, selectedDeptId]);

  const deptDoctors = useMemo(() => {
    return doctors.filter((doc) => doc.departmentId === selectedDeptId && doc.availableToday);
  }, [doctors, selectedDeptId]);

  const deptWaitingTokens = useMemo(() => {
    return tokens.filter((t) => t.departmentId === selectedDeptId && t.status === 'WAITING');
  }, [tokens, selectedDeptId]);

  const deptActiveCounters = useMemo(() => {
    return counters.filter(
      (c) => c.departmentId === selectedDeptId && (c.status === 'OPEN' || c.status === 'BUSY')
    );
  }, [counters, selectedDeptId]);

  const liveEstimation = useMemo(() => {
    return calculateWaitTime(
      deptWaitingTokens.length,
      currentDept ? currentDept.avgDurationMinutes : 10,
      deptActiveCounters.length
    );
  }, [deptWaitingTokens.length, currentDept, deptActiveCounters.length]);

  if (!isOpen) return null;

  const validateStep3 = () => {
    const err: Record<string, string> = {};
    if (!patientName.trim()) {
      err.patientName = 'Patient full name is required.';
    }
    if (!patientPhone.trim()) {
      err.patientPhone = 'Contact phone number is required.';
    }
    const ageNum = parseInt(patientAge, 10);
    if (!patientAge || isNaN(ageNum) || ageNum < 0 || ageNum > 125) {
      err.patientAge = 'Please enter a valid age (0–125).';
    }
    if (!visitReason.trim()) {
      err.visitReason = 'Primary reason for consultation is required.';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (step === 3 && !validateStep3()) {
      return;
    }
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handleSubmit = () => {
    if (!validateStep3()) {
      setStep(3);
      return;
    }

    const ageNum = parseInt(patientAge, 10);
    let effectivePriority = priority;
    let effectivePriorityReason = priorityReason;
    if (ageNum >= 65 && priority === 'STANDARD') {
      effectivePriority = 'SENIOR';
      effectivePriorityReason = `Senior Citizen (Age ${ageNum}) — Fair priority routing applied`;
    }

    const createdToken = generateToken({
      departmentId: selectedDeptId,
      doctorId: selectedDoctorId === 'any' ? undefined : selectedDoctorId,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: ageNum,
      patientGender,
      reason: visitReason.trim(),
      type: tokenType,
      priority: effectivePriority,
      priorityReason: effectivePriorityReason,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#A78BFA', '#7C3AED', '#C4B5FD', '#DDD6FE', '#8B5CF6'],
      });
    } catch {
      // Ignore in non-browser
    }

    onTokenGenerated(createdToken.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-purple-100 overflow-hidden my-6">
        {/* Header - Light Royal Lavender Gradient */}
        <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-purple-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close registration modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-white/20 text-purple-200">
              <Ticket className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
              Queue Registration Engine
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">Generate Digital Queue Token</h2>
          <p className="text-xs text-purple-100 mt-1">
            Fast, contactless check-in with dynamic algorithmic wait calculation.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/15 text-[11px] font-semibold text-purple-200">
            <span className={step >= 1 ? 'text-white font-bold' : 'opacity-60'}>1. Department</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className={step >= 2 ? 'text-white font-bold' : 'opacity-60'}>2. Doctor</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className={step >= 3 ? 'text-white font-bold' : 'opacity-60'}>3. Details</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className={step >= 4 ? 'text-white font-bold' : 'opacity-60'}>4. Priority</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className={step >= 5 ? 'text-white font-bold' : 'opacity-60'}>5. Confirm</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1: Select Hospital Department</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the specialized clinical OPD or diagnostic department for your visit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {departments.map((dept) => {
                  const isSelected = selectedDeptId === dept.id;
                  const waiting = tokens.filter(
                    (t) => t.departmentId === dept.id && t.status === 'WAITING'
                  ).length;
                  const activeCtrs = counters.filter(
                    (c) => c.departmentId === dept.id && (c.status === 'OPEN' || c.status === 'BUSY')
                  ).length;

                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDeptId(dept.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-purple-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{dept.name}</div>
                          <div className="text-[10px] font-mono text-purple-700 mt-0.5">
                            Code: {dept.code}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-purple-50">
                        <span>{activeCtrs} Counter(s)</span>
                        <span className="font-medium text-purple-800">{waiting} in queue</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 2: Select Doctor (Optional)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Department: <strong className="text-purple-700">{currentDept?.name}</strong>
                </p>
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedDoctorId('any')}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedDoctorId === 'any'
                      ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-600/20'
                      : 'border-slate-200 hover:border-purple-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Any Available Doctor (Fastest Turn)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Assigned automatically to the first free counter in {currentDept?.name}
                      </div>
                    </div>
                  </div>
                  {selectedDoctorId === 'any' && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                </button>

                {deptDoctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-purple-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{doc.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {doc.specialty} • {doc.roomNumber} ({doc.shiftHours})
                          </div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3: Enter Patient Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fictional demo data is acceptable. Masked privacy is applied on public displays.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Johnathan Miller"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                  {errors.patientName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.patientName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400 bg-white"
                    />
                    {errors.patientPhone && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.patientPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age (Years) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      min="0"
                      max="125"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400 bg-white"
                    />
                    {errors.patientAge && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.patientAge}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Biological Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['female', 'male', 'other'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setPatientGender(g)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                          patientGender === g
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Symptoms or Consultation Reason *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Mild persistent dry cough for 3 days and headache"
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                  {errors.visitReason && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.visitReason}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Step 4: Registration Type &amp; Fair Priority
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select service category. Priority cases are audited transparently.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Visit Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTokenType('WALK_IN')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      tokenType === 'WALK_IN'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold">Standard Walk-in Token</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Direct lobby arrival</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTokenType('APPOINTMENT')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      tokenType === 'APPOINTMENT'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold">Appointment Check-in</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Pre-booked online slot</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority Category</label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'STANDARD' as PriorityLevel,
                      title: 'Standard Queue',
                      desc: 'Standard FIFO order based on registration timestamp',
                      icon: User,
                    },
                    {
                      id: 'SENIOR' as PriorityLevel,
                      title: 'Senior Citizen (65+ Years)',
                      desc: 'Priority queue positioning for elderly patients',
                      icon: HeartHandshake,
                    },
                    {
                      id: 'ACCESSIBILITY' as PriorityLevel,
                      title: 'Accessibility & Mobility Assistance',
                      desc: 'Wheelchair assistance, sensory, or mobility impairment',
                      icon: Accessibility,
                    },
                    {
                      id: 'PEDIATRIC_URGENT' as PriorityLevel,
                      title: 'Pediatric Urgent Care',
                      desc: 'Infants or small children with distress',
                      icon: Baby,
                    },
                  ].map((p) => {
                    const isSelected = priority === p.id;
                    const Icon = p.icon;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setPriority(p.id);
                          if (p.id !== 'STANDARD' && !priorityReason) {
                            setPriorityReason(`Requested ${p.title} assistance`);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600'
                            : 'border-slate-200 hover:border-purple-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-purple-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{p.title}</div>
                            <div className="text-[10px] text-slate-500">{p.desc}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {priority !== 'STANDARD' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Justification Note
                  </label>
                  <input
                    type="text"
                    value={priorityReason}
                    onChange={(e) => setPriorityReason(e.target.value)}
                    placeholder="e.g. Senior citizen accompanied by family"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 5: Confirm Queue Registration</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify your registration details before token generation.
                </p>
              </div>

              <div className="bg-purple-50/40 rounded-2xl p-4 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-purple-100">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-xs font-bold text-slate-900">{patientName}</span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-purple-100">
                  <span className="text-xs text-slate-500">Department:</span>
                  <span className="text-xs font-bold text-purple-700">
                    {currentDept.name} ({currentDept.code})
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-purple-100">
                  <span className="text-xs text-slate-500">Doctor Preference:</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedDoctorId === 'any'
                      ? 'First Available Counter Doctor'
                      : deptDoctors.find((d) => d.id === selectedDoctorId)?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-purple-100">
                  <span className="text-xs text-slate-500">Priority Level:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {priority}
                  </span>
                </div>

                {/* Calculation Engine Output */}
                <div className="bg-white rounded-xl p-3 border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      Calculated Estimated Wait
                    </span>
                    <span className="text-sm font-extrabold text-purple-700">
                      {liveEstimation.status === 'NO_COUNTERS'
                        ? 'Counters Paused'
                        : `~${liveEstimation.waitMinutes} mins`}
                    </span>
                  </div>

                  <div className="text-[11px] text-purple-900 bg-purple-50/70 p-2 rounded-lg font-mono border border-purple-100">
                    Formula: {liveEstimation.formulaExplanation}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Estimated waiting time — this is an algorithmic approximation based on current queue load, not a guarantee.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-purple-50">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-sm shadow-purple-600/30"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white transition-all cursor-pointer shadow-md shadow-purple-600/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate My Token
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
