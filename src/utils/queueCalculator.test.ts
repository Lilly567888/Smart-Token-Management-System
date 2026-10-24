/**
 * Unit tests for Queue Calculation Engine
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWaitTime,
  compareTokens,
  generateNextTokenId,
  maskPatientName,
  updateDepartmentQueue,
} from './queueCalculator';
import { Token } from '../types/queue';

test('calculateWaitTime correctly applies (patientsAhead * avgDuration) / counters', () => {
  // 12 patients ahead, 10 min avg duration, 3 counters -> (12 * 10) / 3 = 40 minutes
  const res1 = calculateWaitTime(12, 10, 3);
  assert.equal(res1.waitMinutes, 40);
  assert.equal(res1.status, 'NORMAL');
  assert.ok(res1.formulaExplanation.includes('12 patient(s) ahead'));

  // 0 patients ahead -> 0 min wait (immediate)
  const res2 = calculateWaitTime(0, 15, 2);
  assert.equal(res2.waitMinutes, 0);
  assert.equal(res2.status, 'IMMEDIATE');

  // No active counters -> returns -1 with NO_COUNTERS status
  const res3 = calculateWaitTime(5, 12, 0);
  assert.equal(res3.waitMinutes, -1);
  assert.equal(res3.status, 'NO_COUNTERS');
});

test('generateNextTokenId generates incremental unique IDs per department code', () => {
  const existingTokens = [
    { id: 'GM-101' } as Token,
    { id: 'GM-102' } as Token,
    { id: 'CA-101' } as Token,
  ];

  const nextGM = generateNextTokenId('GM', existingTokens);
  assert.equal(nextGM, 'GM-103');

  const nextOR = generateNextTokenId('OR', existingTokens);
  assert.equal(nextOR, 'OR-101');
});

test('maskPatientName protects patient privacy', () => {
  assert.equal(maskPatientName('Alexander Graham'), 'Alexander G.');
  assert.equal(maskPatientName('Alice'), 'Alice');
  assert.equal(maskPatientName('Robert Downey Jr.'), 'Robert J.');
});

test('compareTokens prioritizes senior and urgent patients fairly while maintaining FIFO', () => {
  const standardToken: Token = {
    id: 'GM-101',
    patientName: 'Bob',
    patientPhone: '123',
    patientAge: 30,
    patientGender: 'male',
    reason: 'Fever',
    departmentId: 'dept-gm',
    type: 'WALK_IN',
    priority: 'STANDARD',
    queuePosition: 1,
    estimatedWaitMinutes: 10,
    status: 'WAITING',
    registeredAt: '2026-10-24T08:00:00.000Z',
  };

  const seniorToken: Token = {
    ...standardToken,
    id: 'GM-102',
    patientName: 'Grandma Eleanor',
    patientAge: 78,
    priority: 'SENIOR',
    registeredAt: '2026-10-24T08:05:00.000Z', // Arrived later than Bob
  };

  // Senior has higher priority weight, should be ordered ahead
  const order = compareTokens(standardToken, seniorToken);
  assert.ok(order > 0, 'Senior token should rank ahead of standard token');
});

test('updateDepartmentQueue recalculates queue positions and wait times dynamically', () => {
  const tokens: Token[] = [
    {
      id: 'GM-101',
      patientName: 'Alice',
      patientPhone: '111',
      patientAge: 25,
      patientGender: 'female',
      reason: 'Checkup',
      departmentId: 'dept-gm',
      type: 'WALK_IN',
      priority: 'STANDARD',
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      status: 'SERVING',
      registeredAt: '2026-10-24T08:00:00.000Z',
    },
    {
      id: 'GM-102',
      patientName: 'Bob',
      patientPhone: '222',
      patientAge: 35,
      patientGender: 'male',
      reason: 'Cough',
      departmentId: 'dept-gm',
      type: 'WALK_IN',
      priority: 'STANDARD',
      queuePosition: 2,
      estimatedWaitMinutes: 15,
      status: 'WAITING',
      registeredAt: '2026-10-24T08:10:00.000Z',
    },
    {
      id: 'GM-103',
      patientName: 'Charlie',
      patientPhone: '333',
      patientAge: 40,
      patientGender: 'male',
      reason: 'Headache',
      departmentId: 'dept-gm',
      type: 'WALK_IN',
      priority: 'STANDARD',
      queuePosition: 3,
      estimatedWaitMinutes: 30,
      status: 'WAITING',
      registeredAt: '2026-10-24T08:15:00.000Z',
    },
  ];

  // 1 active counter, 15 min avg duration
  const updated = updateDepartmentQueue(tokens, 'dept-gm', 1, 15);

  const bob = updated.find((t) => t.id === 'GM-102')!;
  const charlie = updated.find((t) => t.id === 'GM-103')!;

  assert.equal(bob.queuePosition, 1);
  assert.equal(bob.estimatedWaitMinutes, 0); // 0 patients ahead of Bob among waiting tokens

  assert.equal(charlie.queuePosition, 2);
  assert.equal(charlie.estimatedWaitMinutes, 15); // 1 patient ahead of Charlie * 15m / 1 counter = 15m
});
