import Toast from './Toast'
import { useToastStore } from '../stores/toastStore'

export default function GlobalToast() {
  const toast = useToastStore((state) => state.toast)
  const hideToast = useToastStore((state) => state.hideToast)

  if (!toast) return null

  const { id, ...toastProps } = toast

  return <Toast key={id} {...toastProps} onClose={() => hideToast(id)} />
}