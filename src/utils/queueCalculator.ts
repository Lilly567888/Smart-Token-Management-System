/**
 * Smart Token Management System - Pure Queue Calculation Logic
 * Transparent waiting-time estimators and queue-rebalancing algorithms.
 */

import { Token, Counter, QueueEstimationResult, PriorityLevel } from '../types/queue';

/**
 * Calculates estimated wait time based on patients ahead, average service duration,
 * and number of active counters.
 *
 * Formula:
 * Wait Time = Math.round((patientsAhead * avgDurationMinutes) / Math.max(1, activeCounters))
 *
 * If activeCounters === 0, status is NO_COUNTERS with indeterminate wait.
 */
export function calculateWaitTime(
  patientsAhead: number,
  avgDurationMinutes: number,
  activeCounters: number
): QueueEstimationResult {
  if (activeCounters <= 0) {
    return {
      waitMinutes: -1,
      patientsAhead,
      activeCounters: 0,
      avgDurationMinutes,
      status: 'NO_COUNTERS',
      formulaExplanation: 'No active counters are currently serving this department. Queue is paused until staff opens a counter.',
    };
  }

  if (patientsAhead <= 0) {
    return {
      waitMinutes: 0,
      patientsAhead: 0,
      activeCounters,
      avgDurationMinutes,
      status: 'IMMEDIATE',
      formulaExplanation: `0 patients ahead across ${activeCounters} active counter(s). Next available counter will call you immediately.`,
    };
  }

  // Pure formula: (Patients Ahead × Avg Duration) ÷ Active Counters
  const rawWait = (patientsAhead * avgDurationMinutes) / activeCounters;
  const waitMinutes = Math.max(1, Math.round(rawWait));

  let status: 'IMMEDIATE' | 'NORMAL' | 'DELAYED' = 'NORMAL';
  if (waitMinutes > 45) {
    status = 'DELAYED';
  }

  const formulaExplanation = `${patientsAhead} patient(s) ahead × ${avgDurationMinutes} min avg duration ÷ ${activeCounters} active counter(s) = ~${waitMinutes} min`;

  return {
    waitMinutes,
    patientsAhead,
    activeCounters,
    avgDurationMinutes,
    status,
    formulaExplanation,
  };
}

/**
 * Weight mapping for fair priority queue management.
 * Priority patients move forward without starvation of standard patients.
 */
export const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  PEDIATRIC_URGENT: 3,
  SENIOR: 2,
  ACCESSIBILITY: 2,
  STANDARD: 0,
};

/**
 * Compares two tokens for queue ranking:
 * 1. Waiting tokens sorted by: Priority weight (higher first), then registeredAt timestamp (FIFO).
 * Tokens that are already CALLED or SERVING stay ahead.
 */
export function compareTokens(a: Token, b: Token): number {
  // If either is currently serving, serving stays first
  if (a.status === 'SERVING' && b.status !== 'SERVING') return -1;
  if (b.status === 'SERVING' && a.status !== 'SERVING') return 1;

  // If either is called, called is before waiting
  if (a.status === 'CALLED' && b.status === 'WAITING') return -1;
  if (b.status === 'CALLED' && a.status === 'WAITING') return 1;

  // Between two waiting tokens, check priority weight
  const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
  const weightB = PRIORITY_WEIGHTS[b.priority] || 0;

  if (weightA !== weightB) {
    return weightB - weightA; // higher weight comes earlier
  }

  // FIFO based on registration time
  const timeA = new Date(a.registeredAt).getTime();
  const timeB = new Date(b.registeredAt).getTime();
  return timeA - timeB;
}

/**
 * Generates the next sequential unique token ID for a department.
 * E.g., for 'GM', looks at existing IDs 'GM-101', 'GM-102', and produces 'GM-103'.
 */
export function generateNextTokenId(departmentCode: string, existingTokens: Token[]): string {
  const prefix = `${departmentCode}-`;
  const matchingTokens = existingTokens.filter((t) => t.id.startsWith(prefix));

  if (matchingTokens.length === 0) {
    return `${prefix}101`;
  }

  let maxNum = 100;
  for (const token of matchingTokens) {
    const numPart = token.id.replace(prefix, '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed) && parsed > maxNum) {
      maxNum = parsed;
    }
  }

  return `${prefix}${maxNum + 1}`;
}

/**
 * Re-indexes queue positions and recalculates estimated wait times for all tokens
 * within a given department.
 */
export function updateDepartmentQueue(
  allTokens: Token[],
  departmentId: string,
  activeCountersCount: number,
  avgDurationMinutes: number
): Token[] {
  // Split tokens: those in other departments vs this department
  const otherTokens = allTokens.filter((t) => t.departmentId !== departmentId);
  const deptTokens = allTokens.filter((t) => t.departmentId === departmentId);

  // Filter active vs inactive tokens in this dept
  const activeStatuses: Token['status'][] = ['WAITING', 'CALLED', 'SERVING'];
  const activeDeptTokens = deptTokens.filter((t) => activeStatuses.includes(t.status));
  const completedOrCancelled = deptTokens.filter((t) => !activeStatuses.includes(t.status));

  // Sort active tokens fairly
  activeDeptTokens.sort(compareTokens);

  // Re-assign queue positions (1-indexed for waiting tokens)
  let waitingCount = 0;
  const updatedActiveTokens = activeDeptTokens.map((token) => {
    if (token.status === 'SERVING') {
      return {
        ...token,
        queuePosition: 0,
        estimatedWaitMinutes: 0,
      };
    }

    if (token.status === 'CALLED') {
      return {
        ...token,
        queuePosition: 0,
        estimatedWaitMinutes: 1, // Proceed to counter immediately
      };
    }

    // WAITING token
    waitingCount += 1;
    const patientsAhead = waitingCount - 1;
    const estimation = calculateWaitTime(patientsAhead, avgDurationMinutes, activeCountersCount);

    return {
      ...token,
      queuePosition: waitingCount,
      estimatedWaitMinutes: estimation.waitMinutes,
    };
  });

  return [...otherTokens, ...updatedActiveTokens, ...completedOrCancelled];
}

/**
 * Counts how many counters are actively open or busy for a department.
 */
export function countActiveCounters(counters: Counter[], departmentId: string): number {
  return counters.filter(
    (c) => c.departmentId === departmentId && (c.status === 'OPEN' || c.status === 'BUSY')
  ).length;
}

/**
 * Formats patient name for display with optional privacy masking (e.g. "Sarah Jenkins" -> "Sarah J.")
 */
export function maskPatientName(fullName: string): string {
  if (!fullName) return 'Anonymous';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || '';
  return `${firstName} ${lastInitial}.`;
}
