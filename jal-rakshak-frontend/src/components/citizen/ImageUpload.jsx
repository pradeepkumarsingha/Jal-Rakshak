import React, { useState } from 'react'
import { UploadCloud, Image as ImageIcon, Sparkles, X, AlertCircle } from 'lucide-react'

export default function ImageUpload({ onFileSelect, preview = null, onClear = null }) {
  const [previewUrl, setPreviewUrl] = useState(preview)
  const [error, setError] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    setError(null)

    // Allowed types: JPEG, JPG, PNG, WEBP
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.')
      return
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    if (onFileSelect) onFileSelect(file)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setPreviewUrl(null)
    setError(null)
    if (onClear) onClear()
    if (onFileSelect) onFileSelect(null)
  }

  return (
    <div className="space-y-3">
      {!previewUrl ? (
        <label className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-brand-50/30 transition group text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            Upload Flood Hazard Photo
          </span>
          <span className="text-xs text-slate-500 mt-1">
            PNG, JPG, WEBP up to 5MB (Securely stored on Cloudinary)
          </span>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Verification Model assesses submersion depth & road conditions</span>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
          <img src={previewUrl} alt="Hazard preview" className="w-full h-56 object-cover" />

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-black transition z-20"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-3 bg-slate-900 text-white text-xs flex items-center justify-between border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Photo attached for Cloudinary & AI verification
            </span>
            <span className="text-[10px] text-slate-400">Ready to transmit</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
