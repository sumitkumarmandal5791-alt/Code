# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Create a modern competitive programming web platform UI similar to LeetCode.

Requirements:

1. Layout:
- Split-screen layout:
  - Left panel: Problem details
  - Right panel: Code editor and output
- Dark mode theme by default
- Responsive for desktop and tablet

2. Header/Navbar:
- Platform logo on the left
- Navigation items: Problems | Editorial | Solutions | Submissions
- Language selector dropdown (C++, Java, Python, JavaScript)
- Run ▶️ and Submit ☁️ buttons
- Timer display (HH:MM:SS)
- User profile avatar with dropdown
- Settings and premium badge icons

3. Problem Panel (Left Side):
- Problem title with difficulty badge (Easy / Medium / Hard)
- Tags (Array, Linked List, DP, Graph)
- Company tags section
- Problem description with formatted text
- Constraints section
- Example inputs/outputs with diagrams/images
- Like 👍, Dislike 👎, Bookmark ⭐ buttons
- Discussion count

4. Code Editor Panel (Right Side):
- Monaco Editor (VS Code style)
- Syntax highlighting
- Auto indentation and bracket matching
- Language-specific boilerplate code
- Line numbers
- Code reset and format buttons
- Keyboard shortcuts support

5. Execution & Output Section:
- Tabs: Testcase | Test Result | Console Output
- Custom input textbox
- Execution status (Accepted / Wrong Answer / TLE / MLE)
- Runtime and memory usage stats
- Error highlighting

6. Problem List Page:
- Search bar with debounce
- Filters: Difficulty, Tags, Status
- Pagination or infinite scroll
- Solved ✔️ indicator
- Company-specific filtering

7. Authentication:
- Login / Signup modal
- JWT-based authentication
- Protected routes
- User session persistence

8. Submission System:
- Code submission history
- Verdicts (AC, WA, TLE, MLE)
- Time & memory stats
- Re-submission feature

9. Backend Expectations:
- REST APIs for problems, submissions, users
- Code execution via jugde 0 ce backend
- Rate limiting (Redis)
- Secure JWT auth
- Role-based access (admin/user)

10. Tech Stack Preference:
- Frontend: React + Tailwind CSS + Redux
- Backend: Node.js + Express + MongoDB
- Code Runner: judge 0 ce execution
- State management using Redux Toolkit
- API security using JWT & Redis

11. UX Details:
- Smooth transitions
- Loading skeletons
- Toast notifications
- Keyboard-friendly UI
- Accessibility support (ARIA labels)

Output:
- Clean component-based architecture
- Reusable UI components
- Best practices followed
- Production-ready UI
