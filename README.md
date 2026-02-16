# Hintro - Task Board

Hintro is a high-performance, interactive Kanban board application built for modern task management. It provides a seamless user experience for organizing projects, tracking progress, and maintaining a history of actions.

![Task Board Preview](public/next.svg) <!-- You can replace this with an actual screenshot if available -->

## 🚀 Key Features

- **Interactive Kanban Board**: Organize tasks into three distinct stages: `To Do`, `In Progress`, and `Done`.
- **Drag-and-Drop Workflow**: Effortlessly move tasks between columns using an intuitive drag-and-drop interface powered by `@dnd-kit`.
- **Full Task CRUD**: Create, view, edit, and delete tasks with ease.
- **Detailed Task Attributes**:
  - **Title & Description**: Detailed notes for every task.
  - **Priority Levels**: Categorize tasks as `Low`, `Medium`, or `High`.
  - **Due Dates**: Set deadlines using a polished calendar interface.
- **Advanced Filtering & Search**:
  - Instant search by title.
  - Filter by priority level.
  - Filter by specific due dates.
- **Activity Log**: A comprehensive side-panel history tracking every action (Create, Move, Update, Delete) for full accountability.
- **Local Persistence**: Integrated with `Zustand` persistence middleware to ensure your data stays saved in your browser.
- **Secure Authentication**: Simple login flow with persistent sessions.
- **Premium Design**: Built with a "wow" factor using Tailwind CSS 4, Shadcn/ui components, and Lucide icons.

## 🛠️ Tech Stack

- **Core**: [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (with persistence)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Date Utilities**: [Date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)

## 📥 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/manan-gakkhar/hintro.git
    cd hintro
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the application**:
    Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

## 📖 How It Works

### 1. Authentication
To access the board, you must log in. The login page simulates a real authentication flow and saves your session in your browser's local storage.

### 2. Managing Tasks
- **Create**: Click the "New Task" button in the header. Fill in the title, description, priority, and due date.
- **Move**: Click and hold a task card to drag it to a different column. Every move is recorded in the Activity Log.
- **Edit**: Click the edit icon on any task card to update its details.
- **Delete**: Click the delete icon to remove a task permanently.

### 3. Finding & Organizing
Use the search bar and filter dropdowns (Priority/Date) at the top of the board to find specific tasks. These filters update the board view in real-time.

### 4. Tracking History
Click the "Activity Log" button in the top right to open a sliding panel. This shows a chronological list of everything that has happened on your board during your session.
