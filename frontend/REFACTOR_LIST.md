# Phase 1: CalendarGrid.tsx 分割 - テストリスト

## 分割対象コンポーネント
- [ ] WeekNavigation - 週ナビゲーション（前週/今週/次週ボタン）
- [ ] TimeSlotGrid - 時間グリッド表示部分
- [ ] EventEditor - イベント編集モーダル
- [ ] DurationSelector - 時間枠選択モード（30min/1h/3h/1day）
- [ ] useTimeSlotManagement - タイムスロット管理フック
- [ ] useCalendarNavigation - カレンダーナビゲーションフック

## テストケース
- [ ] WeekNavigationコンポーネントの表示テスト
- [ ] 週切り替え機能のテスト
- [ ] TimeSlotGridの基本表示テスト
- [ ] タイムスロットクリック処理のテスト
- [ ] EventEditorの表示・編集・削除テスト
- [ ] DurationSelectorのモード切り替えテスト
- [ ] カスタムフックの状態管理テスト

## リファクタリング前後の動作保証
- [ ] 既存の全機能が動作することを確認
- [ ] パフォーマンステスト
- [ ] 型チェック通過確認