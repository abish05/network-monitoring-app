"use client"
import * as React from "react"
import { Calendar, Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useRealTime } from "@/hooks/use-realtime"

export default function LogsPage() {
  const { logs, connected, loading } = useRealTime()
  const [selectedLevel, setSelectedLevel] = React.useState("all")

  const filteredLogs = selectedLevel === "all" 
    ? logs 
    : logs.filter((log: any) => log.level === selectedLevel)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
            <p className="text-muted-foreground">Real-time event logging for system auditing and troubleshooting</p>
          </div>
          <div className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? '🟢 Live' : '🔴 Connecting...'}
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-slate-50 to-sky-50">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Event Log</CardTitle>
              <CardDescription>Real-time system events and activities</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input type="search" placeholder="Search logs..." className="w-full pl-8 sm:w-[250px]" />
              </div>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Calendar className="mr-2 size-4" />
                Date Range
              </Button>
              <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading real-time data...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[100px]">Level</TableHead>
                    <TableHead className="w-[150px]">Component</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[100px]">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              log.level === "ERROR"
                                ? "bg-destructive/10 text-destructive ring-destructive/20"
                                : log.level === "WARN"
                                  ? "bg-orange-500/10 text-orange-500 ring-orange-500/20"
                                  : log.level === "INFO"
                                    ? "bg-blue-500/10 text-blue-500 ring-blue-500/20"
                                    : "bg-muted text-muted-foreground ring-muted-foreground/20"
                            }`}
                          >
                            {log.level}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{log.component}</TableCell>
                        <TableCell className="max-w-[500px] truncate" title={log.message}>
                          {log.message}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{log.id}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
