"use client";

import * as React from "react";
import type { Task, TaskStatus, Subtask } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import {
  Circle,
  Clock,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskTableRowProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, completed: boolean) => void;
  onEditTask: (taskId: string, data: { title: string; description?: string; subtasks: Subtask[] }) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusConfig: Record<TaskStatus, { icon: React.ReactElement, label: string }> = {
    pending: { icon: <Circle className="h-5 w-5 text-muted-foreground" />, label: "Pending" },
    "in-progress": { icon: <Clock className="h-5 w-5 text-primary" />, label: "In Progress" },
    completed: { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, label: "Completed" },
};

export function TaskTableRow({ task, onStatusChange, onSubtaskToggle, onEditTask, onDeleteTask }: TaskTableRowProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const currentStatusConfig = statusConfig[task.status];
  
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  
  const hasSubtasks = totalSubtasks > 0;

  return (
    <>
      <TableRow data-state={isExpanded ? "open" : "closed"} className={cn(task.status === 'completed' && 'bg-card/60', !isExpanded && "border-b")}>
        <TableCell className="font-medium text-center">
          <span title={currentStatusConfig.label} className={cn(task.status === 'completed' && 'opacity-50')}>
              {currentStatusConfig.icon}
          </span>
        </TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                {hasSubtasks ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -ml-2" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="sr-only">{isExpanded ? "Collapse" : "Expand"}</span>
                    </Button>
                ) : (
                    <div className="w-8 h-8 flex-shrink-0" />
                )}
                <div className="grid gap-0.5">
                    <span className={cn("font-medium", task.status === 'completed' && 'line-through text-muted-foreground')}>
                        {task.title}
                    </span>
                    {task.description && (
                        <span className={cn("text-sm text-muted-foreground", task.status === 'completed' && 'line-through')}>
                            {task.description}
                        </span>
                    )}
                </div>
            </div>
        </TableCell>
        <TableCell className="hidden sm:table-cell text-center">
            {hasSubtasks && (
                <span className="text-muted-foreground text-sm">{completedSubtasks}/{totalSubtasks}</span>
            )}
        </TableCell>
        <TableCell className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <EditTaskDialog task={task} onEditTask={onEditTask} />
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
                <DropdownMenuSeparator />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        onSelect={(e) => e.preventDefault()}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                    </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this
                        task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={() => onDeleteTask(task.id)}
                        >
                        Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
      </TableRow>
      {isExpanded && hasSubtasks && (
        <TableRow className={cn(task.status === 'completed' && 'bg-card/60')}>
          <TableCell />
          <TableCell colSpan={3} className="p-0">
            <div className="pl-10 pr-4 py-4 space-y-3">
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
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
