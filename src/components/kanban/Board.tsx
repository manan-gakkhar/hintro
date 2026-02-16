
'use client'

import { useState, useMemo, useEffect } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core'
import { Task, useBoardStore, Status, Priority } from '@/lib/store'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, RotateCcw, Calendar as CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner' // Use sonner as toast replacement
import { Badge } from '@/components/ui/badge'

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: { opacity: '0.5' },
        },
    }),
};

export function Board() {
    const { tasks, searchQuery, priorityFilter, dateFilter, sortOption,
        setSearchQuery, setPriorityFilter, setDateFilter, setSortOption,
        addTask, updateTask, deleteTask, moveTask, resetBoard
    } = useBoardStore()

    // Hydration fix
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const [activeId, setActiveId] = useState<string | null>(null)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // Form State
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDesc, setNewTaskDesc] = useState('')
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium')
    const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    // Filtering & Sorting
    const filteredTasks = useMemo(() => {
        let result = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))

        if (priorityFilter !== 'All') {
            result = result.filter(t => t.priority === priorityFilter)
        }

        if (dateFilter) {
            result = result.filter(t => {
                if (!t.dueDate) return false
                const taskDate = new Date(t.dueDate)
                // Compare YYYY-MM-DD
                return taskDate.getFullYear() === dateFilter.getFullYear() &&
                    taskDate.getMonth() === dateFilter.getMonth() &&
                    taskDate.getDate() === dateFilter.getDate()
            })
        }

        if (sortOption === 'dueDate') {
            const sorted = [...result].sort((a, b) => {
                const getTime = (dateStr?: string) => {
                    if (!dateStr) return Number.MAX_SAFE_INTEGER
                    const time = new Date(dateStr).getTime()
                    return isNaN(time) ? Number.MAX_SAFE_INTEGER : time
                }
                return getTime(a.dueDate) - getTime(b.dueDate)
            })
            result = sorted
        }

        return result
    }, [tasks, searchQuery, priorityFilter, dateFilter, sortOption])



    const columns = useMemo(() => {
        return {
            TODO: filteredTasks.filter(t => t.status === 'TODO'),
            DOING: filteredTasks.filter(t => t.status === 'DOING'),
            DONE: filteredTasks.filter(t => t.status === 'DONE'),
        }
    }, [filteredTasks])

    // Drag Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Find the task
        const task = tasks.find(t => t.id === activeId)
        if (!task) return

        // If over a column
        if (overId === 'TODO' || overId === 'DOING' || overId === 'DONE') {
            if (task.status !== overId) {
                moveTask(activeId, overId as Status)
                toast.info(`Moved to ${overId}`)
            }
        } else {
            // Over another task?
            const overTask = tasks.find(t => t.id === overId)
            if (overTask && overTask.status !== task.status) {
                moveTask(activeId, overTask.status)
                toast.info(`Moved to ${overTask.status}`)
            }
            // Reordering within same column context is handled by sort strategy but we need to update state if we supported exact index ordering.
            // For now, we only support status change.
        }
    }

    const handleCreateTask = () => {
        if (!newTaskTitle.trim()) {
            toast.error('Title is required')
            return
        }
        addTask({
            title: newTaskTitle,
            description: newTaskDesc,
            priority: newTaskPriority,
            dueDate: newTaskDueDate?.toISOString(),
        })
        setIsTaskModalOpen(false)
        resetForm()
        toast.success('Task created')
    }

    const handleUpdateTask = () => {
        if (!editingTask || !newTaskTitle.trim()) return
        updateTask(editingTask.id, {
            title: newTaskTitle,
            description: newTaskDesc,
            priority: newTaskPriority,
            dueDate: newTaskDueDate?.toISOString(),
        })
        setIsTaskModalOpen(false)
        setEditingTask(null)
        resetForm()
        toast.success('Task updated')
    }

    const openEditModal = (task: Task) => {
        setEditingTask(task)
        setNewTaskTitle(task.title)
        setNewTaskDesc(task.description || '')
        setNewTaskPriority(task.priority)
        setNewTaskDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
        setIsTaskModalOpen(true)
    }

    const resetForm = () => {
        setNewTaskTitle('')
        setNewTaskDesc('')
        setNewTaskPriority('Medium')
        setNewTaskDueDate(undefined)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure?')) {
            deleteTask(id)
            toast.success('Task deleted')
        }
    }

    if (!mounted) return null

    return (
        <div className="h-full flex flex-col p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
                    <p className="text-muted-foreground">Manage your tasks and projects with ease.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | 'All')}>
                        <SelectTrigger className="w-[130px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Priorities</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={dateFilter ? "secondary" : "outline"}
                                className={cn(
                                    "w-[150px] justify-start text-left font-normal",
                                    !dateFilter && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFilter ? format(dateFilter, "PPP") : <span>Filter Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFilter}
                                onSelect={setDateFilter}
                                initialFocus
                            />
                            {dateFilter && (
                                <div className="p-2 border-t border-border">
                                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateFilter(undefined)}>
                                        Clear Filter
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    <Button variant="destructive" size="icon" onClick={() => { if (confirm('Reset entire board?')) resetBoard() }}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Dialog open={isTaskModalOpen} onOpenChange={(open) => { setIsTaskModalOpen(open); if (!open) { setEditingTask(null); resetForm(); } }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task title..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea id="desc" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Details..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Priority</Label>
                                        <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Priority)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Due Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !newTaskDueDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {newTaskDueDate ? format(newTaskDueDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={newTaskDueDate}
                                                    onSelect={setNewTaskDueDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}>{editingTask ? 'Save Changes' : 'Create'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Board Columns */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-6 h-full min-w-[1000px]">
                        <Column id="TODO" title="To Do" tasks={columns.TODO} onEditTask={openEditModal} onDeleteTask={handleDelete} />
                        <Column id="DOING" title="In Progress" tasks={columns.DOING} onEditTask={openEditModal} onDeleteTask={handleDelete} />
                        <Column id="DONE" title="Done" tasks={columns.DONE} onEditTask={openEditModal} onDeleteTask={handleDelete} />
                    </div>
                </div>
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <TaskCard task={tasks.find(t => t.id === activeId)!} onEdit={() => { }} onDelete={() => { }} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div >
    )
}
