type InsightCardProps =
  | { state: 'ready'; percent: number; body: string }
  | { state: 'keep-logging'; body: string }

export default function InsightCard(props: InsightCardProps) {
  return (
    <div className="rounded-card border-[0.5px] border-vyr-lavenderPl bg-white p-4">
      {props.state === 'ready' ? (
        <p className="text-body text-vyr-purple">
          <span className="text-heading font-medium text-vyr-teal">
            {props.percent}%
          </span>{' '}
          {props.body}
        </p>
      ) : (
        <p className="text-body text-vyr-textMute">{props.body}</p>
      )}
    </div>
  )
}
