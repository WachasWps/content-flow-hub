
# Content Calendar & Workflow Management — MVP Plan

## Overview
A collaborative content operations platform for a small team to plan, produce, and track social media content across Instagram, YouTube, LinkedIn, and Twitter. Built with Supabase for authentication, database, and file storage.

---

## Phase 1: Foundation & Authentication

### User Authentication
- Email/password sign-up and login
- User profiles with name and avatar
- Role system: **Admin**, **Content Strategist**, **Editor**, **Social Media Manager**
- Admin can invite team members and assign roles

### Database Setup
- Posts table (title, caption, tags, notes, script, status, publish date/time, platform, reference link, assigned editor, assigned SM manager)
- User roles table with proper RLS policies
- Comments table for post feedback
- File storage bucket for images and videos

---

## Phase 2: Calendar View (Main Dashboard)

### Calendar Interface
- **Monthly view** as the default landing page showing post cards on each date
- **Weekly view** for a more detailed breakdown
- **Daily view** for focused planning
- Toggle between views easily

### Post Cards on Calendar
- Color-coded by status: 💡 Idea (blue), ✏️ Editing (yellow), ✅ Ready (green), 📤 Posted (gray)
- Platform icon badge (Instagram, YouTube, LinkedIn, Twitter)
- Thumbnail preview if image is attached
- **Drag-and-drop** to reschedule posts between dates

### Post Detail Modal
When clicking a post card, a modal opens with:
- Title, caption, and rich text script/content field
- Image/video upload with preview
- Reference link input
- Tags input (hashtag-style)
- Notes field
- Platform selector
- Status selector (Idea → In Editing → Edited → Scheduled → Posted)
- Assigned editor & SM manager dropdowns
- Publish date & time picker
- Comments section for team feedback

---

## Phase 3: Production Board (Kanban View)

### Kanban Columns
- **Ideas** → **In Editing** → **Under Review** → **Ready to Post** → **Posted**

### Card Features
- Drag-and-drop between columns (updates status automatically)
- Shows assignee, due date, platform, and thumbnail
- Progress indicator
- Quick-access to full post detail modal

---

## Phase 4: Roles & Permissions

- **Admin**: Full access to everything, can manage team members
- **Content Strategist**: Create and edit all posts
- **Editor**: Can only see and edit posts assigned to them
- **Social Media Manager**: Can update status to Scheduled/Posted, view all posts

Row-level security enforced at the database level.

---

## Phase 5: Notifications & Workflow

### In-App Notifications
- Bell icon with notification dropdown
- Triggered when:
  - A post is assigned to you
  - Status changes on your assigned posts
  - A comment is added to your post
  - A post's publish date is approaching

### Workflow Automation
- When an editor uploads a final file, status auto-suggests moving to "Under Review"
- Archive completed/posted content

---

## Phase 6: Shareable Links (Post-MVP Enhancement)

- Generate view-only shareable links for the calendar or individual posts
- Optional password protection
- Client view mode with no editing capabilities

---

## Design Direction
- Clean, minimalistic SaaS aesthetic with soft shadows and rounded cards
- Light and dark mode toggle
- Calendar-first layout — calendar is the hero of the dashboard
- Smooth modal animations and transitions
- Desktop-first, responsive for tablet/mobile
