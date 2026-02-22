"use client"

import * as React from "react"
import { Activity, ArrowDown, ArrowUp, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BandwidthChart, ProtocolChart, TopTalkersChart } from "@/components/traffic-charts"
import { useRealTime } from "@/hooks/use-realtime"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TrafficPage() {
  const { traffic, connected, loading, network, networkHistory } = useRealTime()

  const [unit, setUnit] = React.useState<'Mbps' | 'MB/s'>('Mbps')
  const [windowSize, setWindowSize] = React.useState<number>(5)

  const formatRate = (b: number | undefined | null) => {
    if (!b || isNaN(b)) return '0'
    if (unit === 'Mbps') {
      const mbps = (b * 8) / (1024 * 1024)
      return `${mbps.toFixed(2)} Mbps`
    }
    const mb = b / (1024 * 1024)
    return `${mb.toFixed(2)} MB/s`
  }

  const computeSmoothed = (key: 'rxBytesPerSec' | 'txBytesPerSec') => {
    if (!networkHistory || networkHistory.length === 0) return 0
    const last = networkHistory.slice(-windowSize)
    const sum = last.reduce((s, n) => s + (n.total?.[key] || 0), 0)
    return sum / last.length
  }

  const smoothedRx = computeSmoothed('rxBytesPerSec')
  const smoothedTx = computeSmoothed('txBytesPerSec')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading real-time traffic data...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Network Traffic Analysis</h1>
            <p className="text-muted-foreground">Real-time insights into network performance and bandwidth utilization</p>
          </div>
            <div className="flex items-center gap-4">
              <div className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? '🟢 Live' : '🔴 Connecting...'}
              </div>
              <div className="flex items-center gap-2">
                <Select value={unit} onValueChange={(v) => setUnit(v as 'Mbps' | 'MB/s')}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mbps">Mbps</SelectItem>
                    <SelectItem value="MB/s">MB/s</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={String(windowSize)} onValueChange={(v) => setWindowSize(Number(v))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Smooth: 3</SelectItem>
                    <SelectItem value="5">Smooth: 5</SelectItem>
                    <SelectItem value="10">Smooth: 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Download Speed</CardTitle>
            <ArrowDown className="size-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRate(smoothedRx || network?.total?.rxBytesPerSec)}</div>
            <p className="text-xs text-muted-foreground">Smoothed (window {windowSize})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Speed</CardTitle>
            <ArrowUp className="size-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRate(smoothedTx || network?.total?.txBytesPerSec)}</div>
            <p className="text-xs text-muted-foreground">Smoothed (window {windowSize})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outbound Traffic</CardTitle>
            <ArrowUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{traffic?.outboundTraffic || '0 MB/s'}</div>
            <p className="text-xs text-muted-foreground">Outgoing data rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Globe className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{traffic?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Current connections</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <BandwidthChart />
          <Card>
            <CardHeader>
              <CardTitle>Per-interface Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(network?.interfaces || []).sort((a: any, b: any) => (b.rxRate || 0) - (a.rxRate || 0)).map((iface: any) => (
                  <div key={iface.name} className="flex items-center justify-between border-b py-2">
                    <div>
                      <div className="font-medium">{iface.name}</div>
                      <div className="text-xs text-muted-foreground">RX {formatRate(iface.rxRate)} • TX {formatRate(iface.txRate)}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{Math.round(((iface.rxRate || 0) + (iface.txRate || 0)) / 1024)} KB/s</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <TopTalkersChart />
            </div>
            <div className="col-span-3">
              <ProtocolChart />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="protocols" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ProtocolChart />
            <Card>
              <CardHeader>
                <CardTitle>Protocol Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {traffic?.protocols?.map((protocol: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">{protocol.name}</span>
                      <span>{protocol.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="endpoints" className="space-y-4">
          <TopTalkersChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
