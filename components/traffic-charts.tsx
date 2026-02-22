"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRealTime } from "@/hooks/use-realtime";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Color palette for charts
const COLORS = {
  inbound: "#06b6d4", // sky-500
  outbound: "#f97316", // orange-500
  protocols: ["#06b6d4", "#fb7185", "#f59e0b", "#7c3aed", "#64748b"],
  topTalkers: ["#06b6d4", "#0ea5a4", "#7c3aed", "#f97316", "#ef4444"],
};

const bandwidthConfig = {
  inbound: { label: "Inbound Traffic", color: COLORS.inbound },
  outbound: { label: "Outbound Traffic", color: COLORS.outbound },
} satisfies ChartConfig;

// Simulated data for protocol distribution
// Default protocol colors will be applied from palette
const protocolData = [
  { protocol: "HTTPS", traffic: 4500 },
  { protocol: "HTTP", traffic: 1200 },
  { protocol: "DNS", traffic: 800 },
  { protocol: "SSH", traffic: 450 },
  { protocol: "Other", traffic: 350 },
];

const protocolConfig = {
  traffic: {
    label: "Traffic Volume",
  },
  https: {
    label: "HTTPS",
    color: "hsl(var(--chart-1))",
  },
  http: {
    label: "HTTP",
    color: "hsl(var(--chart-2))",
  },
  dns: {
    label: "DNS",
    color: "hsl(var(--chart-3))",
  },
  ssh: {
    label: "SSH",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

// Simulated data for top talkers
const topTalkersData = [
  { ip: "192.168.1.45", volume: 1250 },
  { ip: "10.0.0.12", volume: 980 },
  { ip: "172.16.0.89", volume: 850 },
  { ip: "192.168.1.105", volume: 720 },
  { ip: "10.0.0.55", volume: 650 },
];

const topTalkersConfig = {
  volume: {
    label: "Data Volume (MB)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BandwidthChart() {
  const [timeRange, setTimeRange] = React.useState("1h");
  const { networkHistory } = useRealTime();

  // Build chart data from networkHistory if available (convert bytes/sec to KB/s)
  const data = React.useMemo(() => {
    if (!networkHistory || networkHistory.length === 0) return [];
    return networkHistory.map((n: any, idx: number) => ({
      time: new Date(n.timestamp).toLocaleTimeString(),
      inbound: Math.round((n.total?.rxBytesPerSec || 0) / 1024),
      outbound: Math.round((n.total?.txBytesPerSec || 0) / 1024),
    }));
  }, [networkHistory]);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Network Bandwidth Usage</CardTitle>
          <CardDescription>
            Real-time inbound and outbound traffic analysis
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="1h" className="rounded-lg">
              Last Hour
            </SelectItem>
            <SelectItem value="24h" className="rounded-lg">
              Last 24 Hours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 Days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={bandwidthConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={
                data.length ? data : [{ time: "—", inbound: 0, outbound: 0 }]
              }
            >
              <defs>
                <linearGradient id="fillInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.inbound}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.inbound}
                    stopOpacity={0.08}
                  />
                </linearGradient>
                <linearGradient id="fillOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.outbound}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.outbound}
                    stopOpacity={0.08}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20}
              />
              <YAxis tickFormatter={(v) => `${v} KB/s`} />
              <Tooltip />
              <Legend
                verticalAlign="top"
                align="right"
                payload={[
                  {
                    id: "inbound",
                    type: "line",
                    value: "Inbound",
                    color: COLORS.inbound,
                  },
                  {
                    id: "outbound",
                    type: "line",
                    value: "Outbound",
                    color: COLORS.outbound,
                  },
                ]}
              />
              <Area
                dataKey="inbound"
                type="monotone"
                fill="url(#fillInbound)"
                stroke={COLORS.inbound}
                strokeWidth={2}
              />
              <Area
                dataKey="outbound"
                type="monotone"
                fill="url(#fillOutbound)"
                stroke={COLORS.outbound}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ProtocolChart() {
  const totalTraffic = React.useMemo(() => {
    return protocolData.reduce((acc, curr) => acc + curr.traffic, 0);
  }, []);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Protocol Distribution</CardTitle>
        <CardDescription>Traffic breakdown by protocol</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={protocolConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Pie
                data={protocolData}
                dataKey="traffic"
                nameKey="protocol"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={0}
              >
                {protocolData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS.protocols[idx % COLORS.protocols.length]}
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalTraffic.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            MB Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                payload={protocolData.map((p, i) => ({
                  value: p.protocol,
                  id: p.protocol,
                  color: COLORS.protocols[i % COLORS.protocols.length],
                }))}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function TopTalkersChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Talkers</CardTitle>
        <CardDescription>Highest bandwidth consuming IPs</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={topTalkersConfig}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={topTalkersData}
              layout="vertical"
              margin={{ left: 0 }}
            >
              <YAxis
                dataKey="ip"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={120}
              />
              <XAxis type="number" hide />
              <Tooltip />
              <Bar dataKey="volume" radius={[6, 6, 6, 6]}>
                {topTalkersData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS.topTalkers[idx % COLORS.topTalkers.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
