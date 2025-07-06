package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"kareru-backend/internal/handlers"
	"kareru-backend/internal/infrastructure/repository"
	"kareru-backend/internal/routes"
)

func main() {
	// Ginルーターの初期化
	r := gin.Default()

	// CORS設定
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // 開発時のテスト用
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// リポジトリとハンドラーの初期化
	// 注: 実際の実装では、Firestoreクライアントなどを使用します
	// ここでは簡単なメモリ実装を使用
	scheduleRepo := repository.NewMemoryScheduleRepository()
	scheduleHandler := handlers.NewScheduleHandler(scheduleRepo)

	// ルートの設定
	routes.SetupRoutes(r, scheduleHandler)

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
