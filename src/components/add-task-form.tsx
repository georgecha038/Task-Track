"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100),
  description: z.string().max(500).optional(),
  subtasks: z.array(z.object({
    text: z.string().min(1, { message: "Subtask cannot be empty." })
  })).optional(),
});

type AddTaskFormValues = z.infer<typeof formSchema>;

interface AddTaskFormProps {
  onAddTask: (data: AddTaskFormValues) => Promise<void>;
  onFinished: () => void;
}

export function AddTaskForm({ onAddTask, onFinished }: AddTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subtasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  async function onSubmit(data: AddTaskFormValues) {
    setIsSubmitting(true);
    await onAddTask(data);
    form.reset();
    setIsSubmitting(false);
    onFinished();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Design a new homepage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about the task..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <Label>Subtasks</Label>
          <div className="space-y-4 max-h-40 overflow-y-auto pr-2">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`subtasks.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                        <FormControl>
                            <Input placeholder={`Subtask ${index + 1}`} {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="flex-shrink-0">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove subtask</span>
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ text: "" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subtask
          </Button>
        </div>

        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
        </div>
      </form>
    </Form>
  );
}
