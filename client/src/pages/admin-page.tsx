import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Activity,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalQueries: number;
  queriesLast24h: number;
  signupsLast7Days: { date: string; count: number }[];
  queriesLast7Days: { date: string; count: number }[];
  recentEvents: {
    user_email: string;
    event_type: string;
    created_at: string;
    metadata?: any;
  }[];
  authMethods: { method: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REFRESH_INTERVAL_MS = 30_000;

const PIE_COLORS = [
  "hsl(222, 47%, 30%)",
  "hsl(38, 60%, 50%)",
  "hsl(180, 40%, 40%)",
  "hsl(350, 60%, 55%)",
  "hsl(150, 50%, 40%)",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

// ---------------------------------------------------------------------------
// Stat card config
// ---------------------------------------------------------------------------

const statCards = [
  {
    key: "totalUsers" as const,
    label: "Total Users",
    icon: Users,
    gradient: "from-blue-600 to-indigo-700",
    ring: "ring-blue-400/30",
  },
  {
    key: "activeToday" as const,
    label: "Active Today",
    icon: Activity,
    gradient: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-400/30",
  },
  {
    key: "totalQueries" as const,
    label: "Total Queries",
    icon: MessageSquare,
    gradient: "from-amber-500 to-orange-600",
    ring: "ring-amber-400/30",
  },
  {
    key: "queriesLast24h" as const,
    label: "Queries (24 h)",
    icon: TrendingUp,
    gradient: "from-rose-500 to-pink-600",
    ring: "ring-rose-400/30",
  },
];

// ---------------------------------------------------------------------------
// Helper: custom tooltip for recharts
// ---------------------------------------------------------------------------

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs">
      <p className="font-medium text-foreground mb-0.5">{label}</p>
      <p className="text-muted-foreground">
        Count:{" "}
        <span className="font-semibold text-foreground">
          {payload[0].value}
        </span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function AdminSkeleton() {
  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-56" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>

      {/* Auth + table skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AdminStats = await res.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // ---- Loading state ----
  if (loading && !stats) return <AdminSkeleton />;

  // ---- Error state ----
  if (error && !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-6">
        <p className="text-destructive font-medium">Error: {error}</p>
        <Button variant="outline" onClick={() => fetchStats()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  // ---- Derived data ----
  const recentEvents = stats.recentEvents.slice(0, 20);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border bg-background/60 backdrop-blur"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
              NyayaSahay Admin
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 self-start sm:self-auto"
            disabled={refreshing}
            onClick={() => fetchStats(true)}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Stat Cards Row                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = stats[card.key];
            return (
              <motion.div key={card.key} variants={itemVariants}>
                <Card
                  className={`relative overflow-hidden ring-1 ${card.ring} border-0 bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                >
                  {/* Decorative circle */}
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-sans font-medium opacity-90">
                        {card.label}
                      </CardTitle>
                      <Icon className="h-5 w-5 opacity-80" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tabular-nums">
                      {value.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Charts Row                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signups Area Chart */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-sans">
                  Signups — Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.signupsLast7Days}>
                    <defs>
                      <linearGradient
                        id="signupGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(222,47%,30%)"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(222,47%,30%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => format(new Date(d), "MMM d")}
                      tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(222,47%,30%)"
                      strokeWidth={2}
                      fill="url(#signupGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Queries Bar Chart */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-sans">
                  Queries — Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.queriesLast7Days}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => format(new Date(d), "MMM d")}
                      tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="hsl(38,60%,50%)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Auth Methods + Recent Activity                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auth Methods Pie */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-base font-sans">
                  Auth Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.authMethods}
                        dataKey="count"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={72}
                        paddingAngle={4}
                        strokeWidth={0}
                      >
                        {stats.authMethods.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={PIE_COLORS[idx % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          value,
                          name,
                        ]}
                        contentStyle={{
                          borderRadius: "0.5rem",
                          border: "1px solid hsl(214,32%,85%)",
                          background: "hsl(210,20%,98%)",
                          fontSize: "0.75rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {stats.authMethods.map((m, idx) => (
                    <span key={m.method} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      />
                      {m.method}{" "}
                      <span className="font-semibold text-foreground">
                        ({m.count})
                      </span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Table */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-base font-sans">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEvents.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-8"
                        >
                          No recent events
                        </TableCell>
                      </TableRow>
                    )}
                    {recentEvents.map((evt, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(evt.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-sm font-medium truncate max-w-[180px]">
                          {evt.user_email}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {evt.event_type}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[220px]">
                          {evt.metadata
                            ? JSON.stringify(evt.metadata)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
