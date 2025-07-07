/**
 * APIレスポンスのランタイム型チェック用ユーティリティ
 */

import { CreateScheduleResponse, Schedule } from '../types/schedule'

/**
 * 値がstring型かチェック
 */
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 値がnumber型かチェック
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

/**
 * 値がboolean型かチェック
 */
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 値がobject型（null除く）かチェック
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 値がArray型かチェック
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * CreateScheduleResponseの型チェック
 */
export function isCreateScheduleResponse(data: unknown): data is CreateScheduleResponse {
  if (!isObject(data)) {
    return false
  }

  return (
    isString(data.id) &&
    isString(data.editToken) &&
    isString(data.comment) &&
    isArray(data.timeSlots) &&
    data.timeSlots.every(slot => 
      isObject(slot) &&
      isString(slot.id) &&
      isString(slot.StartTime) &&
      isString(slot.EndTime) &&
      isBoolean(slot.Available)
    ) &&
    isString(data.createdAt) &&
    isString(data.expiresAt)
  )
}

/**
 * Scheduleの型チェック
 */
export function isSchedule(data: unknown): data is Schedule {
  if (!isObject(data)) {
    return false
  }

  return (
    isString(data.id) &&
    isString(data.comment) &&
    isArray(data.timeSlots) &&
    data.timeSlots.every(slot => 
      isObject(slot) &&
      isString(slot.id) &&
      isString(slot.StartTime) &&
      isString(slot.EndTime) &&
      isBoolean(slot.Available)
    ) &&
    isString(data.createdAt) &&
    isString(data.expiresAt)
  )
}

/**
 * APIエラーレスポンスの型チェック
 */
export interface APIErrorResponse {
  error: string
  message?: string
}

export function isAPIErrorResponse(data: unknown): data is APIErrorResponse {
  return (
    isObject(data) &&
    isString(data.error)
  )
}