import { CreateScheduleResponse, Schedule, FormSchedule } from '../types/schedule'
import { isCreateScheduleResponse, isSchedule } from '../utils/runtime-type-check'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function createSchedule(schedule: Omit<FormSchedule, 'id' | 'editToken' | 'createdAt' | 'expiresAt'>): Promise<CreateScheduleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: schedule.comment,
      timeSlots: schedule.timeSlots.map(slot => ({
        startTime: new Date(slot.startTime).toISOString(),
        endTime: new Date(slot.endTime).toISOString(),
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  if (!isCreateScheduleResponse(data)) {
    throw new Error('Invalid API response format for createSchedule')
  }
  
  return data
}

export async function getSchedule(id: string): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules/${id}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  if (!isSchedule(data)) {
    throw new Error('Invalid API response format for getSchedule')
  }
  
  return data
}

export async function getScheduleByToken(token: string): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules/edit/${token}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  if (!isSchedule(data)) {
    throw new Error('Invalid API response format for getScheduleByToken')
  }
  
  return data
}

export async function updateSchedule(token: string, schedule: Omit<Schedule, 'id' | 'editToken' | 'createdAt' | 'expiresAt'>): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules/edit/${token}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: schedule.comment,
      timeSlots: schedule.timeSlots.map(slot => ({
        startTime: new Date(slot.StartTime).toISOString(),
        endTime: new Date(slot.EndTime).toISOString(),
        available: true,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  if (!isSchedule(data)) {
    throw new Error('Invalid API response format for updateSchedule')
  }
  
  return data
}

export async function deleteSchedule(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules/edit/${token}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}