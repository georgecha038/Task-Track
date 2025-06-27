"use client";

import { useState } from "react";
import type { Task, TaskStatus, Subtask } from "@/types";
import { AddTaskForm } from "@/components/add-task-form";
import { TaskCard } from "@/components/task-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck2, ListTodo, Hourglass } from "lucide-react";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Launch new marketing campaign",
    description: "Prepare and launch a multi-channel marketing campaign for the new Q3 product lineup.",
    status: "in-progress",
    subtasks: [
      { id: "s1-1", text: "Finalize campaign copy", completed: true },
      { id: "s1-2", text: "Design social media assets", completed: true },
      { id: "s1-3", text: "Schedule email blasts", completed: false },
      { id: "s1-4", text: "Setup analytics dashboard", completed: false },
    ],
  },
  {
    id: "2",
    title: "Develop user authentication feature",
    description: "Implement a secure user login and registration system using JWT.",
    status: "pending",
    subtasks: [],
  },
  {
    id: "3",
    title: "Refactor legacy codebase",
    description: "Update the old component library to use the new design system and improve performance.",
    status: "completed",
    subtasks: [
      { id: "s3-1", text: "Audit all existing components", completed: true },
      { id: "s3-2", text: "Replace CSS modules with Tailwind", completed: true },
      { id: "s3-3", text: "Write unit tests for new components", completed: true },
    ],
  },
];

type FilterType = "all" | "active";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>("all");

  const handleAddTask = (data: { title: string; description?: string, subtasks?: { text: string }[] }) => {
    const newSubtasks: Subtask[] = (data.subtasks || [])
      .filter(sub => sub.text.trim() !== '')
      .map((sub, index) => ({
        id: `new-${Date.now()}-${index}`,
        text: sub.text,
        completed: false,
      }));

    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description || "",
      status: "pending",
      subtasks: newSubtasks,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleEditTask = (taskId: string, data: { title: string; description?: string; subtasks: Subtask[] }) => {
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
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((sub) =>
              sub.id === subtaskId ? { ...sub, completed } : sub
            ),
          };
        }
        return task;
      })
    );
  };

  const handleAddSubtasks = (taskId: string, subtaskTexts: string[]) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newSubtasks: Subtask[] = subtaskTexts.map((text, index) => ({
            id: `s-${taskId}-${Date.now()}-${index}`,
            text,
            completed: false,
          }));
          return {
            ...task,
            subtasks: [...task.subtasks, ...newSubtasks],
          };
        }
        return task;
      })
    );

  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") {
      return task.status === "in-progress";
    }
    return true;
  }).sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0;
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-sm">
                <FileCheck2 className="h-8 w-8 text-primary"/>
                <h1 className="text-4xl font-bold tracking-tight">TaskTrack</h1>
            </div>
          <p className="mt-2 text-muted-foreground">A simple and intelligent way to manage your tasks.</p>
        </header>

        <section>
          <AddTaskForm onAddTask={handleAddTask} />
        </section>

        <section className="space-y-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
              <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                  <ListTodo className="mr-2 h-4 w-4" />
                  All Tasks
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1 sm:flex-initial">
                  <Hourglass className="mr-2 h-4 w-4" />
                  Active
              </TabsTrigger>
            </TabsList>
            <div className="mt-4 space-y-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onSubtaskToggle={handleSubtaskToggle}
                        onAddSubtasks={handleAddSubtasks}
                        onEditTask={handleEditTask}
                        />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p className="font-semibold">No tasks to show.</p>
                        <p className="text-sm">
                            {filter === 'active' ? "You have no active tasks." : "Add a new task to get started."}
                        </p>
                    </div>
                )}
            </div>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
