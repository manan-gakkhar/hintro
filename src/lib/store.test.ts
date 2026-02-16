
import { useBoardStore } from './store'
import { act } from '@testing-library/react'

// Mock localStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => store[key] = value.toString(),
        removeItem: (key: string) => delete store[key],
        clear: () => store = {}
    }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Crypto mock
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random()
    }
})

describe('Board Store', () => {
    beforeEach(() => {
        act(() => {
            useBoardStore.setState({
                tasks: [],
                actions: [],
                searchQuery: '',
                priorityFilter: 'All'
            })
        })
    })

    it('should add a task', () => {
        const { addTask } = useBoardStore.getState()
        act(() => {
            addTask({
                title: 'New Task',
                description: 'Desc',
                priority: 'High'
            })
        })
        const state = useBoardStore.getState()
        expect(state.tasks.length).toBe(1)
        expect(state.tasks[0].title).toBe('New Task')
        expect(state.tasks[0].status).toBe('TODO')
        // Check action log
        expect(state.actions.length).toBe(1)
        expect(state.actions[0].type).toBe('CREATE')
    })

    it('should move a task', () => {
        const { addTask, moveTask } = useBoardStore.getState()
        act(() => {
            addTask({ title: 'Task 1', priority: 'Low' })
        })
        const taskId = useBoardStore.getState().tasks[0].id

        act(() => {
            moveTask(taskId, 'DOING')
        })

        const state = useBoardStore.getState()
        expect(state.tasks[0].status).toBe('DOING')
        expect(state.actions[0].type).toBe('MOVE')
    })

    it('should delete a task', () => {
        const { addTask, deleteTask } = useBoardStore.getState()
        act(() => {
            addTask({ title: 'Task to Delete', priority: 'Low' })
        })
        const taskId = useBoardStore.getState().tasks[0].id

        act(() => {
            deleteTask(taskId)
        })

        const state = useBoardStore.getState()
        expect(state.tasks.length).toBe(0)
        expect(state.actions[0].type).toBe('DELETE')
    })
})
