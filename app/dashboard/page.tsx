"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricsCard } from "@/components/dashboard/metrics-card"
import { ApiStatusChart } from "@/components/dashboard/api-status-chart"
import { ServiceHealth } from "@/components/dashboard/service-health"
import { TrafficChart } from "@/components/dashboard/traffic-chart"
import { Activity, Users, MessageSquare, Server, Clock, TrendingUp, ArrowLeft, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  // Mock data - in a real app, this would come from your Kong API
  const metrics = {
    totalRequests: "2.4M",
    activeUsers: "1,234",
    totalMessages: "45.2K",
    avgLatency: "42ms",
    uptime: "99.9%",
    errorRate: "0.1%",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Kong Chat Dashboard</h1>
                <p className="text-muted-foreground">Monitor your API Gateway and chat services performance</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-border text-foreground bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={() => router.push("/chat")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Open Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-background">
              Services
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricsCard
                title="Total Requests"
                value={metrics.totalRequests}
                change="+12.5%"
                changeType="positive"
                icon={Activity}
                description="vs last 24h"
              />
              <MetricsCard
                title="Active Users"
                value={metrics.activeUsers}
                change="+8.2%"
                changeType="positive"
                icon={Users}
                description="currently online"
              />
              <MetricsCard
                title="Messages Sent"
                value={metrics.totalMessages}
                change="+15.3%"
                changeType="positive"
                icon={MessageSquare}
                description="last 24h"
              />
              <MetricsCard
                title="Avg Latency"
                value={metrics.avgLatency}
                change="-5ms"
                changeType="positive"
                icon={Clock}
                description="response time"
              />
              <MetricsCard
                title="Uptime"
                value={metrics.uptime}
                change="stable"
                changeType="neutral"
                icon={Server}
                description="last 30 days"
              />
              <MetricsCard
                title="Error Rate"
                value={metrics.errorRate}
                change="-0.05%"
                changeType="positive"
                icon={TrendingUp}
                description="vs last week"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApiStatusChart />
              <TrafficChart />
            </div>

            {/* Service Health */}
            <ServiceHealth />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Kong Gateway Configuration</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Current gateway settings and plugins
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm font-medium text-foreground">Services</p>
                      <p className="text-2xl font-bold text-primary">3</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm font-medium text-foreground">Routes</p>
                      <p className="text-2xl font-bold text-primary">12</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm font-medium text-foreground">Plugins</p>
                      <p className="text-2xl font-bold text-primary">8</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm font-medium text-foreground">Consumers</p>
                      <p className="text-2xl font-bold text-primary">1,234</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Active Plugins</CardTitle>
                  <CardDescription className="text-muted-foreground">Currently enabled Kong plugins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "JWT Authentication",
                      "Rate Limiting",
                      "CORS",
                      "Request Transformer",
                      "Response Transformer",
                      "Prometheus",
                      "File Log",
                      "IP Restriction",
                    ].map((plugin, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/20">
                        <span className="text-sm text-foreground">{plugin}</span>
                        <span className="text-xs text-green-500">Active</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <ServiceHealth />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <ApiStatusChart />
              <TrafficChart />

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Request Analytics</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Detailed breakdown of API usage patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h3 className="font-medium text-foreground mb-2">Top Endpoints</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">/socket.io/</span>
                          <span className="text-foreground">35.2%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">/api/messages</span>
                          <span className="text-foreground">21.8%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">/api/users/me</span>
                          <span className="text-foreground">17.4%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30">
                      <h3 className="font-medium text-foreground mb-2">Response Codes</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-500">200 OK</span>
                          <span className="text-foreground">94.2%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-500">401 Unauthorized</span>
                          <span className="text-foreground">3.1%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-500">500 Error</span>
                          <span className="text-foreground">0.1%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30">
                      <h3 className="font-medium text-foreground mb-2">Peak Hours</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">12:00 - 14:00</span>
                          <span className="text-foreground">Peak</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">09:00 - 11:00</span>
                          <span className="text-foreground">High</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">02:00 - 06:00</span>
                          <span className="text-foreground">Low</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
