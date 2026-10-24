/**
 * Smart Token Management System - Hackathon Demonstration Tour Guide
 * Light Lavender Healthcare Aesthetic
 */

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  UserCheck,
  Stethoscope,
  Ticket,
  Clock,
  Radio,
  ShieldCheck,
  PhoneCall,
  CheckSquare,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface HackathonTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTokenGen: (deptId?: string) => void;
}

export const HackathonTourModal: React.FC<HackathonTourModalProps> = ({
  isOpen,
  onClose,
  onOpenTokenGen,
}) => {
  const {
    setActiveView,
    setCurrentRole,
    setActiveTrackingTokenId,
    tokens,
    callToken,
    startServingToken,
    completeToken,
  } = useQueue();

  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Step 1: Patient Home Screen & Department Directory',
      badge: 'Patient View',
      icon: Stethoscope,
      description:
        'Explore the patient home screen with live hospital crowd metrics, emergency triage alerts, and 10 active clinical departments showing live queue lengths.',
      actionLabel: 'Go to Patient Home',
      onAction: () => {
        setCurrentRole('PATIENT');
        setActiveView('patient');
      },
    },
    {
      title: 'Step 2: Select General Medicine Department',
      badge: 'Patient View',
      icon: UserCheck,
      description:
        'General Medicine has 2 active counters and an average 10-minute consultation duration. Click to initiate registration.',
      actionLabel: 'Select General Medicine',
      onAction: () => {
        setCurrentRole('PATIENT');
        setActiveView('patient');
        onOpenTokenGen('dept-gm');
        onClose();
      },
    },
    {
      title: 'Step 3 & 4: Register Patient & Generate Digital Token',
      badge: 'Registration Engine',
      icon: Ticket,
      description:
        'Fill patient name, choose Walk-In or Appointment, select Fair Priority (e.g. Senior or Standard), and generate a unique dynamic Token ID (e.g. GM-104).',
      actionLabel: 'Open Token Generator',
      onAction: () => {
        onOpenTokenGen('dept-gm');
        onClose();
      },
    },
    {
      title: 'Step 5 & 6: Inspect Estimated Waiting Time & Live Tracker',
      badge: 'Smart Calculation',
      icon: Clock,
      description:
        'The formula (Patients Ahead × 10m) ÷ 2 counters gives the live estimate. Open the Live Token Tracker to view real-time countdown and status.',
      actionLabel: 'Open Live Tracker',
      onAction: () => {
        setActiveTrackingTokenId('GM-103');
        setActiveView('tracker');
        onClose();
      },
    },
    {
      title: 'Step 7: Switch to Administration Dashboard',
      badge: 'Hospital Operations',
      icon: ShieldCheck,
      description:
        'Switch into the hospital staff view to oversee all live queue tables, counter loads, doctor rooms, and urgent priority cases.',
      actionLabel: 'Switch to Admin View',
      onAction: () => {
        setCurrentRole('ADMIN');
        setActiveView('admin');
        onClose();
      },
    },
    {
      title: 'Step 8: Call the Next Waiting Patient',
      badge: 'Staff Action',
      icon: PhoneCall,
      description:
        'Staff calls the next eligible patient (e.g., GM-103) to an available counter. Notice the audio chime simulation and real-time status change to CALLED.',
      actionLabel: 'Auto-Call Next Token (GM-103)',
      onAction: () => {
        setCurrentRole('ADMIN');
        setActiveView('admin');
        callToken('GM-103', 'ctr-2');
        onClose();
      },
    },
    {
      title: 'Step 9 & 10: Start Consultation & Mark Completed',
      badge: 'Doctor Workflow',
      icon: CheckSquare,
      description:
        'Doctor begins consultation (SERVING), then finishes consultation (COMPLETED). The counter automatically frees up and queue positions decrement.',
      actionLabel: 'Complete Active Consultation',
      onAction: () => {
        setCurrentRole('ADMIN');
        setActiveView('admin');
        const activeServing = tokens.find((t) => t.status === 'SERVING' && t.departmentId === 'dept-gm');
        if (activeServing) {
          completeToken(activeServing.id);
        } else {
          startServingToken('GM-102');
        }
        onClose();
      },
    },
    {
      title: 'Step 11 & 12: View Dynamic Recalculation & Queue Intelligence',
      badge: 'Analytics & AI Engine',
      icon: BarChart3,
      description:
        'Review the "Queue Intelligence" section featuring department load bar charts, wait time comparisons, counter utilization, and transparent rule-based optimization recommendations.',
      actionLabel: 'Open Queue Intelligence',
      onAction: () => {
        setCurrentRole('ADMIN');
        setActiveView('admin');
        onClose();
      },
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header - Light Royal Lavender */}
        <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-purple-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close demo guide"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-white/15 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Hackathon Demonstration Workflow
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">Smart Token Management System Evaluation Tour</h2>
          <p className="text-xs text-purple-100 mt-1">
            Follow this 12-step guided demonstration path to test every required capability.
          </p>

          <div className="mt-4 flex items-center justify-between text-[11px] text-purple-200 mb-1">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-300 h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <StepIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 mb-1">
                {current.badge}
              </div>
              <h3 className="text-base font-bold text-slate-900">{current.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{current.description}</p>
            </div>
          </div>

          {/* Quick Action Button for current step */}
          <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100 flex items-center justify-between gap-3 mb-6">
            <div className="text-xs text-purple-950 font-medium">
              Execute this step directly:
            </div>
            <button
              onClick={current.onAction}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-sm shadow-purple-600/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {current.actionLabel}
            </button>
          </div>

          {/* All steps quick navigation pills */}
          <div className="border-t border-purple-100 pt-4 mb-4">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Jump to any step:
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {steps.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                    currentStep === idx
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-purple-50/60 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-purple-100">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <button
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-900 text-white hover:bg-purple-800 transition-colors cursor-pointer"
            >
              {currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
