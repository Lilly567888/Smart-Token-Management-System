/**
 * Smart Token Management System - Digital Token Ticket Modal
 * Light Lavender Healthcare Boarding Pass
 */

import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { maskPatientName } from '../../utils/queueCalculator';
import {
  X,
  Ticket,
  Printer,
  Radio,
  Clock,
  User,
  CheckCircle2,
  Share2,
  Eye,
  EyeOff,
  Sparkles,
  MapPin,
  Stethoscope,
} from 'lucide-react';

interface DigitalTicketModalProps {
  tokenId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackToken: (tokenId: string) => void;
  onPrintToken: (tokenId: string) => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  tokenId,
  isOpen,
  onClose,
  onTrackToken,
  onPrintToken,
}) => {
  const { tokens, departments, doctors, counters } = useQueue();
  const [showFullPatientName, setShowFullPatientName] = useState(false);

  if (!isOpen || !tokenId) return null;

  const token = tokens.find((t) => t.id === tokenId);
  if (!token) return null;

  const dept = departments.find((d) => d.id === token.departmentId);
  const doctor = doctors.find((d) => d.id === token.doctorId);
  const servingToken = tokens.find(
    (t) => t.departmentId === token.departmentId && t.status === 'SERVING'
  );

  const displayName = showFullPatientName
    ? token.patientName
    : maskPatientName(token.patientName);

  const formattedTime = new Date(token.registeredAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden my-6">
        {/* Top Ticket Header (Lavender & Violet) */}
        <div className="bg-gradient-to-br from-purple-700 via-violet-700 to-purple-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close digital ticket"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-white/20 text-purple-200">
              <Ticket className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-200">
              Official Digital Healthcare Pass
            </span>
          </div>

          <h2 className="text-sm font-semibold text-purple-100">
            {dept?.name || 'Hospital Department'}
          </h2>

          {/* Prominent Token Number */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-purple-200 font-medium">YOUR TOKEN NUMBER</span>
              <div className="text-4xl font-black tracking-tight text-white mt-0.5 font-mono drop-shadow-sm">
                {token.id}
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-purple-900 shadow-md">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              {token.status}
            </span>
          </div>
        </div>

        {/* Notched perforated ticket divider */}
        <div className="relative flex items-center justify-between px-4 -my-3 z-10">
          <div className="w-6 h-6 rounded-full bg-slate-900/40 -ml-7 shadow-inner" />
          <div className="flex-1 border-b-2 border-dashed border-purple-200 mx-2" />
          <div className="w-6 h-6 rounded-full bg-slate-900/40 -mr-7 shadow-inner" />
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-4 pt-5">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Patient Display Name
              </span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{displayName}</span>
                <button
                  type="button"
                  onClick={() => setShowFullPatientName(!showFullPatientName)}
                  className="text-slate-400 hover:text-purple-600 cursor-pointer"
                  title={showFullPatientName ? 'Hide name' : 'Reveal full name'}
                >
                  {showFullPatientName ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Priority Tier
              </span>
              <div className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mt-0.5">
                {token.priority}
              </div>
            </div>
          </div>

          {/* Key Queue Stats Grid */}
          <div className="grid grid-cols-2 gap-3 bg-purple-50/40 p-3.5 rounded-2xl border border-purple-100/70">
            <div>
              <div className="text-[10px] text-purple-700/70 font-bold uppercase tracking-wider">
                Queue Position
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {token.queuePosition === 0 ? 'Now Serving' : `#${token.queuePosition} in line`}
              </div>
              <div className="text-[10px] text-slate-500">
                {token.queuePosition > 1
                  ? `${token.queuePosition - 1} patient(s) ahead`
                  : 'You are next!'}
              </div>
            </div>

            <div className="border-l border-purple-200/80 pl-3">
              <div className="text-[10px] text-purple-700/70 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" />
                Est. Waiting Time
              </div>
              <div className="text-lg font-black text-purple-700 mt-0.5">
                {token.estimatedWaitMinutes === 0
                  ? 'Immediate'
                  : `~${token.estimatedWaitMinutes} mins`}
              </div>
              <div className="text-[10px] text-slate-500">Approximation</div>
            </div>
          </div>

          {/* Current Serving & Location */}
          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                Now Serving at Counter:
              </span>
              <span className="font-mono font-bold text-purple-950">
                {servingToken ? servingToken.id : 'Ready for next token'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-purple-100">
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3 text-purple-600" />
                Location:
              </span>
              <span className="font-semibold text-slate-800 text-[11px]">
                {dept?.location || 'Main Clinic Area'}
              </span>
            </div>

            {doctor && (
              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-purple-100">
                <span className="flex items-center gap-1 text-slate-500">
                  <Stethoscope className="w-3 h-3 text-purple-600" />
                  Assigned Doctor:
                </span>
                <span className="font-semibold text-slate-800 text-[11px]">{doctor.name}</span>
              </div>
            )}
          </div>

          {/* Barcode Simulation */}
          <div className="pt-2 text-center space-y-1.5">
            <div className="inline-block p-2 rounded-xl bg-purple-50/40 border border-purple-100">
              <div className="flex justify-center items-center gap-0.5 h-8 px-4 py-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full ${
                      i % 3 === 0
                        ? 'w-1 bg-purple-950'
                        : i % 2 === 0
                        ? 'w-0.5 bg-purple-800'
                        : 'w-1.5 bg-purple-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[9px] font-mono text-purple-600/70 tracking-wider">
                AUTH-HASH: {token.id}-{token.registeredAt.slice(11, 19).replace(/:/g, '')}
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Registered at {formattedTime} • Keep this screen open or print receipt
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-purple-100">
            <button
              onClick={() => {
                onTrackToken(token.id);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-purple-600/30 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-purple-200 animate-pulse" />
              Track My Token in Real-Time
            </button>

            <button
              onClick={() => onPrintToken(token.id)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-purple-600" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
