import React, { useState } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import { useAuth } from '../../context/AuthContext'
import { SOS_CATEGORIES, WATER_DEPTH_LEVELS } from '../../utils/constants'
import {
  Flame,
  CheckCircle2,
  MapPin,
  Locate,
  Users,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Phone,
  Radio,
  Clock,
  ShieldCheck,
} from 'lucide-react'

export default function EmergencyRequest() {
  const { addEmergency } = useFloodData()
  const { showToast, playAlertChime } = useAlert()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [submittedSos, setSubmittedSos] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)

  // Wizard form data
  const [sosData, setSosData] = useState({
    category: 'Stranded on Rooftop / High Ground',
    location: user?.location?.address || 'Current User GPS Location',
    landmark: 'High Ground / Visible Landmark',
    lat: user?.location?.coordinates ? user.location.coordinates[1] : 20.2961,
    lng: user?.location?.coordinates ? user.location.coordinates[0] : 85.8245,
    peopleCount: 1,
    victims: { infants: 0, children: 0, adults: 1, elderly: 0, pregnant: 0 },
    waterDepth: 'Waist Level (~100 cm)',
    description: 'Urgent rescue assistance required due to rising water levels.',
    contactName: user?.name || 'Citizen',
    contactPhone: user?.phone || '+91 ',
    hasMedicalNeed: false,
  })

  const handleLocateMe = () => {
    setGpsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSosData((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            location: `GPS Pin: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`,
          }))
          setGpsLoading(false)
        },
        () => {
          setGpsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      )
    } else {
      setGpsLoading(false)
    }
  }

  const handleBroadcastSos = async () => {
    setSubmitting(true)
    try {
      // Calculate dynamic priority score (0-100)
      let score = 70
      if (sosData.hasMedicalNeed) score += 15
      if (sosData.victims.infants > 0 || sosData.victims.elderly > 0) score += 10
      if (sosData.waterDepth.includes('Overhead') || sosData.waterDepth.includes('Waist')) score += 5

      const newSos = addEmergency({
        ...sosData,
        priority: score >= 85 ? 'CRITICAL' : 'HIGH',
        priorityScore: Math.min(100, score),
      })

      playAlertChime()
      showToast({
        title: '🚨 EMERGENCY DISTRESS TRANSMITTED!',
        message: `SOS Beacon ${newSos.id} dispatched to NDRF & State Control Room.`,
        type: 'error',
      })

      setSubmittedSos(newSos)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Top Warning Ribbon */}
      <div className="bg-red-600 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3 animate-pulse">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-white animate-ping" />
          <span className="text-xs font-extrabold uppercase tracking-wide">
            24x7 Priority Life-Rescue Distress Gateway
          </span>
        </div>
        <a href="tel:1078" className="bg-white text-red-700 hover:bg-red-50 text-xs font-extrabold px-3 py-1 rounded-xl shadow">
          Call 1078 NDRF Direct
        </a>
      </div>

      {submittedSos ? (
        /* SOS Tracking Confirmation Screen */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center animate-bounce">
            <Flame className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Distress Beacon Active & Transmitting
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              SOS Broadcast Confirmed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              Your GPS coordinates and victim count have been logged into the State Disaster Command Room and dispatched to NDRF Battalion 03.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">SOS Reference ID:</span>
              <strong className="text-red-600 font-mono text-sm">{submittedSos.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Coordinates:</span>
              <strong className="text-slate-800">{submittedSos.location}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Rescue Squad:</span>
              <strong className="text-emerald-700 font-bold">NDRF Unit 07 (Bravo Boat)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Field Arrival:</span>
              <strong className="text-brand-700 font-bold">~14 Minutes</strong>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-1 max-w-md mx-auto">
            <p className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Immediate Safety Instructions:
            </p>
            <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
              <li>Stay on the roof or highest stable structure.</li>
              <li>Keep phone on low-power mode with volume on high.</li>
              <li>Wave bright clothes / flashlights when rescue boat engines approach.</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setSubmittedSos(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Submit Another SOS
            </button>
            <a
              href="tel:112"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow"
            >
              Call National Emergency 112
            </a>
          </div>
        </div>
      ) : (
        /* 5-Step Guided Wizard */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Stepper Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Step {step} of 5
              </span>
              <span className="text-xs font-bold text-slate-500">
                {step === 1 && 'Emergency Category'}
                {step === 2 && 'GPS Location'}
                {step === 3 && 'Victim Headcount'}
                {step === 4 && 'Water & Environment'}
                {step === 5 && 'Review & Transmit'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-600 to-red-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: Category */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">What is the primary nature of distress?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the category that best matches your immediate danger.</p>
              </div>

              <div className="space-y-2.5">
                {SOS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSosData({ ...sosData, category: cat.label })}
                    className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                      sosData.category === cat.label
                        ? 'bg-red-50/80 border-red-500 ring-2 ring-red-400 text-red-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold">{cat.label}</span>
                    <span className="text-xs font-bold text-red-600">Priority +{cat.weight}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Pinpoint your exact location</h3>
                <p className="text-xs text-slate-500 mt-0.5">High accuracy helps boat teams reach you without searching.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Address / Locality *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={sosData.location}
                      onChange={(e) => setSosData({ ...sosData, location: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={gpsLoading}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Locate className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>Auto GPS Pin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Visual Landmark (Roof color, Nearby tree, Pole number)</label>
                <input
                  type="text"
                  value={sosData.landmark}
                  onChange={(e) => setSosData({ ...sosData, landmark: e.target.value })}
                  placeholder="e.g. Red water tank on roof, near Bidanasi Shiva temple"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Victim Count & Demographics */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">How many individuals need rescue?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Demographics help dispatch appropriate boat capacities and medics.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block font-medium">👶 Infants (&lt;2y)</span>
                  <input
                    type="number"
                    min="0"
                    value={sosData.victims.infants}
                    onChange={(e) => setSosData({
                      ...sosData,
                      victims: { ...sosData.victims, infants: Number(e.target.value) },
                    })}
                    className="w-16 mx-auto mt-1 p-1 text-center font-extrabold text-base rounded border border-slate-300"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block font-medium">🧒 Children</span>
                  <input
                    type="number"
                    min="0"
                    value={sosData.victims.children}
                    onChange={(e) => setSosData({
                      ...sosData,
                      victims: { ...sosData.victims, children: Number(e.target.value) },
                    })}
                    className="w-16 mx-auto mt-1 p-1 text-center font-extrabold text-base rounded border border-slate-300"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block font-medium">🧑 Adults</span>
                  <input
                    type="number"
                    min="0"
                    value={sosData.victims.adults}
                    onChange={(e) => setSosData({
                      ...sosData,
                      victims: { ...sosData.victims, adults: Number(e.target.value) },
                    })}
                    className="w-16 mx-auto mt-1 p-1 text-center font-extrabold text-base rounded border border-slate-300"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block font-medium">👴 Senior Citizens</span>
                  <input
                    type="number"
                    min="0"
                    value={sosData.victims.elderly}
                    onChange={(e) => setSosData({
                      ...sosData,
                      victims: { ...sosData.victims, elderly: Number(e.target.value) },
                    })}
                    className="w-16 mx-auto mt-1 p-1 text-center font-extrabold text-base rounded border border-slate-300"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sosData.hasMedicalNeed}
                  onChange={(e) => setSosData({ ...sosData, hasMedicalNeed: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Critical Medical Support Needed (Oxygen, Dialysis, Stretcher, Insulin)</span>
              </label>
            </div>
          )}

          {/* STEP 4: Water Depth & Environment */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Current Water Depth & Situation</h3>
                <p className="text-xs text-slate-500 mt-0.5">Helps teams choose the right craft (Motorized IRB vs High-clearance truck).</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {WATER_DEPTH_LEVELS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSosData({ ...sosData, waterDepth: w.label })}
                    className={`p-3 rounded-2xl border text-left transition ${
                      sosData.waterDepth === w.label
                        ? 'bg-red-50 border-red-500 ring-2 ring-red-400 text-red-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{w.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{w.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  value={sosData.description}
                  onChange={(e) => setSosData({ ...sosData, description: e.target.value })}
                  placeholder="e.g., Water rising fast, battery at 10%, 2 pet dogs..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Broadcast */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Review SOS Distress Packet</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please verify contact number so rescue crew can reach you by phone/VHF.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <strong className="text-slate-900">{sosData.category}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <strong className="text-slate-900">{sosData.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Landmark:</span>
                  <strong className="text-slate-900">{sosData.landmark}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Water Depth:</span>
                  <strong className="text-red-700">{sosData.waterDepth}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Victim Demographics:</span>
                  <strong className="text-slate-900">
                    {sosData.victims.infants + sosData.victims.children + sosData.victims.adults + sosData.victims.elderly} Persons Total
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={sosData.contactName}
                    onChange={(e) => setSosData({ ...sosData, contactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Callback Phone Number *</label>
                  <input
                    type="tel"
                    value={sosData.contactPhone}
                    onChange={(e) => setSosData({ ...sosData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-red-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-600/30 transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBroadcastSos}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-red-600/40 animate-pulse transition"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Broadcasting SOS Beacon...' : 'BROADCAST EMERGENCY SOS NOW'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
