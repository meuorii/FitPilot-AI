import { create } from 'zustand'
import type { ToastProps } from '../components/Toast'

export type ToastOptions = Pick<
  ToastProps,
  | 'type'
  | 'heading'
  | 'subheading'
  | 'duration'
  | 'position'
  | 'iconSrc'
  | 'mascotSrc'
  | 'mascotAlt'
  | 'showCloseButton'
  | 'showProgress'
>

interface ActiveToast extends ToastOptions {
  id: number
}

interface ToastStore {
  toast: ActiveToast | null
  showToast: (options: ToastOptions) => void
  hideToast: (id?: number) => void
}

let nextToastId = 0

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  showToast: (options) => set({ toast: { ...options, id: (nextToastId += 1) } }),
  hideToast: (id) => set((state) => (id !== undefined && state.toast?.id !== id ? state : { toast: null })),
}))