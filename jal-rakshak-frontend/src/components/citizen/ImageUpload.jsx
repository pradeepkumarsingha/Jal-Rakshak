import React, { useState } from 'react'
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, AlertTriangle, X } from 'lucide-react'

export default function ImageUpload({ onImageAnalyzed, onFileSelect }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    if (onFileSelect) onFileSelect(file)

    // Trigger simulated AI Vision Depth Assessment
    setAnalyzing(true)
    setAiResult(null)

    setTimeout(() => {
      const mockAnalysis = {
        detectedWaterDepthMeters: 1.15,
        depthCategory: 'Waist Level (~1.15m)',
        confidenceScore: 96.4,
        hazardObjects: ['Submerged vehicle tyres (85% covered)', 'Inundated doorstep', 'Turbid fast current'],
        recommendedPriority: 'HIGH',
      }
      setAiResult(mockAnalysis)
      setAnalyzing(false)
      if (onImageAnalyzed) onImageAnalyzed(mockAnalysis)
    }, 1800)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setPreviewUrl(null)
    setAiResult(null)
    setAnalyzing(false)
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
            Drag and drop or click to browse (JPG, PNG up to 10MB)
          </span>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto AI Computer Vision Water Depth Analysis</span>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
          <img src={previewUrl} alt="Hazard preview" className="w-full h-56 object-cover opacity-90" />

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-black transition z-20"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

          {/* AI Analyzing Scanning Overlay */}
          {analyzing && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
              <div className="relative w-14 h-14 mb-3">
                <div className="w-full h-full rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-cyan-300 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="font-bold text-sm text-cyan-200">AI Vision Analyzing Water Depth...</p>
              <p className="text-xs text-slate-400 mt-1">Detecting waterline offsets & submersion cues</p>
              {/* Scan laser line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-bounce" />
            </div>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="p-4 bg-slate-900 text-white border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Inundation Assessment</span>
                </div>
                <span className="text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {aiResult.confidenceScore}% Confidence
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Estimated Depth</span>
                  <strong className="text-sm text-amber-400">{aiResult.depthCategory}</strong>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Suggested Priority</span>
                  <strong className="text-sm text-red-400">{aiResult.recommendedPriority}</strong>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                {aiResult.hazardObjects.map((obj, i) => (
                  <span key={i} className="inline-block mr-1 mb-1 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                    ✓ {obj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
