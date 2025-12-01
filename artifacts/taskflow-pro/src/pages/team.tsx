import { useState } from "react";
import { Plus, Mail, MoreHorizontal, Loader2, UserPlus, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { useListTeamMembers, useCreateTeamMember, useDeleteTeamMember, getListTeamMembersQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Team() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: team, isLoading, isError, refetch } = useListTeamMembers();
  const deleteMember = useDeleteTeamMember();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    
    deleteMember.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        toast({ title: "Team member removed" });
      }
    });
  };

  if (isLoading) return <Layout><LoadingState message="Loading team..." /></Layout>;
  if (isError) return <Layout><ErrorState onRetry={() => refetch()} /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Team Directory</h1>
            <p className="text-muted-foreground mt-1">Manage users and roles within your organization.</p>
          </div>
          
          <CreateMemberDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {team?.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow group">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col items-center text-center relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Avatar className="w-20 h-20 mb-4 border-2 border-background shadow-sm ring-2 ring-primary/10">
                    {member.avatarUrl ? (
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                    ) : (
                      <AvatarFallback className="text-xl bg-primary/5 text-primary font-medium">
                        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1 mb-3">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                    <Badge variant="secondary" className="capitalize">
                      {member.role}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {member.taskCount} tasks
                    </Badge>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 text-xs text-center text-muted-foreground border-t border-border">
                  Joined {format(new Date(member.createdAt), "MMMM yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function CreateMemberDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<any>("developer");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMember = useCreateTeamMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        onOpenChange(false);
        setName("");
        setEmail("");
        setRole("developer");
        toast({ title: "Team member added successfully" });
      },
      onError: () => {
        toast({ title: "Error adding member", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    createMember.mutate({
      data: {
        name,
        email,
        role,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=6d28d9` // Using primary color hex
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-member">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Jane Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="jane@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMember.isPending || !name.trim() || !email.trim()}>
              {createMember.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
