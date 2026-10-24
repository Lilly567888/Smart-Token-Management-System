/**
 * Smart Token Management System - Print-Friendly Receipt Modal
 * Formatted for physical printouts and thermal slips with high contrast
 */

import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { maskPatientName } from '../../utils/queueCalculator';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface PrintReceiptModalProps {
  tokenId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  tokenId,
  isOpen,
  onClose,
}) => {
  const { tokens, departments, config, doctors } = useQueue();

  if (!isOpen || !tokenId) return null;

  const token = tokens.find((t) => t.id === tokenId);
  if (!token) return null;

  const dept = departments.find((d) => d.id === token.departmentId);
  const doc = doctors.find((d) => d.id === token.doctorId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Controls Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Print Queue Slip</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-6 bg-white text-black font-mono text-xs space-y-4">
          <div className="text-center border-b border-black pb-3">
            <h1 className="font-extrabold text-sm tracking-tight uppercase">
              {config.hospitalName}
            </h1>
            <p className="text-[10px] text-slate-600 mt-0.5">{config.address}</p>
            <p className="text-[10px] text-slate-600">{config.tagline}</p>
          </div>

          <div className="text-center py-2 border-b border-dashed border-black">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
              YOUR QUEUE TOKEN
            </div>
            <div className="text-4xl font-black tracking-widest mt-1 text-black font-mono">
              {token.id}
            </div>
            <div className="text-[11px] font-bold mt-1 text-slate-800 uppercase">
              {dept?.name} ({dept?.code})
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] border-b border-dashed border-black pb-3">
            <div className="flex justify-between">
              <span>Patient:</span>
              <span className="font-bold">{maskPatientName(token.patientName)}</span>
            </div>
            <div className="flex justify-between">
              <span>Priority:</span>
              <span className="font-bold uppercase">{token.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>Queue Position:</span>
              <span className="font-bold">
                {token.queuePosition === 0 ? 'Now Serving' : `#${token.queuePosition}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Est. Wait Time:</span>
              <span className="font-bold">
                {token.estimatedWaitMinutes === 0 ? 'Immediate' : `~${token.estimatedWaitMinutes} mins`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span>{dept?.location}</span>
            </div>
            {doc && (
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span>{doc.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Registered:</span>
              <span>{new Date(token.registeredAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="text-center pt-2">
            <div className="flex justify-center items-center gap-0.5 h-7">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full ${
                    i % 3 === 0 ? 'w-1 bg-black' : i % 2 === 0 ? 'w-0.5 bg-black' : 'w-1.5 bg-slate-500'
                  }`}
                />
              ))}
            </div>
            <div className="text-[9px] mt-1 font-mono tracking-widest">
              *{token.id}*
            </div>
            <p className="text-[9px] text-slate-500 mt-2">
              Please watch the overhead displays for your counter announcement.
            </p>
          </div>
        </div>

        {/* Action Controls in Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2 no-print">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-purple-600/30 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Now
          </button>
        </div>
      </div>
    </div>
  );
};
