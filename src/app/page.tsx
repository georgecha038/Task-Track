"use client";

import { useState, useEffect } from "react";
import type { Task, Subtask } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { Header } from "@/components/header";
import { AddTaskForm } from "@/components/add-task-form";
import { TaskTableRow } from "@/components/task-table-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListTodo, Clock, PlusCircle, CheckCircle2 } from "lucide-react";
import { addTask, getTasks, updateTask, deleteTask } from "@/services/task-service";
import { Skeleton } from "@/components/ui/skeleton";

type FilterType = "all" | "active" | "completed";

function TaskPageContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      if (!user) return;
      setIsLoading(true);
      try {
        const fetchedTasks = await getTasks(user.uid);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, [user]);

  const handleAddTask = async (data: { title: string; description?: string, subtasks?: { text: string }[] }) => {
    if (!user) return;
    try {
        const newTask = await addTask({ ...data, userId: user.uid });
        setTasks((prev) => [newTask, ...prev]);
    } catch (error) {
        console.error("Error adding task:", error);
    }
  };

  const handleEditTask = async (taskId: string, data: { title: string; description?: string; subtasks: Subtask[] }) => {
    try {
        await updateTask(taskId, {
            title: data.title,
            description: data.description,
            subtasks: data.subtasks
        });
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { 
                  ...task, 
                  title: data.title, 
                  description: data.description || "",
                  subtasks: data.subtasks,
                }
              : task
          )
        );
    } catch (error) {
        console.error("Error editing task:", error);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
        await updateTask(taskId, { status });
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, status } : task
          )
        );
    } catch(error) {
        console.error("Error updating status:", error);
    }
  };

  const handleSubtaskToggle = async (taskId: string, subtaskId: string, completed: boolean) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || !taskToUpdate.subtasks) return;
    
    const newSubtasks = taskToUpdate.subtasks.map((sub) =>
        sub.id === subtaskId ? { ...sub, completed } : sub
    );

    try {
        await updateTask(taskId, { subtasks: newSubtasks });
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, subtasks: newSubtasks } : task
          )
        );
    } catch(error) {
        console.error("Error toggling subtask:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
        await deleteTask(taskId);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
        console.error("Error deleting task:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") {
      return task.status === "in-progress";
    }
    if (filter === "completed") {
      return task.status === "completed";
    }
    // "all" filter now means "pending"
    return task.status === "pending";
  });
  
  const getEmptyStateMessage = () => {
    switch (filter) {
      case 'active':
        return "You have no active tasks.";
      case 'completed':
        return "You haven't completed any tasks yet.";
      default: // for 'all' (pending)
        if (tasks.length === 0) {
          return "Add a new task to get started.";
        }
        return "You have no pending tasks to show.";
    }
  };

  const renderContent = () => {
    if (isLoading && tasks.length === 0) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        );
    }
    if (filteredTasks.length > 0) {
        return (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">Status</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden w-[100px] text-center sm:table-cell">Subtasks</TableHead>
                  <TableHead className="w-[60px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TaskTableRow
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onSubtaskToggle={handleSubtaskToggle}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        );
    }
    return (
        <div className="text-center text-muted-foreground py-16">
            <p className="font-semibold">No tasks to show.</p>
            <p className="text-sm">
                {getEmptyStateMessage()}
            </p>
        </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <Header />
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
              <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
                <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                    <ListTodo className="mr-2 h-4 w-4" />
                    Tasks
                </TabsTrigger>
                <TabsTrigger value="active" className="flex-1 sm:flex-initial">
                    <Clock className="mr-2 h-4 w-4" />
                    Active
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 sm:flex-initial">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <PlusCircle className="h-6 w-6" />
                    Create New Task
                  </DialogTitle>
                </DialogHeader>
                <AddTaskForm 
                  onAddTask={handleAddTask}
                  onFinished={() => setIsAddDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>

          </div>
          <div className="mt-4">
              {renderContent()}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <TaskPageContent />
    </AuthGuard>
  )
}
