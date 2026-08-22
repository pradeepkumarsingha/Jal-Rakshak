import React from 'react'
import FloodRadarLoader from './FloodRadarLoader'

export default function Loading({
  message = 'Loading flood intelligence…',
  subMessage = 'Please wait while we process available data.',
  fullScreen = false,
  compact = false,
  className = '',
}) {
  return (
    <FloodRadarLoader
      message={message}
      subMessage={subMessage}
      fullScreen={fullScreen}
      compact={compact}
      className={className}
    />
  )
}
