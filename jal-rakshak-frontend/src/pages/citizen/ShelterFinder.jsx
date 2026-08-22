import React, { useState } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import ShelterCard from '../../components/citizen/ShelterCard'
import FloodRadarLoader from '../../components/common/FloodRadarLoader'
import { LOADING_MESSAGES } from '../../utils/loadingMessages'
import { useLanguage } from '../../context/LanguageContext'
import { Home, Search, Filter, Sparkles, MapPin, Phone, Users, ShieldCheck } from 'lucide-react'

export default function ShelterFinder() {
  const { shelters, loading } = useFloodData()
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [filterFacility, setFilterFacility] = useState('ALL')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const facilitiesList = ['ALL', 'Medical', 'Generator', 'Food', 'Women & Child', 'Livestock']

  const filtered = shelters
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.locationName.toLowerCase().includes(search.toLowerCase())
      const matchFacility =
        filterFacility === 'ALL' ||
        s.facilities?.some((f) => f.toLowerCase().includes(filterFacility.toLowerCase()))
      const matchAvailable = !onlyAvailable || s.currentOccupancy < s.capacity
      return matchSearch && matchFacility && matchAvailable
    })
    .sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0))

  if (loading && shelters.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FloodRadarLoader
          message={LOADING_MESSAGES.SHELTERS.message}
          subMessage={LOADING_MESSAGES.SHELTERS.subMessage}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
            <Home className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('shelters.title') || 'Relief Camp & Shelter Locator'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('shelters.subtitle') || 'Find verified government cyclone and flood shelters with elevated foundations, clean water, medical aid, and live headcount vacancy.'}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('shelters.searchPlaceholder') || 'Search shelter by name or locality (e.g. Barabati, Ravenshaw, Patia)...'}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Vacant slots toggle */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>{t('common.vacantOnly') || 'Show Only Vacant Shelters'}</span>
          </label>
        </div>

        {/* Facility Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            {t('shelters.filterByFacility') || 'Filter by Facility:'}
          </span>
          {facilitiesList.map((fac) => (
            <button
              key={fac}
              onClick={() => setFilterFacility(fac)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                filterFacility === fac
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {fac === 'ALL' ? (t('common.all') || 'ALL') : fac}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">{t('shelters.noSheltersFound') || 'No shelters match your filter criteria.'}</p>
            <button
              onClick={() => {
                setSearch('')
                setFilterFacility('ALL')
                setOnlyAvailable(false)
              }}
              className="mt-3 text-xs text-brand-600 font-bold hover:underline"
            >
              {t('common.resetFilters') || 'Reset All Filters'}
            </button>
          </div>
        ) : (
          filtered.map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))
        )}
      </div>
    </div>
  )
}
