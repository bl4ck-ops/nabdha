export default function LoadingSpinner({ fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <span className="text-3xl animate-heartbeat">💗</span>
      <p className="text-brand-400 text-sm font-medium">جاري التحميل...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        {content}
      </div>
    )
  }

  return <div className="flex justify-center py-8">{content}</div>
}
