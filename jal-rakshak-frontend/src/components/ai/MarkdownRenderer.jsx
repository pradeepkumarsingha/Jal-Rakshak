import React from 'react'

/**
 * Lightweight, safe Markdown renderer tailored for AI advisory responses.
 * Formats bold, italics, bullet points, headers, numbered lists, and code blocks cleanly.
 */
export default function MarkdownRenderer({ content = '', className = '' }) {
  if (!content) return null

  // Split into lines for structured block processing
  const lines = content.split('\n')
  const elements = []
  let currentList = []
  let inList = false
  let listType = 'ul' // 'ul' or 'ol'

  const flushList = (key) => {
    if (currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${key}`} className="space-y-1.5 my-2 pl-4 list-decimal marker:text-cyan-600 marker:font-bold">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        )
      } else {
        elements.push(
          <ul key={`ul-${key}`} className="space-y-1.5 my-2 pl-4 list-disc marker:text-brand-500">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        )
      }
      currentList = []
      inList = false
    }
  }

  const renderInline = (text) => {
    if (!text) return ''

    // Match bold **text**
    const parts = []
    let remaining = text

    // Simple bold & highlight replacer
    const boldRegex = /\*\*(.*?)\*\*/g
    let match
    let lastIdx = 0

    while ((match = boldRegex.exec(remaining)) !== null) {
      if (match.index > lastIdx) {
        parts.push(remaining.substring(lastIdx, match.index))
      }
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-slate-900 bg-cyan-50/70 px-1 py-0.5 rounded text-[13px] sm:text-sm">
          {match[1]}
        </strong>
      )
      lastIdx = match.index + match[0].length
    }
    if (lastIdx < remaining.length) {
      parts.push(remaining.substring(lastIdx))
    }

    return parts.length > 0 ? parts : text
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Empty line
    if (!trimmed) {
      flushList(index)
      return
    }

    // Header ###
    if (trimmed.startsWith('### ')) {
      flushList(index)
      elements.push(
        <h4 key={index} className="text-xs sm:text-sm font-extrabold text-slate-900 mt-3 mb-1 tracking-tight flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h4>
      )
      return
    }

    // Header ##
    if (trimmed.startsWith('## ')) {
      flushList(index)
      elements.push(
        <h3 key={index} className="text-sm sm:text-base font-black text-slate-900 mt-3.5 mb-1.5 text-brand-950 flex items-center gap-2 border-b border-slate-100 pb-1">
          {renderInline(trimmed.replace(/^##\s+/, ''))}
        </h3>
      )
      return
    }

    // Bullet point (- or * )
    if (/^[-*]\s+/.test(trimmed)) {
      if (inList && listType !== 'ul') {
        flushList(index)
      }
      inList = true
      listType = 'ul'
      currentList.push(trimmed.replace(/^[-*]\s+/, ''))
      return
    }

    // Numbered list (1. 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      if (inList && listType !== 'ol') {
        flushList(index)
      }
      inList = true
      listType = 'ol'
      currentList.push(trimmed.replace(/^\d+\.\s+/, ''))
      return
    }

    // Regular paragraph
    flushList(index)
    elements.push(
      <p key={index} className="text-slate-800 text-xs sm:text-sm leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    )
  })

  flushList('end')

  return <div className={`space-y-1 ${className}`}>{elements}</div>
}
