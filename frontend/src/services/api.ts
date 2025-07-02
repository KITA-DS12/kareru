import { CreateScheduleResponse, Schedule } from '../types/schedule'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function createSchedule(schedule: Omit<Schedule, 'id' | 'editToken' | 'createdAt' | 'expiresAt'>): Promise<CreateScheduleResponse> {
  const response = await fetch(`${API_BASE_URL}/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: schedule.comment,
      timeSlots: schedule.timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getSchedule(id: string): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}