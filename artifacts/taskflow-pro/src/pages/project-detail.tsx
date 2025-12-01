import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { Calendar, Clock, ChevronLeft, Edit2, Trash2, CheckCircle2, Circle, MoreHorizontal, Loader2 } from "lucide-react";

import { useGetProject, getGetProjectQueryKey, useUpdateProject, useDeleteProject, useListTasks } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { StatusBadge, PriorityBadge } from "@/components/badges";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function ProjectDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = parseInt(params.id || "0", 10);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: project, isLoading, isError, refetch } = useGetProject(id, { 
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) } 
  });

  const { data: tasks, isLoading: tasksLoading } = useListTasks({ projectId: id }, {
    query: { enabled: !!id }
  });

  const deleteProject = useDeleteProject({
    mutation: {
      onSuccess: () => {
        toast({ title: "Project deleted successfully" });
        setLocation("/projects");
      },
      onError: () => {
        toast({ title: "Error deleting project", variant: "destructive" });
      }
    }
  });

  const updateProject = useUpdateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
        toast({ title: "Project updated" });
      }
    }
  });

  if (isLoading) return <Layout><LoadingState message="Loading project details..." /></Layout>;
  if (isError || !project) return <Layout><ErrorState onRetry={() => refetch()} /></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/projects")}
          className="text-muted-foreground -ml-2 hover:bg-transparent hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            
            {project.description && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Created {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
              </div>
              {project.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due {format(new Date(project.dueDate), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateProject.mutate({ id, data: { status: "active" } })}>
                  Set as Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateProject.mutate({ id, data: { status: "completed", progress: 100 } })}>
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
            <Button size="sm" onClick={() => setLocation("/tasks")}>
              View Board
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {tasksLoading ? (
                <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
              ) : tasks?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No tasks assigned to this project yet.
                </div>
              ) : (
                tasks?.map(task => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className={`font-medium ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteProject.mutate({ id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
