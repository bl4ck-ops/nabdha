export default function LoadingSpinner({ fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
      <p className="text-rose-400 text-sm font-medium">جاري التحميل...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        {content}
      </div>
    )
  }

  return <div className="flex justify-center py-8">{content}</div>
}
