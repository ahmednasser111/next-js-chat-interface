"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react"

interface ServiceStatus {
  name: string
  status: "healthy" | "unhealthy" | "warning"
  uptime: string
  responseTime: string
  endpoint: string
}

const mockServices: ServiceStatus[] = [
  {
    name: "Kong Gateway",
    status: "healthy",
    uptime: "99.9%",
    responseTime: "12ms",
    endpoint: ":8000",
  },
  {
    name: "Auth Service",
    status: "healthy",
    uptime: "99.8%",
    responseTime: "28ms",
    endpoint: ":3001",
  },
  {
    name: "Chat Service",
    status: "healthy",
    uptime: "99.7%",
    responseTime: "35ms",
    endpoint: ":3002",
  },
  {
    name: "Database",
    status: "warning",
    uptime: "99.5%",
    responseTime: "45ms",
    endpoint: "PostgreSQL",
  },
]

export function ServiceHealth() {
  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    const variants = {
      healthy: "bg-green-500/10 text-green-500 border-green-500/20",
      unhealthy: "bg-red-500/10 text-red-500 border-red-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    }

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="h-5 w-5" />
          Service Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockServices.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.endpoint}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{service.uptime}</p>
                  <p className="text-xs text-muted-foreground">uptime</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{service.responseTime}</p>
                  <p className="text-xs text-muted-foreground">response</p>
                </div>
                {getStatusBadge(service.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
