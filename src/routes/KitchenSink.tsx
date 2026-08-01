import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Chip from '../components/Chip'
import SeveritySlider from '../components/SeveritySlider'
import GroupRow from '../components/GroupRow'
import InsightCard from '../components/InsightCard'
import MetricTile from '../components/MetricTile'
import SectionHeader from '../components/SectionHeader'

export default function KitchenSink() {
  const [chipSelected, setChipSelected] = useState(false)
  const [severity, setSeverity] = useState<number | null>(6)
  const [emptyRowExpanded, setEmptyRowExpanded] = useState(false)
  const [loggedRowExpanded, setLoggedRowExpanded] = useState(true)

  return (
    <div className="flex flex-col gap-6 p-4 pb-12">
      <h1 className="text-heading font-medium text-vyr-purple">
        Kitchen sink
      </h1>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Buttons" />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Save entry</Button>
          <Button variant="secondary">Log period start</Button>
          <Button variant="primary" disabled>
            Save entry
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Chips" />
        <div className="flex flex-wrap gap-2">
          <Chip
            label="Morning stiffness"
            selected={chipSelected}
            onClick={() => setChipSelected((v) => !v)}
          />
          <Chip label="Swelling" selected={false} />
          <Chip label="Warmth" selected={true} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Severity slider" />
        <Card>
          <SeveritySlider value={severity} onChange={setSeverity} />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Group row" />
        <Card className="p-0">
          <GroupRow
            label="Pain and joints"
            count={0}
            expanded={emptyRowExpanded}
            onToggle={() => setEmptyRowExpanded((v) => !v)}
          >
            <p className="text-label text-vyr-textMute">
              Panel content goes here.
            </p>
          </GroupRow>
          <GroupRow
            label="Energy"
            count={3}
            expanded={loggedRowExpanded}
            onToggle={() => setLoggedRowExpanded((v) => !v)}
          >
            <p className="text-label text-vyr-textMute">
              Panel content goes here.
            </p>
          </GroupRow>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Insight card" />
        <div className="flex flex-col gap-2">
          <InsightCard
            state="ready"
            percent={41}
            body="higher joint pain in the 4 days before your period."
          />
          <InsightCard
            state="keep-logging"
            body="Keep logging — two more cycles to unlock this insight."
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Metric tile" />
        <div className="flex gap-2">
          <MetricTile label="Streak" value="12 days" />
          <MetricTile label="Cycle day" value="14" />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Card" />
        <Card>
          <p className="text-body text-vyr-purple">Basic card content.</p>
        </Card>
      </section>
    </div>
  )
}
