'use client'

import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface ColumnDefinition {
  key: string
  label: string
}

interface ColumnSelectorProps {
  allColumns: ColumnDefinition[]
  selectedColumns: string[]
  onColumnToggle: (columnKey: string) => void
}

export function ColumnSelector({ allColumns, selectedColumns, onColumnToggle }: ColumnSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="text-lg font-medium">Select Columns to Display</h3>
      <Select value={selectedColumns.length > 0 ? "has-selection" : ""}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select fields you want to see">
            {selectedColumns.length > 0 && 
              `${selectedColumns.length} column${selectedColumns.length !== 1 ? 's' : ''} selected`
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allColumns.map(column => {
            const isSelected = selectedColumns.includes(column.key)
            return (
              <div
                key={column.key}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                onClick={() => onColumnToggle(column.key)}
              >
                <Checkbox
                  checked={isSelected}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={() => onColumnToggle(column.key)}
                />
                <span className="text-sm">{column.label}</span>
              </div>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
