/**
 * Smart Token Management System - Navigation & Role Management Bar
 * Light Lavender Healthcare Aesthetic
 */

import React, { useState } from 'react';
import { useQueue, UserRole } from '../context/QueueContext';
import {
  Activity,
  User,
  Shield,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Clock,
  Radio,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  onOpenTour: () => void;
  onOpenTokenGen: () => void;
  onOpenAppointments: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTour,
  onOpenTokenGen,
  onOpenAppointments,
}) => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    audioEnabled,
    setAudioEnabled,
    resetDemoData,
    counters,
    tokens,
  } = useQueue();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeCountersCount = counters.filter(
    (c) => c.status === 'OPEN' || c.status === 'BUSY'
  ).length;

  const waitingCount = tokens.filter((t) => t.status === 'WAITING').length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs transition-colors">
        {/* Light Lavender Top Operating Status Bar */}
        <div className="bg-purple-50/90 text-purple-950 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/60">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
            </span>
            <span className="font-semibold text-purple-900">St. Jude Metropolitan Medical Center</span>
            <span className="hidden sm:inline text-purple-300">•</span>
            <span className="hidden sm:inline text-purple-700">Emergency 24/7 Trauma Bay Counter E-1</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200/80 text-purple-800 shadow-2xs">
              <Radio className="w-3 h-3 text-purple-600 animate-pulse" />
              <span>{activeCountersCount} Counters Active</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200/80 text-purple-800 shadow-2xs">
              <Clock className="w-3 h-3 text-purple-600" />
              <span>{waitingCount} Waiting</span>
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[11px] font-mono border border-purple-200">
              Prototype Demo
            </span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('patient')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
              aria-label="Smart Token Management System Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                    Smart Token
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 tracking-wide border border-purple-200">
                    Management System
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-0.5 font-medium hidden sm:block">
                  Intelligent Hospital Queue Flow
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links (Patient Views) */}
          <nav className="hidden md:flex items-center gap-1 bg-purple-50/60 p-1 rounded-xl border border-purple-100">
            <button
              onClick={() => setActiveView('patient')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'patient'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-100'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-white/50'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveView('tracker')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'tracker'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-100'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-white/50'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              Live Token Tracker
            </button>
            <button
              onClick={() => {
                setActiveView('patient');
                onOpenAppointments();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-purple-700 hover:bg-white/50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              Appointments
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Dashboard
            </button>
          </nav>

          {/* Role Switcher & Utility Actions */}
          <div className="flex items-center gap-2">
            {/* Hackathon Judge Demo Walkthrough Guide Button */}
            <button
              onClick={onOpenTour}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm hover:from-purple-700 hover:to-violet-700 transition-all cursor-pointer"
              title="Step-by-step hackathon judge demo workflow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Judge Demo Guide</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Role Selector Badge */}
            <div className="hidden lg:flex items-center bg-purple-50/70 p-0.5 rounded-lg border border-purple-100">
              <button
                onClick={() => {
                  setCurrentRole('PATIENT');
                  setActiveView('patient');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentRole === 'PATIENT'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-purple-900'
                }`}
                title="Switch role to Patient"
              >
                Patient
              </button>
              <button
                onClick={() => {
                  setCurrentRole('ADMIN');
                  setActiveView('admin');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentRole === 'ADMIN'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
                title="Switch role to Hospital Administrator"
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setCurrentRole('RECEPTION');
                  setActiveView('admin');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentRole === 'RECEPTION'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
                title="Switch role to Reception Staff"
              >
                Reception
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-lg text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-100 transition-colors cursor-pointer"
              title={audioEnabled ? 'Chime sound enabled (Click to mute)' : 'Sound muted (Click to enable)'}
              aria-label="Toggle chime alerts"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 border border-purple-100 transition-colors cursor-pointer"
              title="Reset sample demonstration data"
              aria-label="Reset sample demonstration data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-purple-100 bg-purple-50/50 px-4 py-2 flex items-center justify-around text-xs">
          <button
            onClick={() => setActiveView('patient')}
            className={`font-medium py-1 px-2 rounded-md ${
              activeView === 'patient' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveView('tracker')}
            className={`font-medium py-1 px-2 rounded-md flex items-center gap-1 ${
              activeView === 'tracker' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            <Radio className="w-3 h-3 text-purple-600" />
            Track Token
          </button>
          <button
            onClick={() => {
              setActiveView('patient');
              onOpenAppointments();
            }}
            className="font-medium py-1 px-2 rounded-md text-slate-600"
          >
            Appointments
          </button>
          <button
            onClick={() => {
              setCurrentRole('ADMIN');
              setActiveView('admin');
            }}
            className={`font-medium py-1 px-2 rounded-md ${
              activeView === 'admin' ? 'bg-purple-600 text-white font-bold' : 'text-purple-700'
            }`}
          >
            Admin
          </button>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 text-center animate-subtle-pulse">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Demonstration Data?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              This will restore all 10 departments, active counters, and realistic patient queues back to their default demo states.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-sm shadow-rose-600/30"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
