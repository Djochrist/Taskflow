import { useGetDashboardStats, useGetRecentActivity, useGetProjectBreakdown } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading, isError: activityError } = useGetRecentActivity();
  const { data: breakdown, isLoading: breakdownLoading } = useGetProjectBreakdown();

  if (statsLoading || activityLoading || breakdownLoading) return <Layout><LoadingState message="Loading dashboard..." /></Layout>;
  if (statsError || activityError) return <Layout><ErrorState onRetry={() => refetchStats()} /></Layout>;

  const statCards = [
    { title: "Active Projects", value: stats?.activeProjects || 0, total: stats?.totalProjects, icon: FolderKanban, color: "text-blue-500" },
    { title: "Tasks In Progress", value: stats?.inProgressTasks || 0, total: stats?.totalTasks, icon: CheckSquare, color: "text-primary" },
    { title: "Team Members", value: stats?.teamSize || 0, icon: Users, color: "text-green-500" },
    { title: "Completion Rate", value: `${stats?.completionRate || 0}%`, icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your team's projects and tasks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                    {stat.value}
                    {stat.total !== undefined && <span className="text-sm text-muted-foreground font-normal ml-2">/ {stat.total}</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activity?.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4"
                  >
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{item.actorName}</span>{" "}
                        <span className="text-muted-foreground">{item.description}</span>{" "}
                        <span className="font-medium">{item.entityName}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(item.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {(!activity || activity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breakdown?.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{item.status.replace("_", " ")}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
