"use client";

import type { Task, TaskStatus, Subtask } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { AiSubtaskDialog } from "@/components/ai-subtask-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import {
  Circle,
  Clock,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, completed: boolean) => void;
  onAddSubtasks: (taskId: string, subtasks: string[]) => void;
  onEditTask: (taskId: string, data: { title: string; description?: string; subtasks: Subtask[] }) => void;
}

const statusConfig: Record<TaskStatus, { icon: React.ReactElement, label: string }> = {
    pending: { icon: <Circle className="h-5 w-5 text-muted-foreground" />, label: "Pending" },
    "in-progress": { icon: <Clock className="h-5 w-5 text-primary" />, label: "In Progress" },
    completed: { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, label: "Completed" },
};

export function TaskCard({ task, onStatusChange, onSubtaskToggle, onAddSubtasks, onEditTask }: TaskCardProps) {
  const [subtasksVisible, setSubtasksVisible] = useState(true);
  const currentStatusConfig = statusConfig[task.status];

  return (
    <Card className={cn("w-full transition-all", task.status === 'completed' && 'bg-card/60')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={cn(task.status === 'completed' && 'opacity-50')}>{currentStatusConfig.icon}</span>
            <div className="grid gap-1.5">
              <CardTitle className={cn("text-lg", task.status === 'completed' && 'line-through text-muted-foreground')}>
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className={cn(task.status === 'completed' && 'line-through')}>
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditTaskDialog task={task} onEditTask={(data) => onEditTask(task.id, data)} />
              <DropdownMenuSeparator />
              {task.status !== "in-progress" && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "in-progress")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Mark as In Progress
                </DropdownMenuItem>
              )}
              {task.status !== "completed" && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "completed")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Complete
                </DropdownMenuItem>
              )}
              {task.status !== "pending" && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "pending")}>
                  <Circle className="mr-2 h-4 w-4" />
                  Mark as Pending
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {(task.subtasks.length > 0) && (
        <CardContent>
          <Separator />
          <div className="pt-4 space-y-4">
            <button
              onClick={() => setSubtasksVisible(!subtasksVisible)}
              className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})</span>
              {subtasksVisible ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {subtasksVisible && (
              <div className="pl-4 space-y-3 pt-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`subtask-${subtask.id}`}
                      checked={subtask.completed}
                      onCheckedChange={(checked) =>
                        onSubtaskToggle(task.id, subtask.id, !!checked)
                      }
                      disabled={task.status === 'completed'}
                    />
                    <label
                      htmlFor={`subtask-${subtask.id}`}
                      className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        subtask.completed && "line-through text-muted-foreground",
                        (task.status === 'completed' || subtask.completed) && "text-muted-foreground",
                      )}
                    >
                      {subtask.text}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
      <CardFooter className="pt-4">
        <AiSubtaskDialog 
          taskDescription={task.description || task.title} 
          onAddSubtasks={(texts) => onAddSubtasks(task.id, texts)}
        />
      </CardFooter>
    </Card>
  );
}
