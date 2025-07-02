package main

import (
	"context"
	"fmt"
	"log"

	"kareru-backend/internal/infrastructure/firestore"
	"kareru-backend/internal/infrastructure/repository"
)

func main() {
	ctx := context.Background()
	
	client, err := firestore.NewClient(ctx)
	if err != nil {
		log.Fatalf("Firestoreクライアント作成に失敗: %v", err)
	}
	defer client.Close()
	
	repo := repository.NewScheduleRepository(client)
	
	// スケジュール一覧を取得
	fmt.Println("=== Firestoreエミュレータのデータ確認 ===")
	
	scheduleIDs := []string{"sample-schedule-1", "sample-schedule-2"}
	
	for _, id := range scheduleIDs {
		schedule, err := repo.GetByID(ctx, id)
		if err != nil {
			fmt.Printf("❌ %s: 取得失敗 (%v)\n", id, err)
		} else {
			fmt.Printf("✅ %s: %s\n", schedule.ID, schedule.Comment)
		}
	}
}