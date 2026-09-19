import { AlertCircle, RefreshCw } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

import { DashboardContent } from '../components/dashboard/DashboardContent'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { useDashboard } from '../hooks/useDashboard'
import type { DashboardLayoutContext } from '../layouts/MainDashboardLayout'

export function DashboardPage() {
  const { openSidebar } = useOutletContext<DashboardLayoutContext>()

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useDashboard()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !dashboard) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="w-full max-w-md rounded-[24px] border border-[#EAE7EC] bg-white p-7 text-center shadow-[0_8px_30px_rgba(56,50,63,0.05)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F5F3F6] text-[#7482A4]">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-xl font-extrabold text-[#38323F]">
            Couldn&apos;t load your dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#817B85]">
            Your data is safe. Check your connection or try the dashboard request again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#38323F] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#4A4350] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardHeader
        user={dashboard.data.user}
        onOpenSidebar={openSidebar}
      />

      <DashboardContent data={dashboard.data} />
    </>
  )
}