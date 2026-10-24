/**
 * Smart Token Management System - Main Application Entry Point
 * Comprehensive Intelligent Hospital Queue Management System
 */

import React, { useState } from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import { Navbar } from './components/Navbar';
import { PatientHome } from './components/patient/PatientHome';
import { LiveQueueTracker } from './components/patient/LiveQueueTracker';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TokenGenerationModal } from './components/patient/TokenGenerationModal';
import { DigitalTicketModal } from './components/patient/DigitalTicketModal';
import { AppointmentBookingModal } from './components/patient/AppointmentBookingModal';
import { PrintReceiptModal } from './components/common/PrintReceiptModal';
import { HackathonTourModal } from './components/HackathonTourModal';
import { ToastContainer } from './components/common/ToastContainer';
import {
  Activity,
  Heart,
  ShieldAlert,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Layers,
} from 'lucide-react';

function AppContent() {
  const { activeView, setActiveView, setActiveTrackingTokenId, config } = useQueue();

  // Modal states
  const [isTokenGenOpen, setIsTokenGenOpen] = useState(false);
  const [tokenGenDeptId, setTokenGenDeptId] = useState<string | undefined>(undefined);

  const [ticketModalTokenId, setTicketModalTokenId] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [appointmentsDeptId, setAppointmentsDeptId] = useState<string | undefined>(undefined);

  const [printReceiptTokenId, setPrintReceiptTokenId] = useState<string | null>(null);
  const [isPrintReceiptOpen, setIsPrintReceiptOpen] = useState(false);

  const [isTourOpen, setIsTourOpen] = useState(false);

  // Handlers
  const handleOpenTokenGen = (deptId?: string) => {
    setTokenGenDeptId(deptId);
    setIsTokenGenOpen(true);
  };

  const handleOpenAppointments = (deptId?: string) => {
    setAppointmentsDeptId(deptId);
    setIsAppointmentsOpen(true);
  };

  const handleTokenGenerated = (tokenId: string) => {
    setIsTokenGenOpen(false);
    setTicketModalTokenId(tokenId);
    setIsTicketModalOpen(true);
  };

  const handleTrackToken = (tokenId: string) => {
    setActiveTrackingTokenId(tokenId);
    setActiveView('tracker');
    setIsTicketModalOpen(false);
  };

  const handleOpenPrintReceipt = (tokenId: string) => {
    setPrintReceiptTokenId(tokenId);
    setIsPrintReceiptOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-purple-200 selection:text-purple-900">
      {/* Top Navbar */}
      <Navbar
        onOpenTour={() => setIsTourOpen(true)}
        onOpenTokenGen={() => handleOpenTokenGen()}
        onOpenAppointments={() => handleOpenAppointments()}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-12">
        {activeView === 'patient' && (
          <PatientHome
            onOpenTokenGen={handleOpenTokenGen}
            onOpenAppointments={handleOpenAppointments}
          />
        )}

        {activeView === 'tracker' && (
          <LiveQueueTracker
            onOpenPrintReceipt={handleOpenPrintReceipt}
            onOpenTokenGen={() => handleOpenTokenGen()}
          />
        )}

        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Application Footer */}
      <footer className="bg-white border-t border-purple-100 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-[10px] shadow-xs">
                ST
              </div>
              <span className="font-bold text-slate-900">Smart Token Management System</span>
              <span>— Intelligent Hospital Queue Flow &amp; Outpatient Management</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                {config.address}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <Phone className="w-3.5 h-3.5" />
                Emergency Hotline: {config.emergencyHotline}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <p>
              Prototype Demonstration System with realistic fictional hospital data. Designed for hackathons and health-tech showcases.
            </p>
            <p className="flex items-center gap-1">
              Built with React, TypeScript &amp; Tailwind CSS • Zero Mock Fallbacks
            </p>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <TokenGenerationModal
        isOpen={isTokenGenOpen}
        onClose={() => setIsTokenGenOpen(false)}
        initialDepartmentId={tokenGenDeptId}
        onTokenGenerated={handleTokenGenerated}
      />

      <DigitalTicketModal
        tokenId={ticketModalTokenId}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTrackToken={handleTrackToken}
        onPrintToken={handleOpenPrintReceipt}
      />

      <AppointmentBookingModal
        isOpen={isAppointmentsOpen}
        onClose={() => setIsAppointmentsOpen(false)}
        initialDepartmentId={appointmentsDeptId}
      />

      <PrintReceiptModal
        tokenId={printReceiptTokenId}
        isOpen={isPrintReceiptOpen}
        onClose={() => setIsPrintReceiptOpen(false)}
      />

      <HackathonTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenTokenGen={handleOpenTokenGen}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <QueueProvider>
      <AppContent />
    </QueueProvider>
  );
}
