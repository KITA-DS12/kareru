package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"kareru-backend/internal/domain/model"
)

// ScheduleRepository はスケジュール操作のインターフェース
type ScheduleRepository interface {
	Create(schedule *model.Schedule) error
	GetByID(id string) (*model.Schedule, error)
	GetByEditToken(token string) (*model.Schedule, error)
	Update(schedule *model.Schedule) error
	Delete(id string) error
}

// ScheduleHandler はスケジュール関連のHTTPハンドラー
type ScheduleHandler struct {
	repo ScheduleRepository
}

// NewScheduleHandler は新しいScheduleHandlerを作成
func NewScheduleHandler(repo ScheduleRepository) *ScheduleHandler {
	return &ScheduleHandler{
		repo: repo,
	}
}

// CreateSchedule はスケジュール作成ハンドラー
func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
	var req CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body: " + err.Error(),
		})
		return
	}

	// 新しいスケジュールを作成
	schedule, err := model.NewSchedule()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create schedule",
		})
		return
	}

	// リクエストからタイムスロットを変換
	timeSlots := make([]model.TimeSlot, len(req.TimeSlots))
	for i, ts := range req.TimeSlots {
		timeSlots[i] = model.TimeSlot{
			StartTime: ts.StartTime,
			EndTime:   ts.EndTime,
		}
	}

	schedule.TimeSlots = timeSlots
	schedule.Comment = req.Comment

	// バリデーション
	if err := schedule.ValidateTimeSlots(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// リポジトリに保存
	if err := h.repo.Create(schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to save schedule",
		})
		return
	}

	// レスポンスを作成
	response := CreateScheduleResponse{
		ID:        schedule.ID,
		EditToken: schedule.EditToken,
		TimeSlots: schedule.TimeSlots,
		Comment:   schedule.Comment,
		CreatedAt: schedule.CreatedAt,
		ExpiresAt: schedule.ExpiresAt,
	}

	c.JSON(http.StatusCreated, response)
}

// GetSchedule はスケジュール取得ハンドラー
func (h *ScheduleHandler) GetSchedule(c *gin.Context) {
	uuid := c.Param("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "uuid is required",
		})
		return
	}

	// スケジュールを取得
	schedule, err := h.repo.GetByID(uuid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get schedule",
		})
		return
	}

	if schedule == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "schedule not found",
		})
		return
	}

	// 失効チェック
	if schedule.IsExpired() {
		c.JSON(http.StatusGone, gin.H{
			"error": "schedule has expired",
		})
		return
	}

	// レスポンスを作成（編集トークンは除外）
	response := GetScheduleResponse{
		ID:        schedule.ID,
		TimeSlots: schedule.TimeSlots,
		Comment:   schedule.Comment,
		CreatedAt: schedule.CreatedAt,
		ExpiresAt: schedule.ExpiresAt,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateSchedule はスケジュール更新ハンドラー
func (h *ScheduleHandler) UpdateSchedule(c *gin.Context) {
	uuid := c.Param("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "uuid is required",
		})
		return
	}

	var req UpdateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	// 編集トークンの確認
	if req.EditToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "edit token is required",
		})
		return
	}

	// スケジュールを取得
	schedule, err := h.repo.GetByID(uuid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get schedule",
		})
		return
	}

	if schedule == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "schedule not found",
		})
		return
	}

	// 失効チェック
	if schedule.IsExpired() {
		c.JSON(http.StatusGone, gin.H{
			"error": "schedule has expired",
		})
		return
	}

	// 編集トークンの検証
	if err := schedule.VerifyEditToken(req.EditToken); err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "invalid edit token",
		})
		return
	}

	// リクエストからタイムスロットを変換
	timeSlots := make([]model.TimeSlot, len(req.TimeSlots))
	for i, ts := range req.TimeSlots {
		timeSlots[i] = model.TimeSlot{
			StartTime: ts.StartTime,
			EndTime:   ts.EndTime,
		}
	}

	// スケジュールを更新
	schedule.TimeSlots = timeSlots
	schedule.Comment = req.Comment

	// バリデーション
	if err := schedule.ValidateTimeSlots(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// リポジトリで更新
	if err := h.repo.Update(schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update schedule",
		})
		return
	}

	// レスポンスを作成（編集トークンは除外）
	response := GetScheduleResponse{
		ID:        schedule.ID,
		TimeSlots: schedule.TimeSlots,
		Comment:   schedule.Comment,
		CreatedAt: schedule.CreatedAt,
		ExpiresAt: schedule.ExpiresAt,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateScheduleRequest はスケジュール更新リクエスト
type UpdateScheduleRequest struct {
	EditToken string            `json:"editToken"`
	TimeSlots []TimeSlotRequest `json:"timeSlots"`
	Comment   string            `json:"comment"`
}

// GetScheduleResponse はスケジュール取得レスポンス
type GetScheduleResponse struct {
	ID        string           `json:"id"`
	TimeSlots []model.TimeSlot `json:"timeSlots"`
	Comment   string           `json:"comment"`
	CreatedAt time.Time        `json:"createdAt"`
	ExpiresAt time.Time        `json:"expiresAt"`
}

// CreateScheduleRequest はスケジュール作成リクエスト
type CreateScheduleRequest struct {
	TimeSlots []TimeSlotRequest `json:"timeSlots"`
	Comment   string            `json:"comment"`
}

type TimeSlotRequest struct {
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
}

// CreateScheduleResponse はスケジュール作成レスポンス
type CreateScheduleResponse struct {
	ID        string           `json:"id"`
	EditToken string           `json:"editToken"`
	TimeSlots []model.TimeSlot `json:"timeSlots"`
	Comment   string           `json:"comment"`
	CreatedAt time.Time        `json:"createdAt"`
	ExpiresAt time.Time        `json:"expiresAt"`
}

// DeleteSchedule はスケジュール削除ハンドラー
func (h *ScheduleHandler) DeleteSchedule(c *gin.Context) {
	uuid := c.Param("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "uuid is required",
		})
		return
	}

	var req DeleteScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	// 編集トークンの確認
	if req.EditToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "edit token is required",
		})
		return
	}

	// スケジュールを取得
	schedule, err := h.repo.GetByID(uuid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get schedule",
		})
		return
	}

	if schedule == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "schedule not found",
		})
		return
	}

	// 失効チェック
	if schedule.IsExpired() {
		c.JSON(http.StatusGone, gin.H{
			"error": "schedule has expired",
		})
		return
	}

	// 編集トークンの検証
	if err := schedule.VerifyEditToken(req.EditToken); err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "invalid edit token",
		})
		return
	}

	// スケジュールを削除
	if err := h.repo.Delete(uuid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete schedule",
		})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// DeleteScheduleRequest はスケジュール削除リクエスト
type DeleteScheduleRequest struct {
	EditToken string `json:"editToken"`
}

// GetScheduleByEditToken は編集トークンでスケジュール取得ハンドラー
func (h *ScheduleHandler) GetScheduleByEditToken(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "edit token is required",
		})
		return
	}

	// 編集トークンでスケジュールを取得
	schedule, err := h.repo.GetByEditToken(token)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "編集権限がありません",
		})
		return
	}

	if schedule == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "schedule not found",
		})
		return
	}

	// 失効チェック
	if schedule.IsExpired() {
		c.JSON(http.StatusGone, gin.H{
			"error": "schedule has expired",
		})
		return
	}

	// レスポンスを作成
	response := GetScheduleResponse{
		ID:        schedule.ID,
		TimeSlots: schedule.TimeSlots,
		Comment:   schedule.Comment,
		CreatedAt: schedule.CreatedAt,
		ExpiresAt: schedule.ExpiresAt,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateScheduleByEditToken は編集トークンでスケジュール更新ハンドラー
func (h *ScheduleHandler) UpdateScheduleByEditToken(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "edit token is required",
		})
		return
	}

	var req UpdateScheduleByEditTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	// 編集トークンでスケジュールを取得
	schedule, err := h.repo.GetByEditToken(token)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "編集権限がありません",
		})
		return
	}

	if schedule == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "schedule not found",
		})
		return
	}

	// 失効チェック
	if schedule.IsExpired() {
		c.JSON(http.StatusGone, gin.H{
			"error": "schedule has expired",
		})
		return
	}

	// リクエストからタイムスロットを変換
	timeSlots := make([]model.TimeSlot, len(req.TimeSlots))
	for i, ts := range req.TimeSlots {
		timeSlots[i] = model.TimeSlot{
			StartTime: ts.StartTime,
			EndTime:   ts.EndTime,
			Available: ts.Available,
		}
	}

	// スケジュールを更新
	schedule.TimeSlots = timeSlots
	schedule.Comment = req.Comment

	// バリデーション
	if err := schedule.ValidateTimeSlots(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// リポジトリで更新
	if err := h.repo.Update(schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update schedule",
		})
		return
	}

	// レスポンスを作成
	response := GetScheduleResponse{
		ID:        schedule.ID,
		TimeSlots: schedule.TimeSlots,
		Comment:   schedule.Comment,
		CreatedAt: schedule.CreatedAt,
		ExpiresAt: schedule.ExpiresAt,
	}

	c.JSON(http.StatusOK, response)
}

// DeleteScheduleByEditToken は編集トークンでスケジュール削除ハンドラー
func (h *ScheduleHandler) DeleteScheduleByEditToken(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "edit token is required",
		})
		return
	}

	// 編集トークンでスケジュールを取得
	schedule, err := h.repo.GetByEditToken(token)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "編集権限がありません",
		})
		return
	}

	if schedule == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "schedule not found",
		})
		return
	}

	// 失効チェック
	if schedule.IsExpired() {
		c.JSON(http.StatusGone, gin.H{
			"error": "schedule has expired",
		})
		return
	}

	// スケジュールを削除
	if err := h.repo.Delete(schedule.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete schedule",
		})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// UpdateScheduleByEditTokenRequest は編集トークンでスケジュール更新リクエスト
type UpdateScheduleByEditTokenRequest struct {
	TimeSlots []EditTimeSlotRequest `json:"timeSlots"`
	Comment   string                `json:"comment"`
}

type EditTimeSlotRequest struct {
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
	Available bool      `json:"available"`
}