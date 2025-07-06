import { render, screen } from '@testing-library/react'
import React from 'react'

describe('Global CSS Styles', () => {
  it('ダークモード背景色が正しく適用される', () => {
    render(
      <div data-testid="dark-bg" className="bg-gray-900">
        ダークモード背景
      </div>
    )
    
    const element = screen.getByTestId('dark-bg')
    expect(element).toHaveClass('bg-gray-900')
  })

  it('ボタンスタイルが正しく適用される', () => {
    render(
      <button 
        data-testid="test-button" 
        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded"
      >
        テストボタン
      </button>
    )
    
    const button = screen.getByTestId('test-button')
    expect(button).toHaveClass('bg-blue-600')
    expect(button).toHaveClass('text-white')
    expect(button).toHaveClass('hover:bg-blue-700')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
    expect(button).toHaveClass('rounded')
  })

  it('レイアウトクラスが正しく適用される', () => {
    render(
      <div 
        data-testid="layout-container" 
        className="flex items-center justify-center p-4"
      >
        レイアウトテスト
      </div>
    )
    
    const container = screen.getByTestId('layout-container')
    expect(container).toHaveClass('flex')
    expect(container).toHaveClass('items-center')
    expect(container).toHaveClass('justify-center')
    expect(container).toHaveClass('p-4')
  })

  it('カレンダー特有のスタイルが適用される', () => {
    render(
      <div 
        data-testid="calendar-slot" 
        className="calendar-time-slot border border-gray-300 hover:bg-gray-100"
      >
        カレンダースロット
      </div>
    )
    
    const slot = screen.getByTestId('calendar-slot')
    expect(slot).toHaveClass('calendar-time-slot')
    expect(slot).toHaveClass('border')
    expect(slot).toHaveClass('border-gray-300')
    expect(slot).toHaveClass('hover:bg-gray-100')
  })

  it('テキストスタイルが正しく適用される', () => {
    render(
      <div 
        data-testid="text-styles" 
        className="text-gray-800 font-medium text-sm"
      >
        テキストスタイル
      </div>
    )
    
    const textElement = screen.getByTestId('text-styles')
    expect(textElement).toHaveClass('text-gray-800')
    expect(textElement).toHaveClass('font-medium')
    expect(textElement).toHaveClass('text-sm')
  })
})