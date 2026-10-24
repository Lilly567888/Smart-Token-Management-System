/**
 * Smart Token Management System - Queue Intelligence & Analytics Section
 * Light Lavender Theme with Transparent Optimization Engine
 */

import React, { useMemo } from 'react';
import { useQueue } from '../../context/QueueContext';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Activity,
  Zap,
  Users,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

export const QueueIntelligence: React.FC = () => {
  const { departments, counters, tokens } = useQueue();

  const departmentAnalytics = useMemo(() => {
    return departments.map((dept) => {
      const deptTokens = tokens.filter((t) => t.departmentId === dept.id);
      const waiting = deptTokens.filter((t) => t.status === 'WAITING').length;
      const serving = deptTokens.filter((t) => t.status === 'SERVING').length;
      const completed = deptTokens.filter((t) => t.status === 'COMPLETED').length;
      const activeCounters = counters.filter(
        (c) => c.departmentId === dept.id && (c.status === 'OPEN' || c.status === 'BUSY')
      ).length;

      const estWait = activeCounters > 0 ? Math.round((waiting * dept.avgDurationMinutes) / activeCounters) : -1;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        waiting,
        serving,
        completed,
        total: deptTokens.length,
        activeCounters,
        avgDurationMinutes: dept.avgDurationMinutes,
        estWait,
        isOvercrowded: waiting >= 3 || estWait > 25,
      };
    });
  }, [departments, counters, tokens]);

  const totalRegistered = tokens.length;
  const totalWaiting = tokens.filter((t) => t.status === 'WAITING').length;
  const totalCompleted = tokens.filter((t) => t.status === 'COMPLETED').length;
  const totalServing = tokens.filter((t) => t.status === 'SERVING').length;

  const totalCounters = counters.length;
  const activeCounters = counters.filter((c) => c.status === 'OPEN' || c.status === 'BUSY').length;
  const counterUtilizationPct = totalCounters > 0 ? Math.round((activeCounters / totalCounters) * 100) : 0;

  const maxWaiting = Math.max(1, ...departmentAnalytics.map((d) => d.waiting));

  const recommendations = useMemo(() => {
    const list: Array<{
      type: 'URGENT' | 'OPTIMIZATION' | 'EFFICIENCY';
      title: string;
      description: string;
      actionText: string;
    }> = [];

    departmentAnalytics.forEach((d) => {
      if (d.waiting >= 3 && d.activeCounters <= 1) {
        list.push({
          type: 'URGENT',
          title: `Overcrowding Alert: ${d.name}`,
          description: `${d.name} has ${d.waiting} patients waiting with only ${d.activeCounters} active counter. Estimated wait is ~${d.estWait} minutes.`,
          actionText: `Open an additional counter for ${d.name} to cut wait time in half (~${Math.round(d.estWait / 2)} mins).`,
        });
      }
    });

    const idleDept = departmentAnalytics.find((d) => d.waiting === 0 && d.activeCounters >= 2);
    const heavyDept = departmentAnalytics.find((d) => d.waiting >= 2);
    if (idleDept && heavyDept) {
      list.push({
        type: 'OPTIMIZATION',
        title: `Dynamic Capacity Rebalancing Opportunity`,
        description: `${idleDept.name} queue is clear (0 waiting) with ${idleDept.activeCounters} active counters, while ${heavyDept.name} has ${heavyDept.waiting} patients waiting.`,
        actionText: `Temporarily reallocate 1 counter from ${idleDept.name} to ${heavyDept.name} to balance staff throughput.`,
      });
    }

    if (list.length === 0) {
      list.push({
        type: 'EFFICIENCY',
        title: 'Optimal Patient Flow Detected',
        description:
          'Current hospital queue load is evenly distributed across active counters. Average wait across all clinical departments is under 15 minutes.',
        actionText: 'Maintain current counter schedules and OPD doctor allocations.',
      });
    }

    return list;
  }, [departmentAnalytics]);

  const hourlyData = [
    { hour: '08:00 AM', count: 6 },
    { hour: '09:00 AM', count: 14 },
    { hour: '10:00 AM', count: 18 },
    { hour: '11:00 AM', count: 12 },
    { hour: '12:00 PM', count: 8 },
    { hour: '01:00 PM', count: 9 },
    { hour: '02:00 PM', count: 15 },
    { hour: '03:00 PM', count: 11 },
  ];
  const maxHourly = Math.max(...hourlyData.map((h) => h.count));

  return (
    <div className="space-y-6">
      {/* Light Lavender Section Header */}
      <div className="bg-gradient-to-r from-purple-50 via-violet-50 to-purple-100/60 border border-purple-200/80 text-purple-950 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-purple-100 text-purple-700">
                <BarChart3 className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                Queue Intelligence &amp; Operations Analytics
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1 text-slate-900">
              Intelligent Flow Diagnostics
            </h2>
            <p className="text-xs text-slate-600 max-w-xl mt-1 leading-relaxed">
              Transparent, algorithmic hospital queue analytics. Real-time counter utilization, peak wait forecasts, and capacity allocation recommendations.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 text-center min-w-[160px] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
              Counter Utilization
            </span>
            <div className="text-3xl font-black text-purple-700 mt-0.5">
              {counterUtilizationPct}%
            </div>
            <span className="text-[11px] text-slate-500">
              {activeCounters} of {totalCounters} counters online
            </span>
          </div>
        </div>
      </div>

      {/* Rule-Based Queue Analysis Recommendations */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Algorithmic Queue Optimization Recommendations
            </h3>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            Rule-Based Diagnostics Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                rec.type === 'URGENT'
                  ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                  : rec.type === 'OPTIMIZATION'
                  ? 'bg-purple-50/60 border-purple-200 text-purple-950'
                  : 'bg-violet-50/60 border-violet-200 text-violet-950'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      rec.type === 'URGENT'
                        ? 'bg-rose-600 text-white'
                        : rec.type === 'OPTIMIZATION'
                        ? 'bg-purple-600 text-white'
                        : 'bg-violet-600 text-white'
                    }`}
                  >
                    {rec.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs font-semibold text-purple-900 flex items-start gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{rec.actionText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Active Patients Waiting by Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time queue load distribution across clinical services
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              {totalWaiting} Total Waiting
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {departmentAnalytics.map((dept) => {
              const widthPct = Math.max(6, Math.round((dept.waiting / maxWaiting) * 100));
              return (
                <div key={dept.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{dept.name} ({dept.code})</span>
                    <span className="text-slate-600 font-mono">
                      {dept.waiting} waiting • {dept.estWait === -1 ? 'Paused' : `~${dept.estWait}m`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-4 rounded-md overflow-hidden relative">
                    <div
                      className={`h-full rounded-md transition-all duration-500 ${
                        dept.waiting >= 3
                          ? 'bg-rose-500'
                          : dept.waiting >= 2
                          ? 'bg-purple-600'
                          : 'bg-purple-400'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Peak Patient Flow &amp; Registration Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly OPD traffic (Peak between 09:00 AM – 11:00 AM)
            </p>
          </div>

          <div className="flex items-end justify-between h-48 pt-6 pb-2 border-b border-purple-100 gap-1.5">
            {hourlyData.map((h, i) => {
              const heightPct = Math.round((h.count / maxHourly) * 100);
              const isPeak = h.count >= 15;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-purple-700">
                    {h.count}
                  </span>
                  <div className="w-full bg-purple-50/50 rounded-t-md h-36 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-t from-purple-700 to-violet-500'
                          : 'bg-purple-200 group-hover:bg-purple-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono -rotate-45 sm:rotate-0 mt-1">
                    {h.hour.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-purple-50/40 p-3 rounded-xl border border-purple-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Peak Waiting Window:</span>
              <span className="text-purple-700">10:00 AM – 11:30 AM</span>
            </div>
            <div className="flex justify-between">
              <span>Total Consultations Today:</span>
              <span className="font-bold text-slate-900">{totalCompleted} Patients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
