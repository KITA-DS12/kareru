package routes

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
	"kareru-backend/internal/handlers"
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

func TestScheduleAPIIntegration(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("スケジュールの完全なCRUDワークフロー", func(t *testing.T) {
		// セットアップ
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		scheduleHandler := handlers.NewScheduleHandler(mockRepo)
		SetupRoutes(router, scheduleHandler)

		now := time.Now()

		// 1. スケジュール作成
		createReq := handlers.CreateScheduleRequest{
			TimeSlots: []handlers.TimeSlotRequest{
				{
					StartTime: now.Add(1 * time.Hour),
					EndTime:   now.Add(2 * time.Hour),
				},
			},
			Comment: "統合テスト用スケジュール",
		}

		body, _ := json.Marshal(createReq)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/schedules", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		
		var createResp handlers.CreateScheduleResponse
		err := json.Unmarshal(w.Body.Bytes(), &createResp)
		assert.NoError(t, err)
		assert.NotEmpty(t, createResp.ID)
		assert.NotEmpty(t, createResp.EditToken)
		
		scheduleID := createResp.ID
		editToken := createResp.EditToken

		// 2. スケジュール取得
		req = httptest.NewRequest(http.MethodGet, "/api/v1/schedules/"+scheduleID, nil)
		w = httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var getResp handlers.GetScheduleResponse
		err = json.Unmarshal(w.Body.Bytes(), &getResp)
		assert.NoError(t, err)
		assert.Equal(t, scheduleID, getResp.ID)
		assert.Equal(t, "統合テスト用スケジュール", getResp.Comment)

		// 3. スケジュール更新
		updateReq := handlers.UpdateScheduleRequest{
			EditToken: editToken,
			TimeSlots: []handlers.TimeSlotRequest{
				{
					StartTime: now.Add(2 * time.Hour),
					EndTime:   now.Add(3 * time.Hour),
				},
			},
			Comment: "更新された統合テスト用スケジュール",
		}

		body, _ = json.Marshal(updateReq)
		req = httptest.NewRequest(http.MethodPut, "/api/v1/schedules/"+scheduleID, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var updateResp handlers.GetScheduleResponse
		err = json.Unmarshal(w.Body.Bytes(), &updateResp)
		assert.NoError(t, err)
		assert.Equal(t, "更新された統合テスト用スケジュール", updateResp.Comment)

		// 4. スケジュール削除
		deleteReq := handlers.DeleteScheduleRequest{
			EditToken: editToken,
		}

		body, _ = json.Marshal(deleteReq)
		req = httptest.NewRequest(http.MethodDelete, "/api/v1/schedules/"+scheduleID, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w = httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)

		// 5. 削除後の取得確認（404になるはず）
		req = httptest.NewRequest(http.MethodGet, "/api/v1/schedules/"+scheduleID, nil)
		w = httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("ヘルスチェックエンドポイント", func(t *testing.T) {
		router := gin.New()
		mockRepo := NewMockScheduleRepository()
		scheduleHandler := handlers.NewScheduleHandler(mockRepo)
		SetupRoutes(router, scheduleHandler)

		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "ok")
	})
}