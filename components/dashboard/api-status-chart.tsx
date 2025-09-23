"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const mockApiData = [
  { time: "00:00", requests: 1200, latency: 45, errors: 2 },
  { time: "04:00", requests: 800, latency: 38, errors: 1 },
  { time: "08:00", requests: 2400, latency: 52, errors: 5 },
  { time: "12:00", requests: 3200, latency: 48, errors: 3 },
  { time: "16:00", requests: 2800, latency: 41, errors: 2 },
  { time: "20:00", requests: 1600, latency: 39, errors: 1 },
]

export function ApiStatusChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">API Performance</CardTitle>
        <CardDescription className="text-muted-foreground">
          Request volume and response times over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            requests: {
              label: "Requests",
              color: "hsl(var(--chart-1))",
            },
            latency: {
              label: "Latency (ms)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockApiData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" className="text-muted-foreground" fontSize={12} />
              <YAxis yAxisId="requests" orientation="left" className="text-muted-foreground" fontSize={12} />
              <YAxis yAxisId="latency" orientation="right" className="text-muted-foreground" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="requests"
                type="monotone"
                dataKey="requests"
                stroke="var(--color-requests)"
                strokeWidth={2}
                dot={{ fill: "var(--color-requests)", strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="latency"
                type="monotone"
                dataKey="latency"
                stroke="var(--color-latency)"
                strokeWidth={2}
                dot={{ fill: "var(--color-latency)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
