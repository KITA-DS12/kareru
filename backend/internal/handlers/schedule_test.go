package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"kareru-backend/internal/domain/model"
)

// MockScheduleRepository はテスト用のモックリポジトリ
type MockScheduleRepository struct {
	schedules map[string]*model.Schedule
	createErr error
	getErr    error
	updateErr error
	deleteErr error
}

func NewMockScheduleRepository() *MockScheduleRepository {
	return &MockScheduleRepository{
		schedules: make(map[string]*model.Schedule),
	}
}

func (m *MockScheduleRepository) Create(schedule *model.Schedule) error {
	if m.createErr != nil {
		return m.createErr
	}
	m.schedules[schedule.ID] = schedule
	return nil
}

func (m *MockScheduleRepository) GetByID(id string) (*model.Schedule, error) {
	if m.getErr != nil {
		return nil, m.getErr
	}
	schedule, exists := m.schedules[id]
	if !exists {
		return nil, nil
	}
	return schedule, nil
}

func (m *MockScheduleRepository) Update(schedule *model.Schedule) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	m.schedules[schedule.ID] = schedule
	return nil
}

func (m *MockScheduleRepository) GetByEditToken(token string) (*model.Schedule, error) {
	if m.getErr != nil {
		return nil, m.getErr
	}
	for _, schedule := range m.schedules {
		if schedule.EditToken == token {
			return schedule, nil
		}
	}
	return nil, nil
}

func (m *MockScheduleRepository) Delete(id string) error {
	if m.deleteErr != nil {
		return m.deleteErr
	}
	delete(m.schedules, id)
	return nil
}


func TestCreateSchedule(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("有効なリクエストでスケジュールを作成できる", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		handler := NewScheduleHandler(mockRepo)
		
		router.POST("/schedules", handler.CreateSchedule)

		now := time.Now()
		reqBody := CreateScheduleRequest{
			TimeSlots: []TimeSlotRequest{
				{
					StartTime: now.Add(1 * time.Hour),
					EndTime:   now.Add(2 * time.Hour),
				},
			},
			Comment: "テストスケジュール",
		}

		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest(http.MethodPost, "/schedules", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		// 正常に作成されることを確認
		assert.Equal(t, http.StatusCreated, w.Code)
		
		var response CreateScheduleResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response.ID)
		assert.NotEmpty(t, response.EditToken)
		assert.Equal(t, "テストスケジュール", response.Comment)
		assert.Len(t, response.TimeSlots, 1)
	})

}

func TestGetSchedule(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("存在するUUIDでスケジュールを取得できる", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		handler := NewScheduleHandler(mockRepo)
		
		// テスト用のスケジュールを事前に作成
		testSchedule := &model.Schedule{
			ID:        "test-uuid-123",
			EditToken: "test-token",
			Comment:   "テストスケジュール",
			CreatedAt: time.Now(),
			ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
			TimeSlots: []model.TimeSlot{
				{
					StartTime: time.Now().Add(1 * time.Hour),
					EndTime:   time.Now().Add(2 * time.Hour),
				},
			},
		}
		mockRepo.schedules[testSchedule.ID] = testSchedule
		
		router.GET("/schedules/:uuid", handler.GetSchedule)

		req := httptest.NewRequest(http.MethodGet, "/schedules/test-uuid-123", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		// 正常に取得できることを確認
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response GetScheduleResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "test-uuid-123", response.ID)
		assert.Equal(t, "テストスケジュール", response.Comment)
		assert.Len(t, response.TimeSlots, 1)
	})


	t.Run("失効したスケジュールで410エラーを返す", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		handler := NewScheduleHandler(mockRepo)
		
		// 失効したテスト用のスケジュールを事前に作成
		expiredSchedule := &model.Schedule{
			ID:        "expired-uuid-123",
			EditToken: "expired-token",
			Comment:   "失効したスケジュール",
			CreatedAt: time.Now().Add(-8 * 24 * time.Hour),
			ExpiresAt: time.Now().Add(-1 * time.Hour), // 1時間前に失効
			TimeSlots: []model.TimeSlot{},
		}
		mockRepo.schedules[expiredSchedule.ID] = expiredSchedule
		
		router.GET("/schedules/:uuid", handler.GetSchedule)

		req := httptest.NewRequest(http.MethodGet, "/schedules/expired-uuid-123", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		// 410 Gone エラーが返されることを確認
		assert.Equal(t, http.StatusGone, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "schedule has expired")
	})
}

func TestUpdateSchedule(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("正しい編集トークンでスケジュールを更新できる", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		handler := NewScheduleHandler(mockRepo)
		
		// テスト用のスケジュールを事前に作成
		testSchedule := &model.Schedule{
			ID:        "test-uuid-123",
			EditToken: "test-token",
			Comment:   "元のコメント",
			CreatedAt: time.Now(),
			ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
			TimeSlots: []model.TimeSlot{},
		}
		mockRepo.schedules[testSchedule.ID] = testSchedule
		
		router.PUT("/schedules/:uuid", handler.UpdateSchedule)

		now := time.Now()
		reqBody := UpdateScheduleRequest{
			EditToken: "test-token",
			TimeSlots: []TimeSlotRequest{
				{
					StartTime: now.Add(1 * time.Hour),
					EndTime:   now.Add(2 * time.Hour),
				},
			},
			Comment: "更新されたコメント",
		}

		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest(http.MethodPut, "/schedules/test-uuid-123", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		// 正常に更新できることを確認
		assert.Equal(t, http.StatusOK, w.Code)
		
		var response GetScheduleResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "test-uuid-123", response.ID)
		assert.Equal(t, "更新されたコメント", response.Comment)
		assert.Len(t, response.TimeSlots, 1)
	})

	t.Run("失効したスケジュールで410エラーを返す", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		handler := NewScheduleHandler(mockRepo)
		
		// 失効したテスト用のスケジュールを事前に作成
		expiredSchedule := &model.Schedule{
			ID:        "expired-uuid-456",
			EditToken: "expired-token",
			Comment:   "失効したスケジュール",
			CreatedAt: time.Now().Add(-8 * 24 * time.Hour),
			ExpiresAt: time.Now().Add(-1 * time.Hour), // 1時間前に失効
			TimeSlots: []model.TimeSlot{},
		}
		mockRepo.schedules[expiredSchedule.ID] = expiredSchedule
		
		router.PUT("/schedules/:uuid", handler.UpdateSchedule)

		reqBody := UpdateScheduleRequest{
			EditToken: "expired-token",
			TimeSlots: []TimeSlotRequest{},
			Comment:   "更新を試行",
		}

		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest(http.MethodPut, "/schedules/expired-uuid-456", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		// 410 Gone エラーが返されることを確認
		assert.Equal(t, http.StatusGone, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "schedule has expired")
	})

}

func TestDeleteSchedule(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("正しい編集トークンでスケジュールを削除できる", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		handler := NewScheduleHandler(mockRepo)
		
		// テスト用のスケジュールを事前に作成
		testSchedule := &model.Schedule{
			ID:        "test-uuid-123",
			EditToken: "test-token",
			Comment:   "削除予定のスケジュール",
			CreatedAt: time.Now(),
			ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
			TimeSlots: []model.TimeSlot{},
		}
		mockRepo.schedules[testSchedule.ID] = testSchedule
		
		router.DELETE("/schedules/:uuid", handler.DeleteSchedule)

		reqBody := DeleteScheduleRequest{
			EditToken: "test-token",
		}

		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest(http.MethodDelete, "/schedules/test-uuid-123", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		// 正常に削除できることを確認（204 No Content）
		assert.Equal(t, http.StatusNoContent, w.Code)
		
		// スケジュールが削除されていることを確認
		_, exists := mockRepo.schedules["test-uuid-123"]
		assert.False(t, exists)
	})

	
	t.Run("失効したスケジュールで410エラーを返す", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		handler := NewScheduleHandler(mockRepo)
		
		// 失効したテスト用のスケジュールを事前に作成
		expiredSchedule := &model.Schedule{
			ID:        "expired-uuid-789",
			EditToken: "expired-token",
			Comment:   "失効したスケジュール",
			CreatedAt: time.Now().Add(-8 * 24 * time.Hour),
			ExpiresAt: time.Now().Add(-1 * time.Hour), // 1時間前に失効
			TimeSlots: []model.TimeSlot{},
		}
		mockRepo.schedules[expiredSchedule.ID] = expiredSchedule
		
		router.DELETE("/schedules/:uuid", handler.DeleteSchedule)

		reqBody := DeleteScheduleRequest{
			EditToken: "expired-token",
		}

		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest(http.MethodDelete, "/schedules/expired-uuid-789", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		// 410 Gone エラーが返されることを確認
		assert.Equal(t, http.StatusGone, w.Code)
		
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "schedule has expired")
	})
}


