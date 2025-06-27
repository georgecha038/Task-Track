"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { suggestSubtasks } from "@/ai/flows/suggest-subtasks";
import { Terminal, Wand2 } from "lucide-react";

interface AiSubtaskDialogProps {
  taskDescription: string;
  onAddSubtasks: (subtasks: string[]) => void;
}

export function AiSubtaskDialog({ taskDescription, onAddSubtasks }: AiSubtaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleFetchSuggestions = async () => {
    if (!taskDescription) {
      setError("Please add a description to the main task to get AI suggestions.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedSubtasks({});

    try {
      const result = await suggestSubtasks({ taskDescription });
      if (result.subtasks && result.subtasks.length > 0) {
        setSuggestions(result.subtasks);
      } else {
        setError("The AI couldn't find any subtasks. Try refining your task description.");
      }
    } catch (e) {
      setError("An error occurred while fetching suggestions. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (subtask: string, checked: boolean) => {
    setSelectedSubtasks((prev) => ({
      ...prev,
      [subtask]: checked,
    }));
  };

  const handleAddSelected = () => {
    const toAdd = Object.entries(selectedSubtasks)
      .filter(([, isSelected]) => isSelected)
      .map(([subtask]) => subtask);
    
    if (toAdd.length > 0) {
      onAddSubtasks(toAdd);
    }
    setOpen(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      handleFetchSuggestions();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wand2 className="mr-2 h-4 w-4" />
          Suggest Subtasks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI-Suggested Subtasks</DialogTitle>
          <DialogDescription>
            Based on your task, here are some suggested subtasks. Select the ones you want to add.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-[90%]" />
              <Skeleton className="h-8 w-[95%]" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && suggestions.length > 0 && (
            <ScrollArea className="h-64">
              <div className="space-y-4 pr-4">
                {suggestions.map((subtask, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subtask-${index}`}
                      checked={selectedSubtasks[subtask] || false}
                      onCheckedChange={(checked) => handleCheckboxChange(subtask, !!checked)}
                    />
                    <Label htmlFor={`subtask-${index}`} className="font-normal cursor-pointer">
                      {subtask}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddSelected} disabled={isLoading || Object.values(selectedSubtasks).every(v => !v)}>
            Add Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
