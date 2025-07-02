package model

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestGenerateUUID(t *testing.T) {
	// UUID生成のテストケース
	t.Run("UUIDを生成できる", func(t *testing.T) {
		uuid, err := GenerateUUID()
		assert.NoError(t, err)
		assert.NotEmpty(t, uuid)
	})

	t.Run("生成されるUUIDは毎回異なる", func(t *testing.T) {
		uuid1, err1 := GenerateUUID()
		assert.NoError(t, err1)

		uuid2, err2 := GenerateUUID()
		assert.NoError(t, err2)

		assert.NotEqual(t, uuid1, uuid2)
	})

	t.Run("UUIDは正しい形式である", func(t *testing.T) {
		uuid, err := GenerateUUID()
		assert.NoError(t, err)
		// UUID v4の形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
		assert.Regexp(t, `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, uuid)
	})
}

func TestGenerateEditToken(t *testing.T) {
	// 編集トークン生成のテストケース
	t.Run("編集トークンを生成できる", func(t *testing.T) {
		token, err := GenerateEditToken()
		assert.NoError(t, err)
		assert.NotEmpty(t, token)
	})

	t.Run("生成される編集トークンは毎回異なる", func(t *testing.T) {
		token1, err1 := GenerateEditToken()
		assert.NoError(t, err1)

		token2, err2 := GenerateEditToken()
		assert.NoError(t, err2)

		assert.NotEqual(t, token1, token2)
	})

	t.Run("編集トークンは十分な長さがある", func(t *testing.T) {
		token, err := GenerateEditToken()
		assert.NoError(t, err)
		// 256bit = 32bytes = 64文字（16進数）
		assert.Equal(t, 64, len(token))
	})
}

func TestVerifyEditToken(t *testing.T) {
	// 編集トークン検証のテストケース
	t.Run("正しいトークンで検証成功", func(t *testing.T) {
		token := "validtoken123"
		schedule := &Schedule{EditToken: token}
		
		err := schedule.VerifyEditToken(token)
		assert.NoError(t, err)
	})

	t.Run("間違ったトークンで検証失敗", func(t *testing.T) {
		schedule := &Schedule{EditToken: "correcttoken"}
		
		err := schedule.VerifyEditToken("wrongtoken")
		assert.Error(t, err)
		assert.Equal(t, "invalid edit token", err.Error())
	})

	t.Run("空のトークンで検証失敗", func(t *testing.T) {
		schedule := &Schedule{EditToken: "sometoken"}
		
		err := schedule.VerifyEditToken("")
		assert.Error(t, err)
		assert.Equal(t, "invalid edit token", err.Error())
	})
}

func TestTimeSlotValidation(t *testing.T) {
	// タイムスロットバリデーションのテストケース
	t.Run("有効なタイムスロット", func(t *testing.T) {
		start := time.Now().Add(1 * time.Hour)
		end := time.Now().Add(2 * time.Hour)
		slot := &TimeSlot{
			StartTime: start,
			EndTime:   end,
		}
		
		err := slot.Validate()
		assert.NoError(t, err)
	})

	t.Run("開始時刻が終了時刻より後", func(t *testing.T) {
		start := time.Now().Add(2 * time.Hour)
		end := time.Now().Add(1 * time.Hour)
		slot := &TimeSlot{
			StartTime: start,
			EndTime:   end,
		}
		
		err := slot.Validate()
		assert.Error(t, err)
		assert.Equal(t, "start time must be before end time", err.Error())
	})

	t.Run("開始時刻と終了時刻が同じ", func(t *testing.T) {
		now := time.Now()
		slot := &TimeSlot{
			StartTime: now,
			EndTime:   now,
		}
		
		err := slot.Validate()
		assert.Error(t, err)
		assert.Equal(t, "start time must be before end time", err.Error())
	})
}

func TestScheduleValidateTimeSlots(t *testing.T) {
	// スケジュール全体のタイムスロットバリデーション
	t.Run("重複しないタイムスロット", func(t *testing.T) {
		now := time.Now()
		schedule := &Schedule{
			TimeSlots: []TimeSlot{
				{StartTime: now, EndTime: now.Add(1 * time.Hour)},
				{StartTime: now.Add(2 * time.Hour), EndTime: now.Add(3 * time.Hour)},
			},
		}
		
		err := schedule.ValidateTimeSlots()
		assert.NoError(t, err)
	})

	t.Run("重複するタイムスロット", func(t *testing.T) {
		now := time.Now()
		schedule := &Schedule{
			TimeSlots: []TimeSlot{
				{StartTime: now, EndTime: now.Add(2 * time.Hour)},
				{StartTime: now.Add(1 * time.Hour), EndTime: now.Add(3 * time.Hour)},
			},
		}
		
		err := schedule.ValidateTimeSlots()
		assert.Error(t, err)
		assert.Equal(t, "time slots overlap", err.Error())
	})

	t.Run("境界で接するタイムスロット", func(t *testing.T) {
		now := time.Now()
		schedule := &Schedule{
			TimeSlots: []TimeSlot{
				{StartTime: now, EndTime: now.Add(1 * time.Hour)},
				{StartTime: now.Add(1 * time.Hour), EndTime: now.Add(2 * time.Hour)},
			},
		}
		
		err := schedule.ValidateTimeSlots()
		assert.NoError(t, err)
	})
}

func TestIsExpired(t *testing.T) {
	// 7日後失効判定のテストケース
	t.Run("作成から6日後は有効", func(t *testing.T) {
		schedule := &Schedule{
			CreatedAt: time.Now().Add(-6 * 24 * time.Hour),
			ExpiresAt: time.Now().Add(1 * 24 * time.Hour),
		}
		
		assert.False(t, schedule.IsExpired())
	})

	t.Run("作成から7日後は失効", func(t *testing.T) {
		schedule := &Schedule{
			CreatedAt: time.Now().Add(-7 * 24 * time.Hour),
			ExpiresAt: time.Now().Add(-1 * time.Hour),
		}
		
		assert.True(t, schedule.IsExpired())
	})

	t.Run("ExpiresAtが現在時刻より前なら失効", func(t *testing.T) {
		schedule := &Schedule{
			CreatedAt: time.Now().Add(-1 * time.Hour),
			ExpiresAt: time.Now().Add(-1 * time.Minute),
		}
		
		assert.True(t, schedule.IsExpired())
	})

	t.Run("ExpiresAtが現在時刻より後なら有効", func(t *testing.T) {
		schedule := &Schedule{
			CreatedAt: time.Now().Add(-1 * time.Hour),
			ExpiresAt: time.Now().Add(1 * time.Hour),
		}
		
		assert.False(t, schedule.IsExpired())
	})
}

func TestNewSchedule(t *testing.T) {
	// スケジュール新規作成のテストケース
	t.Run("新規スケジュールの作成", func(t *testing.T) {
		schedule, err := NewSchedule()
		assert.NoError(t, err)
		assert.NotEmpty(t, schedule.ID)
		assert.NotEmpty(t, schedule.EditToken)
		assert.NotZero(t, schedule.CreatedAt)
		assert.NotZero(t, schedule.ExpiresAt)
		
		// UUIDの形式チェック
		assert.Regexp(t, `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, schedule.ID)
		
		// 編集トークンの長さチェック
		assert.Equal(t, 64, len(schedule.EditToken))
		
		// 有効期限が7日後であることを確認
		expectedExpiry := schedule.CreatedAt.Add(7 * 24 * time.Hour)
		assert.WithinDuration(t, expectedExpiry, schedule.ExpiresAt, 1*time.Second)
	})
}