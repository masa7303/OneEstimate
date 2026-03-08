'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  value?: string | null
  onChange: (url: string | null) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = '画像' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'アップロードに失敗しました')
      } else {
        onChange(data.url)
      }
    } catch {
      setError('アップロードに失敗しました')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={label}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              x
            </button>
          </div>
        ) : (
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <span className="text-gray-400 text-xs text-center leading-tight">クリックで<br />選択</span>
            )}
          </div>
        )}
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'アップロード中...' : '変更'}
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
