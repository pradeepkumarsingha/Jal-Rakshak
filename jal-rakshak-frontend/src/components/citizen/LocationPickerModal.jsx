import React, { useState } from 'react'
import { MapPin, Search, Navigation, X, Check } from 'lucide-react'

const POPULAR_LOCATIONS = [
  { name: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', latitude: 20.2961, longitude: 85.8245 },
  { name: 'Cuttack', district: 'Cuttack', state: 'Odisha', latitude: 20.4625, longitude: 85.8830 },
  { name: 'Puri', district: 'Puri', state: 'Odisha', latitude: 19.8135, longitude: 85.8312 },
  { name: 'Kendrapara', district: 'Kendrapara', state: 'Odisha', latitude: 20.5015, longitude: 86.4225 },
  { name: 'Sambalpur', district: 'Sambalpur', state: 'Odisha', latitude: 21.4669, longitude: 83.9812 },
  { name: 'Rourkela', district: 'Sundargarh', state: 'Odisha', latitude: 22.2604, longitude: 84.8536 },
  { name: 'Berhampur', district: 'Ganjam', state: 'Odisha', latitude: 19.3150, longitude: 84.7941 },
  { name: 'Balasore', district: 'Balasore', state: 'Odisha', latitude: 21.4934, longitude: 86.9135 },
  { name: 'Patna', district: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
  { name: 'New Delhi (Yamuna Basin)', district: 'Central Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
]

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  onUseGps,
  currentLocation,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [customName, setCustomName] = useState('')
  const [activeTab, setActiveTab] = useState('preset') // 'preset' | 'custom'

  if (!isOpen) return null

  const filteredPresets = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    const lat = parseFloat(customLat)
    const lng = parseFloat(customLng)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Please enter a valid latitude between -90 and 90.')
      return
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert('Please enter a valid longitude between -180 and 180.')
      return
    }

    onSelectLocation({
      latitude: lat,
      longitude: lng,
      name: customName || `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      district: null,
      state: null,
      source: 'manual',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Choose Monitoring Location</h3>
              <p className="text-xs text-slate-500">Select your district or enter coordinates for targeted flood telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Browser GPS:</span> Live device pinpoint
          </div>
          <button
            onClick={() => {
              onUseGps()
              onClose()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Use Real GPS Location</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'preset'
                ? 'border-brand-600 text-brand-700 bg-brand-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Popular Districts & Cities
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'custom'
                ? 'border-brand-600 text-brand-700 bg-brand-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom Coordinates / Pin
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'preset' ? (
            <div className="space-y-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search district, city or river basin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Presets List */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {filteredPresets.map((loc) => {
                  const isSelected =
                    currentLocation &&
                    Math.abs(currentLocation.latitude - loc.latitude) < 0.01 &&
                    Math.abs(currentLocation.longitude - loc.longitude) < 0.01

                  return (
                    <button
                      key={loc.name}
                      onClick={() => {
                        onSelectLocation({
                          ...loc,
                          source: 'manual',
                        })
                        onClose()
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 text-brand-950 font-bold'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{loc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {loc.district}, {loc.state} • {loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-brand-600">Select</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Landmark Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Canteen, Bhubaneswar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Latitude (-90 to 90)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 20.2961"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Longitude (-180 to 180)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 85.8245"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-800 leading-relaxed">
                Tip: Enter your precise coordinates to load specific satellite precipitation and flood neural inference for that specific basin.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                Apply Custom Coordinates
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
