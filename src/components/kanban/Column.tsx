
'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task } from '@/lib/store'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface ColumnProps {
    id: string
    title: string
    tasks: Task[]
    onEditTask: (task: Task) => void
    onDeleteTask: (taskId: string) => void
}

export function Column({ id, title, tasks, onEditTask, onDeleteTask }: ColumnProps) {
    const { setNodeRef } = useDroppable({
        id,
    })

    return (
        <div className="flex-1 flex flex-col bg-muted/20 rounded-lg border p-4 min-w-[300px] h-full">
            <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
                {title}
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-mono">
                    {tasks.length}
                </span>
            </h3>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 overflow-y-auto space-y-3 min-h-[200px] transition-colors",
                    "bg-background/50 rounded-md p-2 border border-transparent hover:border-border/50"
                )}
            >
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => onEditTask(task)}
                            onDelete={() => onDeleteTask(task.id)}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic py-10 border-2 border-dashed rounded-lg">
                            No tasks
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    )
}
