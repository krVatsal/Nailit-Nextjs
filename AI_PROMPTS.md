AI prompts used while building Sprint Board Lite

1) High-level planning / feature breakdown

"You are an expert Next.js engineer. Build a Sprint Board Lite with a single project and three columns (Todo, In Progress, Done). Requirements: mocked auth (localStorage token), mock API supporting GET/POST/PATCH/DELETE with 10% failure simulation for mutating endpoints, optimistic updates with rollback, drag and drop between columns, create task modal with priority, client-side search + filter, mobile first responsive UI, skeletons, dark mode persisted. Variant: Undo Move show a 5s toast after moving that reverts the move if clicked and PATCHes the server back. Use Next app router and client components where appropriate.

2) Implementing optimistic updates and undo behavior

"How to implement optimistic updates for moving a task with PATCH /api/tasks/:id and a 5s undo? Include timer handling, reverting local state, and sending a PATCH to revert on undo also handle server failures by rolling back and notifying the user."

3) Fixing hydration mismatch

"When React warns about hydration mismatch for the root html attributes, fix the hydration error in the codebase by checking if any mismatch in tags" 

These prompts were used iteratively to plan, implement, and debug features.
