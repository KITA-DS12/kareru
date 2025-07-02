package seed

import (
	"context"
	"time"

	"kareru-backend/internal/domain/model"
	"kareru-backend/internal/infrastructure/firestore"
	"kareru-backend/internal/infrastructure/repository"
)

func SeedSchedules(ctx context.Context, client *firestore.Client) error {
	repo := repository.NewScheduleRepository(client)
	
	now := time.Now()
	
	schedules := []*model.Schedule{
		{
			ID:        "sample-schedule-1",
			EditToken: "token-123",
			TimeSlots: []model.TimeSlot{
				{
					StartTime: now.Add(1 * time.Hour),
					EndTime:   now.Add(2 * time.Hour),
					Available: true,
				},
				{
					StartTime: now.Add(3 * time.Hour),
					EndTime:   now.Add(4 * time.Hour),
					Available: false,
				},
			},
			Comment:   "サンプルスケジュール1",
			CreatedAt: now,
			ExpiresAt: now.Add(7 * 24 * time.Hour),
		},
		{
			ID:        "sample-schedule-2",
			EditToken: "token-456",
			TimeSlots: []model.TimeSlot{
				{
					StartTime: now.Add(24 * time.Hour),
					EndTime:   now.Add(27 * time.Hour),
					Available: true,
				},
			},
			Comment:   "明日の予定",
			CreatedAt: now,
			ExpiresAt: now.Add(7 * 24 * time.Hour),
		},
	}
	
	for _, schedule := range schedules {
		if err := repo.Create(ctx, schedule); err != nil {
			return err
		}
	}
	
	return nil
}