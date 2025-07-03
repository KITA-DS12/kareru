package repository

import (
	"fmt"
	"sync"

	"kareru-backend/internal/domain/model"
)

type MemoryScheduleRepository struct {
	mu        sync.RWMutex
	schedules map[string]*model.Schedule
}

func NewMemoryScheduleRepository() *MemoryScheduleRepository {
	return &MemoryScheduleRepository{
		schedules: make(map[string]*model.Schedule),
	}
}

func (r *MemoryScheduleRepository) Create(schedule *model.Schedule) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	r.schedules[schedule.ID] = schedule
	return nil
}

func (r *MemoryScheduleRepository) GetByID(id string) (*model.Schedule, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	schedule, exists := r.schedules[id]
	if !exists {
		return nil, fmt.Errorf("schedule not found")
	}
	return schedule, nil
}

func (r *MemoryScheduleRepository) Update(schedule *model.Schedule) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	if _, exists := r.schedules[schedule.ID]; !exists {
		return fmt.Errorf("schedule not found")
	}
	
	r.schedules[schedule.ID] = schedule
	return nil
}

func (r *MemoryScheduleRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	if _, exists := r.schedules[id]; !exists {
		return fmt.Errorf("schedule not found")
	}
	
	delete(r.schedules, id)
	return nil
}

func (r *MemoryScheduleRepository) GetByEditToken(token string) (*model.Schedule, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	for _, schedule := range r.schedules {
		if schedule.EditToken == token {
			return schedule, nil
		}
	}
	return nil, fmt.Errorf("schedule not found")
}