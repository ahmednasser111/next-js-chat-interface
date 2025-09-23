"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const mockTrafficData = [
  { endpoint: "/api/messages", requests: 15420, avgLatency: 45 },
  { endpoint: "/api/auth/login", requests: 8930, avgLatency: 32 },
  { endpoint: "/api/rooms", requests: 6750, avgLatency: 28 },
  { endpoint: "/api/users/me", requests: 12340, avgLatency: 18 },
  { endpoint: "/socket.io/", requests: 25680, avgLatency: 12 },
  { endpoint: "/api/auth/register", requests: 2140, avgLatency: 38 },
]

export function TrafficChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Endpoint Traffic</CardTitle>
        <CardDescription className="text-muted-foreground">
          Request volume by endpoint over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            requests: {
              label: "Requests",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockTrafficData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-muted-foreground" fontSize={12} />
              <YAxis type="category" dataKey="endpoint" className="text-muted-foreground" fontSize={10} width={100} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`${value.toLocaleString()} requests`, "Total Requests"]}
              />
              <Bar dataKey="requests" fill="var(--color-requests)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
