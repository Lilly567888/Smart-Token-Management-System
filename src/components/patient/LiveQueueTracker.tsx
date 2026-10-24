/**
 * Smart Token Management System - Live Queue Tracking Screen
 * Light Lavender Healthcare Aesthetic
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQueue } from '../../context/QueueContext';
import { maskPatientName } from '../../utils/queueCalculator';
import {
  Radio,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Printer,
  XCircle,
  Volume2,
  Bell,
  Stethoscope,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface LiveQueueTrackerProps {
  onOpenPrintReceipt: (tokenId: string) => void;
  onOpenTokenGen: () => void;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({
  onOpenPrintReceipt,
  onOpenTokenGen,
}) => {
  const {
    tokens,
    departments,
    counters,
    doctors,
    activeTrackingTokenId,
    setActiveTrackingTokenId,
    cancelToken,
    playChime,
  } = useQueue();

  const [searchTokenInput, setSearchTokenInput] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('Patient opted to reschedule');
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentToken = useMemo(() => {
    if (activeTrackingTokenId) {
      const found = tokens.find((t) => t.id === activeTrackingTokenId);
      if (found) return found;
    }
    return tokens.find((t) => t.status === 'CALLED' || t.status === 'WAITING') || tokens[0];
  }, [tokens, activeTrackingTokenId]);

  const dept = departments.find((d) => d.id === currentToken?.departmentId);
  const doctor = doctors.find((d) => d.id === currentToken?.doctorId);

  const currentServingInDept = tokens.find(
    (t) => t.departmentId === currentToken?.departmentId && t.status === 'SERVING'
  );

  const patientsAhead = useMemo(() => {
    if (!currentToken || currentToken.status !== 'WAITING') return 0;
    return Math.max(0, currentToken.queuePosition - 1);
  }, [currentToken]);

  useEffect(() => {
    if (currentToken?.status === 'CALLED') {
      playChime('chime');
    }
  }, [currentToken?.status, playChime]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTokenInput.trim().toUpperCase();
    if (!query) return;
    const match = tokens.find((t) => t.id.toUpperCase() === query);
    if (match) {
      setActiveTrackingTokenId(match.id);
      setSearchTokenInput('');
    } else {
      alert(`Token "${query}" was not found in the current session.`);
    }
  };

  const stageIndex = useMemo(() => {
    if (!currentToken) return 0;
    switch (currentToken.status) {
      case 'WAITING':
        return 1;
      case 'CALLED':
        return 2;
      case 'SERVING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  }, [currentToken]);

  if (!currentToken) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 bg-white">
        <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
          <Radio className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Active Tokens to Track</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You currently have no active queue token. Generate a new token or search by Token ID above.
        </p>
        <button
          onClick={onOpenTokenGen}
          className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
        >
          Get New Queue Token
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Header & Token Lookup Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <Radio className="w-4 h-4 text-purple-600 animate-pulse" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Live Queue Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Real-Time Token Tracker
          </h1>
        </div>

        {/* Search token bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Track token (e.g. GM-103)"
              value={searchTokenInput}
              onChange={(e) => setSearchTokenInput(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400 w-48 uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Find
          </button>
        </form>
      </div>

      {/* Urgent Turn Approaching or Called Banner Alert */}
      {currentToken.status === 'CALLED' && (
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-200">
                It’s Your Turn Now!
              </span>
              <h2 className="text-lg font-black tracking-tight text-white">
                Please proceed to{' '}
                <span className="underline decoration-amber-300">
                  {currentToken.assignedCounterNumber || 'Counter'}
                </span>{' '}
                immediately!
              </h2>
              <p className="text-xs text-purple-100 mt-0.5">
                Staff is ready to attend to you. Please head to {dept?.location}.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1.5 rounded-xl bg-white text-purple-900 font-mono font-bold text-sm shadow-xs">
              TOKEN {currentToken.id}
            </span>
          </div>
        </div>
      )}

      {currentToken.status === 'WAITING' && patientsAhead === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              You are Next in Line!
            </div>
            <p className="text-xs text-amber-900 mt-0.5 font-medium">
              Please stay near the consultation lobby. Your token will be called to the next available counter shortly.
            </p>
          </div>
        </div>
      )}

      {/* Primary Token Card */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                {dept?.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Code: {dept?.code}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              <span>{dept?.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                currentToken.status === 'CALLED'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse'
                  : currentToken.status === 'SERVING'
                  ? 'bg-violet-100 text-violet-800 border border-violet-200'
                  : currentToken.status === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentToken.status === 'CALLED'
                    ? 'bg-purple-500'
                    : currentToken.status === 'SERVING'
                    ? 'bg-violet-600'
                    : 'bg-purple-600'
                }`}
              />
              {currentToken.status}
            </span>

            <button
              onClick={() => onOpenPrintReceipt(currentToken.id)}
              className="p-2 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 border border-purple-200 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Token Visual */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 text-center md:text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Token
            </span>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-purple-900">
              {currentToken.id}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Registered for: <strong className="text-slate-900">{maskPatientName(currentToken.patientName)}</strong>
            </div>
            <div className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 mt-1">
              Priority: {currentToken.priority}
            </div>
          </div>

          {/* Countdown & Queue Position Metrics */}
          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 text-center">
              <span className="text-[11px] font-bold text-purple-800/80 uppercase tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Est. Waiting Time
              </span>
              <div className="text-3xl font-black text-purple-700 mt-1">
                {currentToken.status === 'SERVING'
                  ? '0 mins'
                  : currentToken.status === 'CALLED'
                  ? 'Immediate'
                  : `~${currentToken.estimatedWaitMinutes} mins`}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Dynamic algorithmic estimate
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-600" />
                Patients Ahead
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {patientsAhead}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Position #{currentToken.queuePosition} in line
              </p>
            </div>
          </div>
        </div>

        {/* Linear Stage Progress Journey */}
        <div className="space-y-3 pt-4 border-t border-purple-100">
          <div className="text-xs font-bold text-slate-700">Queue Stage Journey</div>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            {[
              { label: '1. Registered', active: stageIndex >= 1 },
              { label: '2. In Waiting Lobby', active: stageIndex >= 1 },
              { label: '3. Called to Counter', active: stageIndex >= 2 },
              { label: '4. Consultation Done', active: stageIndex >= 4 },
            ].map((st, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                    st.active
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-400 font-medium'
                  }`}
                >
                  {st.active ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`font-semibold ${
                    st.active ? 'text-purple-900' : 'text-slate-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-purple-600 h-full transition-all duration-500"
              style={{ width: `${(stageIndex / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Counter Live Status & Doctor Note */}
        <div className="bg-purple-50/40 rounded-2xl p-4 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Currently Serving in Department:</span>
            <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
              {currentServingInDept
                ? `${currentServingInDept.id} (${currentServingInDept.assignedCounterNumber || 'Counter 1'})`
                : 'No patient in room (Counters open)'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLastUpdated('Updated just now');
                playChime('chime');
              }}
              className="px-3 py-1.5 rounded-lg text-slate-600 bg-white border border-purple-200 hover:bg-purple-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
              Refresh Status
            </button>

            {currentToken.status === 'WAITING' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-3 py-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Token
              </button>
            )}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-2">
          <span>Registered at {new Date(currentToken.registeredAt).toLocaleTimeString()}</span>
          <span>•</span>
          <span>Last live sync: {lastUpdated}</span>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cancel Queue Token?</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Are you sure you want to cancel token <strong>{currentToken.id}</strong>? You will lose your current queue position #{currentToken.queuePosition}.
            </p>

            <div className="mt-4 text-left">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Reason for cancellation:
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div className="flex gap-2 justify-center mt-5">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Keep Token
              </button>
              <button
                onClick={() => {
                  cancelToken(currentToken.id, cancelReason);
                  setShowCancelConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Yes, Cancel Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
