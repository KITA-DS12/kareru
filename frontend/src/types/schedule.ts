export interface TimeSlot {
  id?: string
  StartTime: string
  EndTime: string
}

export interface FormTimeSlot {
  id?: string
  startTime: string
  endTime: string
}

export interface Schedule {
  id?: string
  comment: string
  timeSlots: TimeSlot[]
  editToken?: string
  createdAt?: string
  expiresAt?: string
}

export interface FormSchedule {
  id?: string
  comment: string
  timeSlots: FormTimeSlot[]
  editToken?: string
  createdAt?: string
  expiresAt?: string
}

export interface CreateScheduleResponse {
  id: string
  editToken: string
  comment: string
  timeSlots: TimeSlot[]
  createdAt: string
  expiresAt: string
}