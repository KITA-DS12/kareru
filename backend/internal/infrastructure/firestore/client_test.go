package firestore

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewClient(t *testing.T) {
	ctx := context.Background()

	t.Run("エミュレータへの接続が成功すること", func(t *testing.T) {
		os.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8081")
		os.Setenv("FIRESTORE_PROJECT_ID", "test-project")
		defer func() {
			os.Unsetenv("FIRESTORE_EMULATOR_HOST")
			os.Unsetenv("FIRESTORE_PROJECT_ID")
		}()

		client, err := NewClient(ctx)
		require.NoError(t, err)
		assert.NotNil(t, client)
		assert.Equal(t, "test-project", client.ProjectID())

		err = client.Close()
		require.NoError(t, err)
	})

	t.Run("プロジェクトIDが未設定の場合はデフォルト値を使用すること", func(t *testing.T) {
		os.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8081")
		os.Unsetenv("FIRESTORE_PROJECT_ID")
		defer os.Unsetenv("FIRESTORE_EMULATOR_HOST")

		client, err := NewClient(ctx)
		require.NoError(t, err)
		assert.NotNil(t, client)
		assert.Equal(t, "kareru-local", client.ProjectID())

		err = client.Close()
		require.NoError(t, err)
	})
}