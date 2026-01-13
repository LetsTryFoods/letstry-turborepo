import { Badge } from '@/components/ui/badge'
import { formatStatusCode, getStatusColor } from '@/lib/shipments/utils'

interface ShipmentStatusBadgeProps {
  statusCode?: string
  size?: 'sm' | 'default' | 'lg'
}

export function ShipmentStatusBadge({ statusCode, size = 'default' }: ShipmentStatusBadgeProps) {
  const color = getStatusColor(statusCode)
  const label = formatStatusCode(statusCode)

  const variantMap: Record<string, any> = {
    blue: 'default',
    cyan: 'secondary',
    indigo: 'secondary',
    purple: 'secondary',
    green: 'default',
    red: 'destructive',
    orange: 'destructive',
    gray: 'outline',
    yellow: 'secondary',
    default: 'outline',
  }

  const variant = variantMap[color] || 'outline'

  const colorClassMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    cyan: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
    indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    green: 'bg-green-100 text-green-800 hover:bg-green-100',
    red: 'bg-red-100 text-red-800 hover:bg-red-100',
    orange: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  }

  const colorClass = colorClassMap[color] || ''

  return (
    <Badge variant={variant} className={colorClass}>
      {label}
    </Badge>
  )
}
