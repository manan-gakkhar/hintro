
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GripVertical, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Task } from '@/lib/store'
import { cn } from '@/lib/utils'

interface TaskCardProps {
    task: Task
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { task } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const priorityColor = {
        Low: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
        High: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    }

    return (
        <div ref={setNodeRef} style={style} className="touch-none mb-3">
            <Card className="group relative hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-0 space-y-0">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className={cn("mb-2", priorityColor[task.priority])}>
                            {task.priority}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 cursor-grab active:cursor-grabbing text-muted-foreground"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical size={14} />
                        </Button>
                    </div>
                    <CardTitle className="text-sm font-medium leading-none">
                        {task.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                    {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {task.description}
                        </p>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <CalendarIcon size={12} className="mr-1" />
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-3 pt-0 flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
                        <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}>
                        <Trash2 size={14} />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
