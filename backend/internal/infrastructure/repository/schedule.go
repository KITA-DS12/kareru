package repository

import (
	"context"
	"fmt"

	"kareru-backend/internal/domain/model"
	firestoreClient "kareru-backend/internal/infrastructure/firestore"
)

type ScheduleRepository struct {
	client *firestoreClient.Client
}

func NewScheduleRepository(client *firestoreClient.Client) *ScheduleRepository {
	return &ScheduleRepository{
		client: client,
	}
}

func (r *ScheduleRepository) Create(ctx context.Context, schedule *model.Schedule) error {
	doc := r.client.Collection("schedules").Doc(schedule.ID)
	_, err := doc.Set(ctx, map[string]interface{}{
		"id":        schedule.ID,
		"editToken": schedule.EditToken,
		"timeSlots": r.convertTimeSlotsToFirestore(schedule.TimeSlots),
		"comment":   schedule.Comment,
		"createdAt": schedule.CreatedAt,
		"expiresAt": schedule.ExpiresAt,
	})
	if err != nil {
		return fmt.Errorf("failed to create schedule: %w", err)
	}
	return nil
}

func (r *ScheduleRepository) GetByID(ctx context.Context, id string) (*model.Schedule, error) {
	doc, err := r.client.Collection("schedules").Doc(id).Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get schedule: %w", err)
	}

	data := doc.Data()
	return r.convertFirestoreToSchedule(data)
}

func (r *ScheduleRepository) convertTimeSlotsToFirestore(slots []model.TimeSlot) []map[string]interface{} {
	result := make([]map[string]interface{}, len(slots))
	for i, slot := range slots {
		result[i] = map[string]interface{}{
			"startTime": slot.StartTime,
			"endTime":   slot.EndTime,
			"available": slot.Available,
		}
	}
	return result
}

func (r *ScheduleRepository) convertFirestoreToSchedule(data map[string]interface{}) (*model.Schedule, error) {
	schedule := &model.Schedule{}

	if id, ok := data["id"].(string); ok {
		schedule.ID = id
	}

	if editToken, ok := data["editToken"].(string); ok {
		schedule.EditToken = editToken
	}

	if comment, ok := data["comment"].(string); ok {
		schedule.Comment = comment
	}

	return schedule, nil
}
