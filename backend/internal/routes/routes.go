package routes

import (
	"github.com/gin-gonic/gin"
	"kareru-backend/internal/handlers"
)

// SetupRoutes はAPIルートを設定する
func SetupRoutes(router *gin.Engine, scheduleHandler *handlers.ScheduleHandler) {
	// API v1 グループ
	v1 := router.Group("/api/v1")
	{
		// スケジュール関連のルート
		schedules := v1.Group("/schedules")
		{
			schedules.POST("", scheduleHandler.CreateSchedule)
			schedules.GET("/:uuid", scheduleHandler.GetSchedule)
			schedules.PUT("/:uuid", scheduleHandler.UpdateSchedule)
			schedules.DELETE("/:uuid", scheduleHandler.DeleteSchedule)
			
			// 編集トークンベースのエンドポイント
			edit := schedules.Group("/edit")
			{
				edit.GET("/:token", scheduleHandler.GetScheduleByEditToken)
				edit.PUT("/:token", scheduleHandler.UpdateScheduleByEditToken)
				edit.DELETE("/:token", scheduleHandler.DeleteScheduleByEditToken)
			}
		}
	}

	// ヘルスチェック
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Kareru backend is running",
		})
	})
}