import Card from '@/components/ui/Card'
import { BoxIcon, CameraIcon, SparkleIcon } from '@/components/ui/icons'

export default function ValueProps({ className = '' }: { className?: string }) {
  return (
    <Card className={`flex w-full flex-col gap-3 text-left ${className}`}>
      <div className="flex items-start gap-3">
        <BoxIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">Any stay, covered.</span> A
          long-term lease or a weekend on Airbnb or Booking.com — document it the same way,
          for total peace of mind either way.
        </p>
      </div>
      <div className="flex items-start gap-3">
        <CameraIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">Real, timestamped photos.</span>{' '}
          Every photo you take is time-stamped and stored securely as your evidence.
        </p>
      </div>
      <div className="flex items-start gap-3">
        <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">AI-drafted, evidence-only.</span> If
          you need to dispute a claim, we draft the paperwork strictly from what you
          captured — never invented details.
        </p>
      </div>
    </Card>
  )
}
