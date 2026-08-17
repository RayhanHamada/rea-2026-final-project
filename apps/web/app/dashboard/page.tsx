"use client";

import {
  BriefcaseBusiness,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartConfig = {
  applications: {
    label: "Applications",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "Jan", applications: 42 },
  { month: "Feb", applications: 58 },
  { month: "Mar", applications: 66 },
  { month: "Apr", applications: 73 },
  { month: "May", applications: 95 },
  { month: "Jun", applications: 89 },
  { month: "Jul", applications: 118 },
];

const stats = [
  {
    title: "Total candidates",
    value: "2,847",
    change: "+12.5%",
    icon: UsersRound,
  },
  {
    title: "Active jobs",
    value: "86",
    change: "+4.1%",
    icon: BriefcaseBusiness,
  },
  {
    title: "Applications",
    value: "1,320",
    change: "+8.2%",
    icon: Wallet,
  },
  {
    title: "Hiring velocity",
    value: "18 days",
    change: "+2.3%",
    icon: TrendingUp,
  },
];

const recentApplications = [
  {
    candidate: "Maya Chen",
    role: "Frontend Engineer",
    status: "Interview",
    progress: 66,
  },
  {
    candidate: "Ethan Brown",
    role: "Product Designer",
    status: "Reviewed",
    progress: 40,
  },
  {
    candidate: "Sofia Rossi",
    role: "Backend Engineer",
    status: "Shortlisted",
    progress: 80,
  },
  {
    candidate: "Liam Patel",
    role: "Data Analyst",
    status: "New",
    progress: 20,
  },
] as const;

const statusVariant = {
  New: "outline",
  Reviewed: "secondary",
  Interview: "default",
  Shortlisted: "default",
} as const;

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: (typeof stats)[number]) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardDescription>{title}</CardDescription>
        <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
          <Icon className="text-muted-foreground size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <p className="text-muted-foreground mt-1 text-xs">
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {change}
          </span>{" "}
          vs last month
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s how your hiring pipeline is looking.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applications over time</CardTitle>
            <CardDescription>January – July 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={32}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="applications"
                  type="natural"
                  fill="var(--color-applications)"
                  fillOpacity={0.2}
                  stroke="var(--color-applications)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent applications</CardTitle>
            <CardDescription>Your latest candidate activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApplications.map((item) => (
                  <TableRow key={item.candidate}>
                    <TableCell>
                      <div className="font-medium">{item.candidate}</div>
                      <div className="text-muted-foreground text-xs">
                        {item.role}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={statusVariant[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline health</CardTitle>
          <CardDescription>Conversion across each hiring stage</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {recentApplications.map((item) => (
            <div key={item.candidate} className="flex items-center gap-4">
              <div className="w-40 shrink-0">
                <div className="text-sm font-medium">{item.status}</div>
                <div className="text-muted-foreground text-xs">{item.role}</div>
              </div>
              <Progress value={item.progress} className="flex-1" />
              <span className="text-muted-foreground w-12 shrink-0 text-right text-sm">
                {item.progress}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
