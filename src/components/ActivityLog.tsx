
'use client'

import { useBoardStore } from '@/lib/store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

export function ActivityLog() {
    const actions = useBoardStore((state) => state.actions)

    if (actions.length === 0) {
        return <div className="p-4 text-center text-muted-foreground text-sm">No recent activity</div>
    }

    return (
        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
            <div className="space-y-6 p-1">
                {actions.map((action) => (
                    <div key={action.id} className="relative pl-4 border-l-2 border-muted hover:border-primary transition-colors pb-1">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium leading-none">{action.details}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(action.timestamp, { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
