
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'


export type Priority = 'Low' | 'Medium' | 'High'
export type Status = 'TODO' | 'DOING' | 'DONE'

export interface Task {
    id: string
    title: string
    description?: string
    priority: Priority
    dueDate?: string // ISO format
    tags?: string[]
    status: Status
    createdAt: number
}

export interface Action {
    id: string
    type: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE'
    taskId?: string
    details: string
    timestamp: number
}

interface BoardState {
    tasks: Task[]
    actions: Action[]

    // Filters
    searchQuery: string
    priorityFilter: Priority | 'All'
    dateFilter: Date | undefined
    sortOption: 'dueDate' | 'none'

    setSearchQuery: (query: string) => void
    setPriorityFilter: (filter: Priority | 'All') => void
    setDateFilter: (date: Date | undefined) => void
    setSortOption: (option: 'dueDate' | 'none') => void

    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
    moveTask: (id: string, newStatus: Status) => void
    resetBoard: () => void
}

const initialTasks: Task[] = []
const initialActions: Action[] = []

export const useBoardStore = create<BoardState>()(
    persist(
        (set, get) => ({
            tasks: initialTasks,
            actions: initialActions,
            searchQuery: '',
            priorityFilter: 'All',
            dateFilter: undefined,
            sortOption: 'none',

            setSearchQuery: (query) => set({ searchQuery: query }),
            setPriorityFilter: (filter) => set({ priorityFilter: filter }),
            setDateFilter: (date) => set({ dateFilter: date }),
            setSortOption: (option) => set({ sortOption: option }),

            addTask: (taskData) => {
                const id = uuidv4()
                const newTask: Task = {
                    ...taskData,
                    id,
                    createdAt: Date.now(),
                    status: 'TODO'
                }
                set((state) => ({
                    tasks: [...state.tasks, newTask],
                    actions: [
                        {
                            id: uuidv4(),
                            type: 'CREATE',
                            taskId: id,
                            details: `Task "${newTask.title}" created`,
                            timestamp: Date.now()
                        } as Action,
                        ...state.actions
                    ].slice(0, 50) // Keep last 50 actions
                }))
            },

            updateTask: (id, updates) => {
                set((state) => {
                    const task = state.tasks.find((t) => t.id === id)
                    if (!task) return state

                    return {
                        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                        actions: [
                            {
                                id: uuidv4(),
                                type: updates.status && updates.status !== task.status ? 'MOVE' : 'UPDATE',
                                taskId: id,
                                details: updates.status && updates.status !== task.status
                                    ? `Task "${task.title}" moved to ${updates.status}`
                                    : `Task "${task.title}" updated`,
                                timestamp: Date.now()
                            } as Action,
                            ...state.actions
                        ].slice(0, 50)
                    }
                })
            },

            deleteTask: (id) => {
                set((state) => {
                    const task = state.tasks.find((t) => t.id === id)
                    return {
                        tasks: state.tasks.filter((t) => t.id !== id),
                        actions: [
                            {
                                id: uuidv4(),
                                type: 'DELETE',
                                details: `Task "${task?.title || 'Unknown'}" deleted`,
                                timestamp: Date.now()
                            } as Action,
                            ...state.actions
                        ].slice(0, 50)
                    }
                })
            },

            moveTask: (id, newStatus) => {
                get().updateTask(id, { status: newStatus })
            },

            resetBoard: () => {
                set({ tasks: [], actions: [] })
            }
        }),
        {
            name: 'board-storage',
            skipHydration: true, // Handle hydration carefully in Next.js
        }
    )
)
