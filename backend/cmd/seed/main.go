package main

import (
	"context"
	"log"
	"os"

	"kareru-backend/internal/infrastructure/firestore"
	"kareru-backend/internal/infrastructure/seed"
)

func main() {
	ctx := context.Background()
	
	client, err := firestore.NewClient(ctx)
	if err != nil {
		log.Fatalf("Firestoreクライアント作成に失敗: %v", err)
	}
	defer client.Close()
	
	if err := seed.SeedSchedules(ctx, client); err != nil {
		log.Fatalf("シードデータ投入に失敗: %v", err)
	}
	
	log.Println("シードデータの投入が完了しました")
	os.Exit(0)
}