import { useToast} from "@/hooks/use-toast"
import {
  Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, } from "@/components/ui/toast"

export function Toaster() {
  const {_toasts} = useToast()

  return (<ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={_id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{_title}</ToastTitle>}
              {description && (
                <ToastDescription>{_description}</ToastDescription>
              )}
            </div>
            {_action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
