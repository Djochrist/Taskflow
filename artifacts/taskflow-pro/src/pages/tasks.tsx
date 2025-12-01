import { useState } from "react";
import { Plus, Search, Loader2, GripVertical } from "lucide-react";
import { format } from "date-fns";

import { useListTasks, useCreateTask, useUpdateTask, getListTasksQueryKey, useListProjects, useListTeamMembers } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { StatusBadge, PriorityBadge } from "@/components/badges";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-muted" },
  { id: "in_progress", label: "In Progress", color: "bg-primary/10 border-primary/20" },
  { id: "review", label: "In Review", color: "bg-purple-500/10 border-purple-500/20" },
  { id: "done", label: "Done", color: "bg-green-500/10 border-green-500/20" }
];

export default function Tasks() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: tasks, isLoading, isError, refetch } = useListTasks();
  const { data: projects } = useListProjects();
  const { data: team } = useListTeamMembers();
  
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();

  const filteredTasks = tasks?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (taskId: number, newStatus: any) => {
    updateTask.mutate({ id: taskId, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      }
    });
  };

  if (isLoading) return <Layout><LoadingState message="Loading board..." /></Layout>;
  if (isError) return <Layout><ErrorState onRetry={() => refetch()} /></Layout>;

  return (
    <Layout>
      <div className="h-full flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage and track individual work items.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>
            <CreateTaskDialog 
              open={isCreateOpen} 
              onOpenChange={setIsCreateOpen} 
              projects={projects || []}
              team={team || []}
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(column => {
              const columnTasks = filteredTasks?.filter(t => t.status === column.id) || [];
              
              return (
                <div key={column.id} className="w-80 flex flex-col h-full bg-secondary/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                    <h3 className="font-semibold text-sm uppercase tracking-wider">{column.label}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 scrollbar-hide">
                    {columnTasks.map(task => {
                      const project = projects?.find(p => p.id === task.projectId);
                      const assignee = team?.find(m => m.id === task.assigneeId);
                      
                      return (
                        <Card key={task.id} className="p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm group">
                          <div className="flex justify-between items-start mb-2">
                            <PriorityBadge priority={task.priority} />
                            <Select 
                              value={task.status} 
                              onValueChange={(val) => handleStatusChange(task.id, val)}
                            >
                              <SelectTrigger className="h-6 w-auto border-none bg-transparent hover:bg-muted focus:ring-0 px-2 py-0 text-xs shadow-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COLUMNS.map(c => (
                                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <h4 className="font-medium text-sm leading-snug mb-2">{task.title}</h4>
                          
                          {(project || assignee) && (
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                              <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {project?.name}
                              </div>
                              {assignee && (
                                <Avatar className="h-6 w-6">
                                  {assignee.avatarUrl ? (
                                    <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                                  ) : (
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                      {assignee.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  projects, 
  team 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  projects: any[];
  team: any[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<any>("todo");
  const [priority, setPriority] = useState<any>("medium");
  const [projectId, setProjectId] = useState<string>("none");
  const [assigneeId, setAssigneeId] = useState<string>("none");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createTask = useCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        onOpenChange(false);
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        setProjectId("none");
        setAssigneeId("none");
        toast({ title: "Task created successfully" });
      },
      onError: () => {
        toast({ title: "Error creating task", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({
      data: {
        title,
        description,
        status,
        priority,
        projectId: projectId === "none" ? null : parseInt(projectId, 10),
        assigneeId: assigneeId === "none" ? null : parseInt(assigneeId, 10),
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-task">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Update user authentication flow"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add details about the task..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger><SelectValue placeholder="Assign To" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {team.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending || !title.trim()}>
              {createTask.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
