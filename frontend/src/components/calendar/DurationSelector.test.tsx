import { render, screen, fireEvent } from '@testing-library/react'
import DurationSelector from './DurationSelector'

type DurationMode = '30min' | '1h' | '3h' | '1day'

describe('DurationSelector', () => {
  const mockOnDurationChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('全ての時間選択ボタンが表示される', () => {
    render(
      <DurationSelector
        currentMode="30min"
        onDurationChange={mockOnDurationChange}
      />
    )

    expect(screen.getByText('30min')).toBeInTheDocument()
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('3h')).toBeInTheDocument()
    expect(screen.getByText('1day')).toBeInTheDocument()
  })

  it('現在選択中のモードがアクティブ状態で表示される', () => {
    render(
      <DurationSelector
        currentMode="1h"
        onDurationChange={mockOnDurationChange}
      />
    )

    const activeButton = screen.getByText('1h')
    expect(activeButton).toHaveClass('bg-slate-700')
  })

  it('非選択状態のボタンが正しいスタイルで表示される', () => {
    render(
      <DurationSelector
        currentMode="30min"
        onDurationChange={mockOnDurationChange}
      />
    )

    const inactiveButton = screen.getByText('1h')
    expect(inactiveButton).toHaveClass('bg-slate-500')
  })

  it('ボタンクリックで選択モードが変更される', () => {
    render(
      <DurationSelector
        currentMode="30min"
        onDurationChange={mockOnDurationChange}
      />
    )

    fireEvent.click(screen.getByText('3h'))
    expect(mockOnDurationChange).toHaveBeenCalledWith('3h')
  })

  it('クリック時にイベントバブリングが防止される', () => {
    const mockParentClick = jest.fn()
    
    render(
      <div onClick={mockParentClick}>
        <DurationSelector
          currentMode="30min"
          onDurationChange={mockOnDurationChange}
        />
      </div>
    )

    fireEvent.click(screen.getByText('1h'))
    expect(mockParentClick).not.toHaveBeenCalled()
    expect(mockOnDurationChange).toHaveBeenCalledWith('1h')
  })
})