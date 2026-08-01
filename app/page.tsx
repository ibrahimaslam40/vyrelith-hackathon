import Link from 'next/link'

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-vyr-purpleDeep px-6 py-12">
      <div />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[28px] font-medium uppercase tracking-[0.08em] text-white">
          Vyrelith
        </p>
        <p className="text-body text-vyr-lavender">
          Track what's really happening in your body — and finally show someone.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Link
          href="/signup"
          className="flex min-h-[44px] items-center justify-center rounded-control bg-vyr-magenta text-body font-medium text-white"
        >
          Create account
        </Link>
        <Link
          href="/signin"
          className="flex min-h-[44px] items-center justify-center rounded-control border-[0.5px] border-vyr-lavender text-body font-medium text-white"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
