'use client'

import { Icons } from '@/components/ui/icons'

const STEPS = [
  { num: 1, label: 'シリーズ・変動費' },
  { num: 2, label: 'アンケート' },
  { num: 3, label: 'オプション' },
  { num: 4, label: '見積確認' },
  { num: 5, label: '資金計画書' },
]

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEPS.map((step, i) => {
        const isActive = step.num === currentStep
        const isCompleted = step.num < currentStep
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-blue-600 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <Icons.check className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 mb-5 ${step.num < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
