package firestore

import (
	"context"
	"fmt"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

type Client struct {
	*firestore.Client
	projectID string
}

func NewClient(ctx context.Context) (*Client, error) {
	projectID := os.Getenv("FIRESTORE_PROJECT_ID")
	if projectID == "" {
		projectID = "kareru-local"
	}

	var opts []option.ClientOption

	if os.Getenv("FIRESTORE_EMULATOR_HOST") != "" {
		opts = append(opts, option.WithoutAuthentication())
	}

	conf := &firebase.Config{
		ProjectID: projectID,
	}

	app, err := firebase.NewApp(ctx, conf, opts...)
	if err != nil {
		return nil, fmt.Errorf("firebase app initialization failed: %w", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("firestore client creation failed: %w", err)
	}

	return &Client{
		Client:    client,
		projectID: projectID,
	}, nil
}

func (c *Client) ProjectID() string {
	return c.projectID
}