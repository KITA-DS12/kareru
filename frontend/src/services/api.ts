import { CreateScheduleResponse, Schedule } from '../types/schedule'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function createSchedule(schedule: Omit<Schedule, 'id' | 'editToken' | 'createdAt' | 'expiresAt'>): Promise<CreateScheduleResponse> {
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

  return response.json()
}

export async function getSchedule(id: string): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules/${id}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getScheduleByToken(token: string): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules/edit/${token}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
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
        startTime: slot.StartTime,
        endTime: slot.EndTime,
        available: slot.Available,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function deleteSchedule(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/schedules/edit/${token}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}