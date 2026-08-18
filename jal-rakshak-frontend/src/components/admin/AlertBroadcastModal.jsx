import React, { useState } from 'react'
import { useAlert } from '../../context/AlertContext'
import { AlertTriangle, Send, Radio, Bell, Volume2, ShieldAlert, X } from 'lucide-react'

export default function AlertBroadcastModal({ isOpen, onClose }) {
  const { addAlert } = useAlert()
  const [severity, setSeverity] = useState('CRITICAL')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState('Cuttack & Kendrapara Districts')
  const [channels, setChannels] = useState({ app: true, sms: true, sirens: false })

  if (!isOpen) return null

  const handleBroadcast = (e) => {
    e.preventDefault()
    if (!title || !message) return

    addAlert({
      severity,
      title,
      message,
      location,
      audioAlert: channels.sirens,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-red-500">
            <Radio className="w-5 h-5 animate-pulse" />
            <h3 className="font-extrabold text-base text-white">Emergency Warning Broadcast Center</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          {/* Severity */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Alert Urgency Level *</label>
            <div className="grid grid-cols-3 gap-2">
              {['CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                    severity === sev
                      ? sev === 'CRITICAL'
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                        : sev === 'HIGH'
                        ? 'bg-orange-600 border-orange-500 text-white'
                        : 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Target District / Basin *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Cuttack Wards 1-12, Banki"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Alert Headline *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. RED ALERT: Mahanadi Embankment Breach Expected at Bidanasi"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Evacuation Instruction / Advisory *</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide exact safe shelters, elevated escape corridors, and helpline contact info..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Distribution Channels */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Broadcast Gateways</label>
            <div className="space-y-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.app}
                  onChange={(e) => setChannels({ ...channels, app: e.target.checked })}
                  className="rounded text-brand-600 bg-slate-800 border-slate-700"
                />
                <span>App Push Notification & Dashboard Red Banner</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded text-brand-600 bg-slate-800 border-slate-700"
                />
                <span>Cellular CB-SMS Cell Broadcast (DoT Protocol)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sirens}
                  onChange={(e) => setChannels({ ...channels, sirens: e.target.checked })}
                  className="rounded text-brand-600 bg-slate-800 border-slate-700"
                />
                <span>Trigger Municipal Physical Warning Siren Alarm (Web Audio)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Alert to Population</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
