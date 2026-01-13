import { TrackingHistory } from '@/lib/shipments/types'
import { formatDateTime, getStatusIcon, formatStatusCode } from '@/lib/shipments/utils'
import { cn } from '@/lib/utils'

interface TrackingTimelineProps {
  trackingHistory: TrackingHistory[]
}

export function TrackingTimeline({ trackingHistory }: TrackingTimelineProps) {
  if (!trackingHistory || trackingHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tracking history available
      </div>
    )
  }

  const sortedHistory = [...trackingHistory].sort(
    (a, b) => new Date(b.actionDatetime).getTime() - new Date(a.actionDatetime).getTime()
  )

  return (
    <div className="space-y-4">
      {sortedHistory.map((event, index) => {
        const Icon = getStatusIcon(event.statusCode)
        const isFirst = index === 0

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'rounded-full p-2',
                  isFirst ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {index < sortedHistory.length - 1 && (
                <div className="w-px h-full min-h-[40px] bg-border" />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{formatStatusCode(event.statusCode)}</div>
                  <div className="text-sm text-muted-foreground">{event.statusDescription}</div>
                  {event.location && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Location: {event.location}
                    </div>
                  )}
                  {event.remarks && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {event.remarks}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(event.actionDatetime)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
