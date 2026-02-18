---
marp: true
theme: default
---
# Goal Getters

---
# A ToDo app
### For all of your task tracking needs
---
# Features and Requirements
---
## Task Completion Status
- Each task has completed Status
- Users can toggle completion
- Completed tasks appear visually different
- Status is saved and persistent
---
## Categories
- Each task has a category - Completed
- Users can pick categories - Completed
- Users can change categories - Completed
- Categories are visually different - Completed
---
## Due Date Alerts
- Overdue Tasks are highlighted
- Due Soon Tasks are highlighted
- These statuses update based on conditions
---
## Sort & Filter Tasks
- Users can sort tasks by:
- Due date (Soonest to Latest, Latest or Soonest)
- Priority (High to Low, Low to High)
---
- Users can filter tasks by:
- Category (e.g., School only)
- Priority (e.g., High only)
- Status (Completed or Incomplete) and Overdue
- Sort and filter can be combined (e.g., Category = Work and Sort by due date).
- Users can clear all filters.
---
## TASK CRUD
- The system shall integrate with a database to allow users to create, edit, and delete posts. - In Progress
- The frontend shall provide input forms that allow users to submit and update post data. - Completed
- Changes made to posts shall be reflected in real time or upon refresh. - In Progress
---
## Implementation of List View
- The system shall display all existing posts in a list view. - In Progress
- Each list item shall show key post information (e.g., title, date, or status). - In Progress
- Users shall be able to select a post from the list to view, edit, or delete it. - Completed
---
## Repeating Tasks
- The system shall allow users to create tasks that repeat on a defined schedule (e.g., daily, weekly, monthly).
- Users shall be able to select the recurrence pattern when creating or editing a task.
- The system shall automatically generate future task instances based on the selected recurrence pattern.
- Users shall be able to modify or cancel a repeating task without affecting unrelated tasks.
- The system shall store recurrence rules in the database to ensure persistence across sessions.
---
## Improved Navigation

- The application shall provide intuitive navigation between  major views (list view, detail view, calendar view). -In Progress
- All views must be functionally routed using the frontend routing system. - In Progress
- Navigation actions shall not cause unnecessary page reloads.
---
## Calendar View for Tasks
- The system shall be able to fetch tasks in bulk from the database.
- Tasks shall be displayed on a calendar based on their associated dates.
- The frontend calendar view shall be visually organized and easy to interpret.
- Users shall be able to select a task from the calendar to view task details.
---
## Defining the database schema
Requirements:
- list, tasks, description and tags must be stored as variables that take values from user input - Completed
- these values must be stored in a database - Completed
- database must update these values when any of these items are added, changed or deleted - Completed
---
## Sign In/Up/Out
Requirements:
- User authentication: user creates a username and password that will be authenticated on login - In Progress
- Password Hashing: passwords are encrypted within the database - In Progress
- UI Elements: The UI changes depending on whether the user is signed in - In Progress
---
## Search bar
Requirements:
- search bar element that takes user input
- search filtering option that allows user to search within a certain tag
- option to Clear Search that clears the search bar and resets the search results
---
# Data Model and Architecture

---
# Tests

---
# Team Members and Roles
---
- Dillon Carpenter: Team Leader
- David-Michael Davies: Team Member
- Nabou Diouf: Team Member
- Sam Stoeckel: Team Member
---
# Links to documentation, code, and so on
