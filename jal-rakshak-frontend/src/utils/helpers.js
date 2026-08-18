/**
 * Calculate distance between two coordinates in Kilometers (Haversine Formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}

/**
 * Returns color hex and CSS badge classes for a given risk or priority score (0-100)
 */
export function getSeverityInfo(score) {
  if (score >= 80) {
    return {
      level: 'CRITICAL',
      label: 'Critical Alert',
      color: '#DC2626',
      badgeClass: 'badge-critical',
      bgClass: 'bg-red-500',
      borderClass: 'border-red-500',
      textClass: 'text-red-600',
    }
  }
  if (score >= 65) {
    return {
      level: 'HIGH',
      label: 'High Alert',
      color: '#EA580C',
      badgeClass: 'badge-high',
      bgClass: 'bg-orange-500',
      borderClass: 'border-orange-500',
      textClass: 'text-orange-600',
    }
  }
  if (score >= 45) {
    return {
      level: 'MEDIUM',
      label: 'Medium Risk',
      color: '#CA8A04',
      badgeClass: 'badge-medium',
      bgClass: 'bg-amber-500',
      borderClass: 'border-amber-500',
      textClass: 'text-amber-600',
    }
  }
  if (score >= 25) {
    return {
      level: 'MODERATE',
      label: 'Moderate Warning',
      color: '#84CC16',
      badgeClass: 'badge-moderate',
      bgClass: 'bg-lime-500',
      borderClass: 'border-lime-500',
      textClass: 'text-lime-600',
    }
  }
  return {
    level: 'LOW',
    label: 'Low Risk',
    color: '#16A34A',
    badgeClass: 'badge-low',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600',
  }
}

/**
 * Format timestamp into relative or readable string
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now'
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSec = Math.floor((now - date) / 1000)

  if (diffInSec < 60) return `${diffInSec}s ago`
  const diffInMin = Math.floor(diffInSec / 60)
  if (diffInMin < 60) return `${diffInMin}m ago`
  const diffInHours = Math.floor(diffInMin / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/**
 * Generate unique random ID with prefix
 */
export function generateId(prefix = 'REQ') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}
