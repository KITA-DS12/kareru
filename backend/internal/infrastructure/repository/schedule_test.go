package repository

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"kareru-backend/internal/domain/model"
	"kareru-backend/internal/infrastructure/firestore"
)

// TDDテストリスト:
// 1. スケジュールの作成が成功すること
// 2. IDでスケジュールを取得できること
// 3. 存在しないIDで取得するとエラーになること
// 4. 編集トークンの検証が正しく動作すること
// 5. 期限切れのスケジュールを取得できること
// 6. スケジュールの更新が成功すること
// 7. スケジュールの削除が成功すること

// setupTestEnvironment はテスト実行前の環境設定を行う
func setupTestEnvironment() {
	// ローカルテスト実行時にFirestoreエミュレータを使用
	if os.Getenv("FIRESTORE_EMULATOR_HOST") == "" {
		os.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8081")
	}
}

func TestScheduleRepository_Create(t *testing.T) {
	// テスト環境でFirestoreエミュレータを使用
	setupTestEnvironment()
	
	ctx := context.Background()
	client, err := firestore.NewClient(ctx)
	require.NoError(t, err)
	defer client.Close()

	repo := NewScheduleRepository(client)

	schedule := &model.Schedule{
		ID:        "test-uuid",
		EditToken: "test-token",
		TimeSlots: []model.TimeSlot{
			{
				StartTime: time.Now(),
				EndTime:   time.Now().Add(1 * time.Hour),
				Available: true,
			},
		},
		Comment:   "テストコメント",
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	err = repo.Create(ctx, schedule)
	assert.NoError(t, err)
}

func TestScheduleRepository_GetByID(t *testing.T) {
	// テスト環境でFirestoreエミュレータを使用
	setupTestEnvironment()
	
	ctx := context.Background()
	client, err := firestore.NewClient(ctx)
	require.NoError(t, err)
	defer client.Close()

	repo := NewScheduleRepository(client)

	schedule := &model.Schedule{
		ID:        "test-get-uuid",
		EditToken: "test-get-token",
		TimeSlots: []model.TimeSlot{
			{
				StartTime: time.Now(),
				EndTime:   time.Now().Add(1 * time.Hour),
				Available: true,
			},
		},
		Comment:   "取得テスト用",
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	err = repo.Create(ctx, schedule)
	require.NoError(t, err)

	retrieved, err := repo.GetByID(ctx, "test-get-uuid")
	require.NoError(t, err)
	assert.Equal(t, schedule.ID, retrieved.ID)
	assert.Equal(t, schedule.EditToken, retrieved.EditToken)
	assert.Equal(t, schedule.Comment, retrieved.Comment)
}

func TestScheduleRepository_GetByID_NotFound(t *testing.T) {
	// テスト環境でFirestoreエミュレータを使用
	setupTestEnvironment()
	
	ctx := context.Background()
	client, err := firestore.NewClient(ctx)
	require.NoError(t, err)
	defer client.Close()

	repo := NewScheduleRepository(client)

	_, err = repo.GetByID(ctx, "non-existent-id")
	assert.Error(t, err)
}

