'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import type { Task, Subtask } from '@/types';


const tasksCollectionRef = collection(db, 'tasks');

// Helper to convert Firestore Timestamps to JSON-serializable format
const docToTask = (doc: any): Task => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        subtasks: data.subtasks || [],
        userId: data.userId,
        // Convert timestamp to ISO string for serialization
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    };
};

export async function getTasks(userId: string): Promise<Task[]> {
  const q = query(
      tasksCollectionRef, 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToTask);
}

export async function addTask(taskData: { title: string; description?: string; subtasks?: { text: string }[], userId: string }): Promise<Task> {
    const newSubtasks: Subtask[] = (taskData.subtasks || [])
      .filter(sub => sub.text.trim() !== '')
      .map((sub, index) => ({
        id: `new-${Date.now()}-${index}`,
        text: sub.text,
        completed: false,
      }));

    const docRef = await addDoc(tasksCollectionRef, {
        title: taskData.title,
        description: taskData.description || "",
        status: "pending",
        subtasks: newSubtasks,
        createdAt: serverTimestamp(),
        userId: taskData.userId,
    });
    
    return {
        id: docRef.id,
        title: taskData.title,
        description: taskData.description || "",
        status: "pending",
        subtasks: newSubtasks,
        createdAt: new Date().toISOString(), // approximate for immediate state update
        userId: taskData.userId,
    };
}


export async function updateTask(taskId: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    // We don't need to pass userId here since we're updating an existing doc
    // and userId should not be changed.
    // For security, a real app would use Firestore rules to ensure a user can only update their own tasks.
    await updateDoc(taskRef, data);
}

export async function deleteTask(taskId: string): Promise<void> {
  // For security, a real app would use Firestore rules to ensure a user can only delete their own tasks.
  await deleteDoc(doc(db, 'tasks', taskId));
}
