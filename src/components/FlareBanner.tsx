type FlareBannerProps = {
  durationDays: number
}

export default function FlareBanner({ durationDays }: FlareBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-vyr-magenta p-4 text-white">
      <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
      <p className="text-body">
        <span className="font-medium">Active flare</span> — {durationDays} day
        {durationDays === 1 ? '' : 's'} of rough days in a row.
      </p>
    </div>
  )
}
