
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Board } from '@/components/kanban/Board'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LogOut, History } from 'lucide-react'

import { ActivityLog } from '@/components/ActivityLog'

export default function DashboardPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Basic route protection
    // Check localStorage
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/login')
    } else {
      setAuthorized(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    // localStorage.removeItem('rememberMe') // Optional
    router.push('/login')
  }

  // Prevent flash of content
  if (!authorized) {
    return null
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-6 shadow-sm">
        <div className="font-semibold text-lg flex items-center">
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded mr-2">BETA</span>
          Task Board
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm" className="hidden sm:flex">
                <History className="mr-2 h-4 w-4" />
                Activity Log
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-4">
                <SheetTitle>Activity Log</SheetTitle>
              </SheetHeader>
              <ActivityLog />
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden bg-muted/10">
        <Board />
      </main>
    </div>
  )
}
