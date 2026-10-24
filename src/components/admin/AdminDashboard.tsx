/**
 * Smart Token Management System - Hospital Administration Dashboard
 * Light Lavender Theme with Live Calling, Counter Controls & CSV Export
 */

import React, { useState, useMemo } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Token, Counter, CounterStatus, PriorityLevel } from '../../types/queue';
import { maskPatientName } from '../../utils/queueCalculator';
import { QueueIntelligence } from './QueueIntelligence';
import {
  Shield,
  Users,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Play,
  CheckSquare,
  SkipForward,
  XCircle,
  Plus,
  Download,
  Filter,
  Search,
  Settings,
  Layers,
  Sparkles,
  BarChart3,
  Stethoscope,
  Calendar,
  FileText,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    departments,
    doctors,
    counters,
    tokens,
    appointments,
    auditLogs,
    callToken,
    startServingToken,
    completeToken,
    skipToken,
    cancelToken,
    toggleCounterStatus,
    addCounter,
    updateDepartmentDuration,
    currentRole,
  } = useQueue();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'QUEUE' | 'COUNTERS' | 'INTELLIGENCE' | 'DURATIONS' | 'AUDIT'
  >('QUEUE');

  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [callModalToken, setCallModalToken] = useState<Token | null>(null);
  const [skipModalToken, setSkipModalToken] = useState<Token | null>(null);
  const [skipReasonInput, setSkipReasonInput] = useState<string>('Patient did not respond to counter call');
  const [cancelModalToken, setCancelModalToken] = useState<Token | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState<string>('Administrative cancellation / duplicate');
  const [showAddCounterModal, setShowAddCounterModal] = useState<boolean>(false);
  const [newCounterNumber, setNewCounterNumber] = useState<string>('');
  const [newCounterDeptId, setNewCounterDeptId] = useState<string>(departments[0]?.id || 'dept-gm');
  const [newCounterRoom, setNewCounterRoom] = useState<string>('Room 106');

  // Overall KPIs
  const totalRegistered = tokens.length;
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const servingTokens = tokens.filter((t) => t.status === 'SERVING');
  const calledTokens = tokens.filter((t) => t.status === 'CALLED');
  const completedTokens = tokens.filter((t) => t.status === 'COMPLETED');

  const activeCounters = counters.filter(
    (c) => c.status === 'OPEN' || c.status === 'BUSY'
  ).length;

  const avgWaitTime = useMemo(() => {
    if (waitingTokens.length === 0) return 0;
    const total = waitingTokens.reduce((s, t) => s + t.estimatedWaitMinutes, 0);
    return Math.round(total / waitingTokens.length);
  }, [waitingTokens]);

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      if (deptFilter !== 'ALL' && token.departmentId !== deptFilter) return false;
      if (statusFilter === 'ACTIVE') {
        if (!['WAITING', 'CALLED', 'SERVING'].includes(token.status)) return false;
      } else if (statusFilter !== 'ALL' && token.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = token.patientName.toLowerCase().includes(q);
        const matchesId = token.id.toLowerCase().includes(q);
        const matchesPhone = token.patientPhone.includes(q);
        return matchesName || matchesId || matchesPhone;
      }
      return true;
    });
  }, [tokens, deptFilter, statusFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      'Token ID',
      'Patient Name',
      'Department',
      'Priority',
      'Type',
      'Status',
      'Queue Position',
      'Est Wait (mins)',
      'Assigned Counter',
      'Registered At',
    ];

    const rows = tokens.map((t) => {
      const dept = departments.find((d) => d.id === t.departmentId);
      return [
        t.id,
        `"${t.patientName}"`,
        `"${dept?.name || ''}"`,
        t.priority,
        t.type,
        t.status,
        t.queuePosition,
        t.estimatedWaitMinutes,
        `"${t.assignedCounterNumber || ''}"`,
        `"${t.registeredAt}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_token_management_tokens_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterNumber.trim()) return;

    addCounter({
      counterNumber: newCounterNumber.trim(),
      departmentId: newCounterDeptId,
      roomNumber: newCounterRoom.trim(),
    });
    setNewCounterNumber('');
    setShowAddCounterModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-100 text-purple-700">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Hospital Administration Console
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Role: {currentRole}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Queue Operations &amp; Counter Dispatch Desk
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-purple-200 hover:bg-purple-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            Export Audit CSV
          </button>
          <button
            onClick={() => setShowAddCounterModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Open New Counter
          </button>
        </div>
      </div>

      {/* KPI Overview Cards - Light Lavender */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Registered
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalRegistered}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Today&apos;s OPD intake</div>
        </div>

        <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-600" />
            Currently Waiting
          </div>
          <div className="text-2xl font-black text-purple-950 mt-1">{waitingTokens.length}</div>
          <div className="text-[10px] text-purple-700 mt-0.5">In waiting lobby</div>
        </div>

        <div className="bg-violet-50/70 rounded-2xl p-4 border border-violet-200 shadow-xs">
          <div className="text-[11px] font-bold text-violet-800 uppercase tracking-wider flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-violet-600" />
            Called to Counter
          </div>
          <div className="text-2xl font-black text-violet-950 mt-1">{calledTokens.length}</div>
          <div className="text-[10px] text-violet-700 mt-0.5">Heading to room</div>
        </div>

        <div className="bg-purple-50/40 rounded-2xl p-4 border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-purple-600" />
            In Consultation
          </div>
          <div className="text-2xl font-black text-purple-950 mt-1">{servingTokens.length}</div>
          <div className="text-[10px] text-purple-700 mt-0.5">Currently serving</div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3 h-3 text-purple-600" />
            Active Counters
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activeCounters}{' '}
            <span className="text-xs font-normal text-slate-400">/ {counters.length}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Counters online</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Waiting Time
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">~{avgWaitTime}m</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across all services</div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex border-b border-purple-100 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveAdminTab('QUEUE')}
          className={`py-2 px-3.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeAdminTab === 'QUEUE'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Live Queue Management ({filteredTokens.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('COUNTERS')}
          className={`py-2 px-3.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeAdminTab === 'COUNTERS'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Counter Operations ({counters.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('INTELLIGENCE')}
          className={`py-2 px-3.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeAdminTab === 'INTELLIGENCE'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
          Queue Intelligence &amp; Analytics
        </button>

        <button
          onClick={() => setActiveAdminTab('DURATIONS')}
          className={`py-2 px-3.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeAdminTab === 'DURATIONS'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Service Durations &amp; Doctors
        </button>

        <button
          onClick={() => setActiveAdminTab('AUDIT')}
          className={`py-2 px-3.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeAdminTab === 'AUDIT'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Audit &amp; Compliance Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: LIVE QUEUE TABLE */}
      {activeAdminTab === 'QUEUE' && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">All Departments (10)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="ACTIVE">Active (Waiting, Called, Serving)</option>
                <option value="ALL">All Statuses</option>
                <option value="WAITING">Waiting Only</option>
                <option value="CALLED">Called Only</option>
                <option value="SERVING">Serving Only</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Queue Pos</th>
                  <th className="py-2.5 px-3">Est. Wait</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Counter</th>
                  <th className="py-2.5 px-3 text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      No matching queue tokens found.
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((token) => {
                    const dept = departments.find((d) => d.id === token.departmentId);
                    return (
                      <tr key={token.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {token.id}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{token.patientName}</div>
                          <div className="text-[10px] text-slate-400">
                            Age: {token.patientAge} • {token.patientPhone}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800">{dept?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1">
                            ({dept?.code})
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              token.priority === 'SENIOR'
                                ? 'bg-amber-100 text-amber-800'
                                : token.priority === 'ACCESSIBILITY'
                                ? 'bg-purple-100 text-purple-800'
                                : token.priority === 'PEDIATRIC_URGENT'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {token.priority}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-bold">
                          {token.queuePosition === 0 ? (
                            <span className="text-purple-700">Serving</span>
                          ) : (
                            `#${token.queuePosition}`
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-purple-700 font-semibold">
                          {token.estimatedWaitMinutes === 0
                            ? 'Immediate'
                            : `~${token.estimatedWaitMinutes}m`}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              token.status === 'CALLED'
                                ? 'bg-purple-100 text-purple-800 animate-pulse border border-purple-200'
                                : token.status === 'SERVING'
                                ? 'bg-violet-100 text-violet-800'
                                : token.status === 'WAITING'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : token.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {token.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-medium text-slate-700">
                          {token.assignedCounterNumber || '—'}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {token.status === 'WAITING' && (
                              <button
                                onClick={() => setCallModalToken(token)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Call patient to counter"
                              >
                                <PhoneCall className="w-3 h-3" />
                                Call Next
                              </button>
                            )}

                            {token.status === 'CALLED' && (
                              <button
                                onClick={() => startServingToken(token.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Start Consultation"
                              >
                                <Play className="w-3 h-3 fill-white" />
                                Start Serving
                              </button>
                            )}

                            {token.status === 'SERVING' && (
                              <button
                                onClick={() => completeToken(token.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Complete Consultation"
                              >
                                <CheckSquare className="w-3 h-3" />
                                Complete
                              </button>
                            )}

                            {['WAITING', 'CALLED'].includes(token.status) && (
                              <button
                                onClick={() => {
                                  setSkipModalToken(token);
                                  setSkipReasonInput('Patient did not respond to counter call');
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                title="Skip Token"
                              >
                                <SkipForward className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {['WAITING', 'CALLED'].includes(token.status) && (
                              <button
                                onClick={() => {
                                  setCancelModalToken(token);
                                  setCancelReasonInput('Administrative cancellation');
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Cancel Token"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COUNTER OPERATIONS */}
      {activeAdminTab === 'COUNTERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Service Counters</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle counter operating status, monitor current patient consultations, and open new stations.
              </p>
            </div>
            <button
              onClick={() => setShowAddCounterModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Counter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {counters.map((counter) => {
              const dept = departments.find((d) => d.id === counter.departmentId);
              const doc = doctors.find((d) => d.id === counter.assignedDoctorId);
              const activeToken = tokens.find((t) => t.id === counter.currentTokenId);

              return (
                <div
                  key={counter.id}
                  className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {counter.counterNumber}
                        </div>
                        <div className="text-xs text-purple-700 font-semibold mt-0.5">
                          {dept?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{counter.roomNumber}</div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          counter.status === 'OPEN'
                            ? 'bg-purple-100 text-purple-800'
                            : counter.status === 'BUSY'
                            ? 'bg-violet-100 text-violet-800'
                            : counter.status === 'PAUSED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {counter.status}
                      </span>
                    </div>

                    {doc && (
                      <div className="mt-3 text-xs text-slate-600 bg-purple-50/40 p-2.5 rounded-xl border border-purple-100">
                        <div className="font-semibold text-slate-800">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.specialty}</div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-purple-100 text-xs">
                      <span className="text-slate-400 font-medium">Currently Engaged:</span>
                      {activeToken ? (
                        <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center justify-between">
                          <span>Token {activeToken.id}</span>
                          <span className="text-[11px] text-purple-700">
                            {activeToken.patientName}
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px] mt-0.5">
                          Counter is vacant / awaiting call
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-purple-100 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      Served: {counter.servicedTodayCount} patients
                    </span>

                    <div className="flex gap-1.5">
                      {counter.status !== 'OPEN' && (
                        <button
                          onClick={() => toggleCounterStatus(counter.id, 'OPEN')}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer"
                        >
                          Open
                        </button>
                      )}
                      {counter.status === 'OPEN' && (
                        <button
                          onClick={() => toggleCounterStatus(counter.id, 'PAUSED')}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                        >
                          Pause
                        </button>
                      )}
                      {counter.status !== 'CLOSED' && (
                        <button
                          onClick={() => toggleCounterStatus(counter.id, 'CLOSED')}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: QUEUE INTELLIGENCE */}
      {activeAdminTab === 'INTELLIGENCE' && <QueueIntelligence />}

      {/* TAB 4: SERVICE DURATIONS */}
      {activeAdminTab === 'DURATIONS' && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department Consultation Durations &amp; Staff Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tuning average service duration directly rebalances dynamic waiting time formulas across the hospital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{dept.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Location: {dept.location}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-medium">Avg Duration:</label>
                  <select
                    value={dept.avgDurationMinutes}
                    onChange={(e) =>
                      updateDepartmentDuration(dept.id, parseInt(e.target.value, 10))
                    }
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-purple-200 bg-white text-purple-700"
                  >
                    {[5, 8, 10, 12, 14, 15, 18, 20, 25, 30].map((m) => (
                      <option key={m} value={m}>
                        {m} mins
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeAdminTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hospital Queue Audit &amp; Compliance Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable event stream for token generation, status transitions, and priority justification
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{auditLogs.length} Events Logged</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-purple-50 bg-purple-50/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-700">{log.action}</span>
                    {log.tokenId && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                        {log.tokenId}
                      </span>
                    )}
                    <span className="text-slate-400 text-[10px]">by {log.performedBy}</span>
                  </div>
                  <p className="text-slate-700 mt-1">{log.details}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono sm:text-right shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALL TOKEN COUNTER SELECTION MODAL */}
      {callModalToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Call Token {callModalToken.id} to Counter
            </h3>
            <p className="text-xs text-slate-600">
              Select an available counter to announce patient{' '}
              <strong>{callModalToken.patientName}</strong>:
            </p>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {counters
                .filter(
                  (c) =>
                    c.departmentId === callModalToken.departmentId &&
                    (c.status === 'OPEN' || c.status === 'BUSY')
                )
                .map((ctr) => (
                  <button
                    key={ctr.id}
                    onClick={() => {
                      callToken(callModalToken.id, ctr.id);
                      setCallModalToken(null);
                    }}
                    className="w-full p-2.5 rounded-xl border border-purple-100 hover:border-purple-600 hover:bg-purple-50 text-left transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{ctr.counterNumber}</div>
                      <div className="text-[10px] text-slate-500">{ctr.roomNumber}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Dispatch
                    </span>
                  </button>
                ))}
            </div>

            <button
              onClick={() => setCallModalToken(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SKIP TOKEN MODAL */}
      {skipModalToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Skip Token {skipModalToken.id}?
            </h3>
            <p className="text-xs text-slate-600">
              Please record a justification reason for skipping this patient:
            </p>

            <input
              type="text"
              value={skipReasonInput}
              onChange={(e) => setSkipReasonInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSkipModalToken(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  skipToken(skipModalToken.id, skipReasonInput);
                  setSkipModalToken(null);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer shadow-xs"
              >
                Skip Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL TOKEN MODAL */}
      {cancelModalToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Cancel Token {cancelModalToken.id}?
            </h3>
            <p className="text-xs text-slate-600">
              Record reason for cancelling patient <strong>{cancelModalToken.patientName}</strong>:
            </p>

            <input
              type="text"
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setCancelModalToken(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Keep Active
              </button>
              <button
                onClick={() => {
                  cancelToken(cancelModalToken.id, cancelReasonInput);
                  setCancelModalToken(null);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD COUNTER MODAL */}
      {showAddCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddCounterSubmit}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Open New Service Counter</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Counter Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Counter 11"
                value={newCounterNumber}
                onChange={(e) => setNewCounterNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={newCounterDeptId}
                onChange={(e) => setNewCounterDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white"
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
                Room Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 106"
                value={newCounterRoom}
                onChange={(e) => setNewCounterRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCounterModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 cursor-pointer shadow-xs"
              >
                Open Counter
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
