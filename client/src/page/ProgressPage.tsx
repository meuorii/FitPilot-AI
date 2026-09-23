import {
  useMemo,
  useState,
} from 'react'
import { useOutletContext } from 'react-router-dom'

import { getFirstName, PageHeader } from '../components/layout/PageHeader'
import { ProgressContent } from '../components/progress/ProgressContent'
import { ProgressSkeleton } from '../components/progress/ProgressSkeleton'
import { searchProgressLogs } from '../components/progress/progress.utils'
import { AllCheckInsModal } from '../components/progress/modals/AllCheckInsModal'
import { DeleteProgressLogConfirmModal } from '../components/progress/modals/DeleteProgressLogConfirmModal'
import { useDashboard } from '../hooks/useDashboard'
import {
  useCreateProgressLog,
  useDeleteProgressLog,
  useProgressLogs,
  useProgressOverview,
} from '../hooks/useProgress'
import type { DashboardLayoutContext } from '../layouts/MainDashboardLayout'
import type {
  CreateProgressLogInput,
  ProgressLog,
} from '../services/types/progress'
import { useToastStore } from '../stores/toastStore'

export function ProgressPage() {
  const { openSidebar } =
    useOutletContext<DashboardLayoutContext>()

  const overviewQuery = useProgressOverview()
  const recentLogsQuery = useProgressLogs({
    limit: 5,
    offset: 0,
  })
  const dashboardQuery = useDashboard()
  const createMutation = useCreateProgressLog()
  const deleteMutation = useDeleteProgressLog()

  const showToast = useToastStore((state) => state.showToast)

  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] =
    useState<ProgressLog | null>(null)
  const [allCheckInsOpen, setAllCheckInsOpen] =
    useState(false)

  const recentLogs =
    recentLogsQuery.data?.data.logs ?? []

  const filteredLogs = useMemo(
    () => searchProgressLogs(recentLogs, search),
    [recentLogs, search],
  )

  const focusCheckIn = () => {
    document
      .getElementById('quick-check-in')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

    window.setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        '#quick-check-in input',
      )
      input?.focus()
    }, 350)
  }

  const handleCreate = async (
    input: CreateProgressLogInput,
  ) => {
    try {
      await createMutation.mutateAsync(input)
      showToast({
        type: 'success',
        heading: 'Check-in saved',
        subheading:
          'Your Progress page has been updated with your latest data.',
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not save your progress check-in.'

      showToast({
        type: 'error',
        heading: 'Check-in failed',
        subheading: message,
      })

      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleteMutation.isPending) return

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      showToast({
        type: 'success',
        heading: 'Check-in deleted',
        subheading:
          'Your progress history and summaries have been refreshed.',
      })
      setDeleteTarget(null)
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Delete failed',
        subheading:
          error instanceof Error
            ? error.message
            : 'We could not delete this check-in.',
      })
    }
  }

  const initialLoading =
    !overviewQuery.data &&
    overviewQuery.isLoading &&
    !recentLogsQuery.data &&
    recentLogsQuery.isLoading

  const dashboardUser = dashboardQuery.data?.data.user

  return (
    <>
      <PageHeader
        title={`Track your progress, ${getFirstName(dashboardUser?.full_name)} 👋`}
        subtitle="Check in on your weight, trends, and milestones."
        fullName={dashboardUser?.full_name}
        avatarUrl={dashboardUser?.avatar_url}
        onOpenSidebar={openSidebar}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search check-ins..."
      />

      {initialLoading ? (
        <ProgressSkeleton />
      ) : (
        <div>
          <ProgressContent
            overview={overviewQuery.data?.data}
            overviewError={overviewQuery.error?.message ?? null}
            isOverviewRetrying={overviewQuery.isFetching}
            recentLogs={filteredLogs}
            recentTotal={
              recentLogsQuery.data?.data.pagination.total ?? 0
            }
            recentLogsError={recentLogsQuery.isError}
            search={search}
            isCreating={createMutation.isPending}
            onCreate={handleCreate}
            onRetryOverview={() => {
              void overviewQuery.refetch()
            }}
            onRetryLogs={() => {
              void recentLogsQuery.refetch()
            }}
            onDelete={setDeleteTarget}
            onViewAll={() => setAllCheckInsOpen(true)}
            onLogCheckIn={focusCheckIn}
          />
        </div>
      )}

      {allCheckInsOpen ? (
        <AllCheckInsModal
          onClose={() => setAllCheckInsOpen(false)}
          onDelete={setDeleteTarget}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteProgressLogConfirmModal
          log={deleteTarget}
          isDeleting={deleteMutation.isPending}
          onCancel={() => {
            if (!deleteMutation.isPending) {
              setDeleteTarget(null)
            }
          }}
          onConfirm={() => {
            void handleDelete()
          }}
        />
      ) : null}
    </>
  )
}