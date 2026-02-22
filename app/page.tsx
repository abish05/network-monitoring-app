"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, Shield, TrendingUp } from "lucide-react"
import { useRealTime } from "@/hooks/use-realtime"

function fmtBytesPerSec(b: number | null | undefined) {
  if (!b || isNaN(b)) return '0 B/s'
  const mbps = (b * 8) / (1024 * 1024)
  if (mbps >= 1) return `${mbps.toFixed(2)} Mbps`
  const kbps = (b * 8) / 1024
  return `${kbps.toFixed(2)} Kbps`
}

export default function DashboardPage() {
  const { alerts, logs, traffic, network, connected, loading, health } = useRealTime()

  const activeConnections = traffic?.activeSessions || Math.round((network?.total?.rxBytesPerSec || 0) / 1000)
  const threatsBlocked = logs?.filter((l: any) => /blocked|blocked connection|blocked/i.test(l.message)).length || 0
  const activeAlerts = alerts?.length || 0
  const criticalCount = alerts?.filter((a: any) => a.severity === 'Critical').length || 0
  const avgThroughput = network ? fmtBytesPerSec((network.total.rxBytesPerSec + network.total.txBytesPerSec) / 2) : (traffic?.totalBandwidth || '0 GB/s')

  const recentThreats = alerts?.slice(0, 4) || []

  const services = health?.services ? Object.keys(health.services).map(k => ({ service: k, status: health.services[k] })) : [
    { service: 'Firewall', status: { status: 'Operational', uptime: '99.9%' } },
    { service: 'IDS Engine', status: { status: 'Operational', uptime: '99.8%' } },
    { service: 'Traffic Monitor', status: { status: 'Operational', uptime: '100%' } },
    { service: 'Alert System', status: { status: 'Operational', uptime: '99.7%' } },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of your network security status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-sky-50 to-sky-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="size-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-700">{activeConnections}</div>
            <p className="text-xs text-sky-500">Live connected sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-50 to-rose-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <Shield className="size-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">{threatsBlocked}</div>
            <p className="text-xs text-rose-500">Blocked events (approx)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{activeAlerts}</div>
            <p className="text-xs text-yellow-500">{criticalCount} critical</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Throughput</CardTitle>
            <TrendingUp className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{avgThroughput}</div>
            <p className="text-xs text-emerald-500">Aggregate RX/TX</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Recent Threats</CardTitle>
            <CardDescription>Latest security alerts detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentThreats.length > 0 ? (
                recentThreats.map((t: any, i: number) => (
                  <div key={t.id || i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t.type}</p>
                      <p className="text-xs text-muted-foreground">Source: {t.source}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          t.severity === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
                        }`}
                      >
                        {t.severity}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No recent threats</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((s: any) => (
                <div key={s.service} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{s.service}</p>
                    <p className="text-xs text-muted-foreground">Uptime: {s.status.uptime}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${s.status.status === 'Operational' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.status.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
