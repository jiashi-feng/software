import { Task } from '../types/Task';

const initialTasks: Task[] = [
  { id: '1', title: '洗碗', completed: false, dueDate: new Date(), priority: 'medium' },
  { id: '2', title: '扫地', completed: false, dueDate: new Date(), priority: 'high' },
  { id: '3', title: '倒垃圾', completed: false, dueDate: new Date(), priority: 'low' },
];

let tasks = [...initialTasks];

export const TaskService = {
  getAllTasks: (): Task[] => {
    return tasks;
  },
  
  getPendingTasks: (): Task[] => {
    return tasks.filter(task => !task.completed);
  },
  
  getCompletedTasks: (): Task[] => {
    return tasks.filter(task => task.completed);
  },
  
  addTask: (title: string, dueDate?: Date, priority: 'low' | 'medium' | 'high' = 'medium'): Task => {
    const newTask: Task = {
      id: (tasks.length + 1).toString(),
      title,
      completed: false,
      dueDate,
      priority,
    };
    
    tasks.push(newTask);
    return newTask;
  },
  
  updateTaskStatus: (id: string, completed: boolean): Task | null => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }
    
    const updatedTask = { ...tasks[taskIndex], completed };
    tasks[taskIndex] = updatedTask;
    
    return updatedTask;
  },
  
  deleteTask: (id: string): boolean => {
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    
    return tasks.length < initialLength;
  },
  
  resetTasks: (): void => {
    tasks = [...initialTasks];
  },
};

export default TaskService;