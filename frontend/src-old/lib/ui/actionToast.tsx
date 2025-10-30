import { ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'

type Action = {
  label: string
  onClick: () => void
}

type ActionToastOptions = {
  description?: string
  actions?: Action[]
  durationMs?: number
}

export function showActionToast(title: string, options?: ActionToastOptions) {
  const { description, actions, durationMs } = options || {}
  toast.custom(
    (t) => (
      <div className={`max-w-sm w-full bg-white text-gray-900 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black/5 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✅</span>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">{title}</p>
              {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
              {Array.isArray(actions) && actions.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        toast.dismiss(t.id)
                        action.onClick()
                      }}
                      className="px-3 py-1 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: durationMs ?? 5000 }
  )
}

export function showAttentionNotice(title: string, options?: ActionToastOptions) {
  const { description, actions, durationMs } = options || {}
  toast.custom(
    (t) => (
      <div className={`fixed inset-0 z-[9999] ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => toast.dismiss(t.id)}></div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white text-gray-900 shadow-xl rounded-xl ring-1 ring-black/5">
            <div className="p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-lg">✅</span>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-base font-semibold">{title}</p>
                  {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
                  {Array.isArray(actions) && actions.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            toast.dismiss(t.id)
                            action.onClick()
                          }}
                          className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: durationMs ?? 8000 }
  )
}

// Center Dialog rendered via portal (not affected by Toaster's transforms)
export function openCenterDialog(title: string, options?: ActionToastOptions) {
  const { description, actions, durationMs } = options || {}
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  const close = () => {
    try {
      root.unmount()
      container.remove()
    } catch {}
  }

  const Dialog = () => (
    <div className="fixed inset-0 z-[10000]">
      <div className="absolute inset-0 bg-black/40" onClick={close}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white text-gray-900 shadow-xl rounded-xl ring-1 ring-black/5">
          <div className="p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-lg">✅</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-base font-semibold">{title}</p>
                {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
                {Array.isArray(actions) && actions.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          close()
                          action.onClick()
                        }}
                        className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button onClick={close} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  root.render(<Dialog />)

  if (durationMs && durationMs > 0) {
    window.setTimeout(close, durationMs)
  }

  return { close }
}


