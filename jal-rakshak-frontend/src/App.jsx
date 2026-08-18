import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { AlertProvider, useAlert } from './context/AlertContext'
import { FloodDataProvider } from './context/FloodDataContext'
import AppRoutes from './routes'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'
import './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Toast notification component inside Alert context
function ToastContainer() {
  const { toasts, removeToast } = useAlert()

  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200 text-xs ${
            toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-brand-400" />}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white leading-tight">{toast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <AlertProvider>
              <FloodDataProvider>
                <div className="app-root min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
                  <AppRoutes />
                  <ToastContainer />
                </div>
              </FloodDataProvider>
            </AlertProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
