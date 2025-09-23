"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description?: string
}

export function MetricsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
}: MetricsCardProps) {
  const changeColor = {
    positive: "text-green-500 bg-green-500/10 border-green-500/20",
    negative: "text-red-500 bg-red-500/10 border-red-500/20",
    neutral: "text-muted-foreground bg-muted border-border",
  }[changeType]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          {change && (
            <Badge variant="secondary" className={changeColor}>
              {change}
            </Badge>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
