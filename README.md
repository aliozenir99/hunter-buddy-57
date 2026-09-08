# Hunter's Hub

Build a Personal Hunter Assistant CRM

Create a modern personal web application called Hunter Assistant for a B2B Sales Hunter working at a hotel.

The application is NOT a full company CRM. It is a personal sales workspace designed specifically for a Hunter to track prospects, meetings, conversations, requests, follow-ups, opportunities, and handovers to Account Managers.

The main goal is to help the Hunter answer at any moment:

Who am I talking to?

What did we discuss?

What does this client need?

What did they ask for?

What did I promise to do?

What should I follow up on today?

Which opportunities are ready to be passed to an Account Manager?

Which clients have gone cold?

What happened during my meetings this week/month?

How much sales activity have I generated?

1. Main Dashboard

Create a clean sales dashboard showing today's priorities.

Top KPI cards:

Meetings Today

Meetings This Week

New Leads

Active Opportunities

Follow-ups Due Today

Overdue Follow-ups

Opportunities Ready for Handover

Leads Generated This Month

"Today" section

Show:

Today's meetings

Follow-ups due today

Overdue actions

Important client reminders

Upcoming meetings

Each item should be clickable.

"Quick Actions"

Large buttons:

New Client

New Lead

Log Call

Log Meeting

Add Request

Add Follow-up

Create Email

Create Opportunity

2. Client Database

Create a complete client profile.

Each client should contain:

Basic information

Company name

Industry

Company type

Website

Address

City

Country

Client status

Lead source

Priority

Potential value

Assigned Account Manager

Hunter owner

Contacts

For each contact:

Full name

Position

Phone

Email

Telegram / WhatsApp

Decision maker? Yes/No

Influencer? Yes/No

Notes

Allow multiple contacts per company.

3. Client 360° Profile

When opening a client, show everything related to that client in one place.

Tabs:

Overview

Show:

Company information

Main contacts

Current status

Priority

Potential

Last interaction

Next action

Assigned Account Manager

Timeline

Create a chronological activity timeline:

Calls

WhatsApp messages

Emails

Meetings

Visits

Requests

Follow-ups

Opportunities

Handover

Notes

Example:

28 Aug — Meeting with Nurlan
Discussed corporate accommodation and conference requirements.
Client is interested in a corporate agreement.
Next action: Send Corporate 4 proposal.

Meetings

List all meetings with:

Date

Location

Participants

Purpose

Discussion

Client needs

Objections

Requests

Promises made

Next steps

Requests

Show every request received from the client.

Each request should have:

Request title

Request type

Date

Details

Number of rooms

Event date

Number of guests

Meeting room requirements

F&B requirements

Budget

Deadline

Status

Responsible Account Manager

Opportunities

Show current opportunities.

Follow-ups

Show all pending and completed follow-ups.

4. Meeting Management

This is one of the most important parts of the application.

The Hunter should be able to quickly create a meeting.

Meeting fields:

Client

Contact

Date

Time

Location

Meeting type:

Office Visit

Client Visit

Hotel Visit

Online Meeting

Phone Call

Business Networking

Purpose

Preparation notes

After the meeting, provide a structured meeting report:

What was discussed?

Large text field.

Client needs

What does the client actually need?

Requests

What did the client ask us to provide?

Pain points

What problems are they experiencing?

Objections

What prevented them from moving forward?

Opportunities

What potential business was identified?

Competitors

Did they mention another hotel / supplier?

Decision maker

Who makes the final decision?

Budget

If known.

Timeline

When are they planning to make a decision?

Next steps

What needs to happen next?

Hunter's personal notes

Free text.

After saving the meeting, automatically create follow-up tasks based on the "Next Steps".

5. Smart Meeting Summary

After entering meeting notes, provide an AI assistant that can transform messy notes into structured information.

Example input:

"I met with Nurlan. They have around 30-40 corporate guests every month. They currently use Hyatt and Novotel. They are interested in corporate rates but want flexible cancellation. He asked me to send our corporate rates and arrange a hotel tour next week."

AI should extract:

Client Need

Corporate accommodation for approximately 30–40 guests/month.

Current Suppliers

Hyatt, Novotel.

Opportunity

Corporate agreement.

Requirements

Flexible cancellation policy.

Requested Action

Send corporate rates.

Next Meeting

Hotel tour next week.

Priority

High.

The Hunter must be able to edit the AI-generated information before saving.

6. Request Management

During a meeting, a client can suddenly say:

"We need 20 rooms from 12–15 September and a conference room for 50 people."

The Hunter should be able to click:

+ New Request

and quickly record:

Client

Contact

Request date

Stay dates

Number of rooms

Room type

Number of guests

Event date

Conference room

F&B

Special requirements

Budget

Deadline

Notes

Request statuses:

New

Information Needed

Sent to Account Manager

Proposal in Progress

Proposal Sent

Negotiation

Won

Lost

Cancelled

7. Email Assistant

Create an integrated Email Assistant.

The Hunter should be able to select a request and click:

Draft Email to Account Manager

The AI should automatically understand the request and create a professional internal email.

Example:

Subject:
New Request — ABC Company — 20 Rooms + Conference

Email:

Dear [Account Manager],

We received a new request from ABC Company.

Dates: 12–15 September
Rooms: 20
Guests: 20
Conference: 50 people

During the meeting, the client mentioned that they are also interested in coffee breaks.

Could you please review the request and prepare a suitable proposal?

Best regards,
Ali

Allow:

Copy

Edit

Regenerate

Make shorter

Make more formal

Translate to English

Translate to Russian

Translate to Turkish

8. Follow-up System

Every interaction should be able to create a follow-up.

Follow-up fields:

Client

Related meeting

Related opportunity

Task

Due date

Priority

Responsible person

Status

Notes

Statuses:

Pending

In Progress

Completed

Cancelled

The dashboard must clearly highlight overdue follow-ups.

Example:

🔴 Overdue — Call Nurlan regarding corporate rates
🟡 Today — Send proposal to ABC Travel
🟢 Completed — Meeting with KICB

9. Opportunity Management

Create an opportunity pipeline specifically for Hunter activity.

Stages:

Target Identified

Researched & Qualified

First Contact Made

Engaged / Meeting Booked

Visit / Meeting Held

Opportunity Qualified

DOSM Review

Assigned to Account Manager

Handover Completed

Each opportunity should contain:

Client

Contact

Opportunity name

Potential business

Estimated value

Probability

Expected decision date

Source

Current stage

Next action

Notes

Account Manager

Handover date

Important:

The application should clearly separate Hunter activity from the Account Manager sales cycle.

The Hunter's responsibility is primarily:

Target → Contact → Meeting → Identify Need → Qualify Opportunity → Handover.

10. Handover to Account Manager

When an opportunity becomes qualified, the Hunter should be able to click:

Prepare Handover

The application automatically generates a structured handover summary containing:

Client

Company and contact information.

Relationship

How the client was contacted and how many interactions happened.

Business Need

What the client needs.

Opportunity

Potential business.

Requirements

All specific requirements.

Budget

If known.

Decision Maker

Name and position.

Timeline

Expected decision date.

Competitors

If known.

Client Concerns

Objections / pain points.

Recommended Approach

What the Hunter believes the Account Manager should do.

Previous Communication

Important emails, meetings and requests.

Then:

Assign to Account Manager

11. Calendar

Create a calendar showing:

Meetings

Client visits

Hotel visits

Calls

Follow-ups

Deadlines

Views:

Day

Week

Month

Clicking an event should open the related client and meeting information.

12. Activity Tracker

Track Hunter productivity.

Metrics:

Calls made

Emails sent

Meetings booked

Meetings completed

Client visits

New accounts identified

New leads generated

Opportunities created

Qualified opportunities

Opportunities handed over

Follow-ups completed

Provide daily, weekly and monthly views.

13. Sales Funnel

Create a visual funnel:

Target Identified
↓
Qualified
↓
Contacted
↓
Meeting
↓
Opportunity
↓
Qualified Opportunity
↓
Handover

Show conversion rates between stages.

Example:

500 Targets
↓
180 Qualified
↓
100 Contacted
↓
40 Meetings
↓
22 Opportunities
↓
12 Qualified
↓
8 Handovers

14. Search

Global search should search across:

Companies

Contacts

Meetings

Requests

Opportunities

Notes

Follow-ups

Example:

Searching "Nurlan" should show every meeting, note, request, opportunity and follow-up related to Nurlan.

15. AI Personal Sales Assistant

Add an AI assistant accessible from anywhere in the application.

The AI should have access to the user's CRM data.

The user can ask:

"Who should I follow up with today?"

"Which clients have not been contacted for more than 14 days?"

"What did Nurlan ask for during our last meeting?"

"What opportunities came from my meetings this week?"

"Which clients are interested in corporate contracts?"

"Show me all unresolved requests."

"Prepare an email to the AM regarding the ABC request."

"Summarize my meetings this week."

"Which leads are going cold?"

"Which clients should I visit next week?"

The AI should answer based on actual application data, not generic assumptions.

16. Daily Briefing

When opening the application each morning, show:

Good morning, Ali 👋

Today's priorities

10:00 — Meeting with ABC Company

11:30 — Follow up with Nurlan

14:00 — Client visit — KICB

16:00 — Send request to Account Manager

Important follow-ups

Show overdue and high-priority items.

Pipeline

Show new opportunities and opportunities requiring action.

Suggested actions

The AI can suggest:

Clients to contact

Clients to revisit

Overdue follow-ups

Opportunities requiring attention

Leads becoming cold

17. Reports

Create simple personal reports.

Daily Report

Calls

Meetings

Visits

New leads

Opportunities

Requests

Follow-ups

Weekly Report

Total activities

New accounts

Meetings

Opportunities

Qualified opportunities

Handovers

Conversion rates

Monthly Report

Show trends and comparison with previous months.

Allow export to Excel / PDF.

18. Client Intelligence

The system should gradually build knowledge about every client.

For each client, show:

Relationship Strength

Cold / Warm / Active / Strong

Business Potential

Low / Medium / High

Engagement

Low / Medium / High

Last Contact

Date.

Next Action

Recommended next action.

Interests

Examples:

Corporate accommodation

Meetings

Conferences

Events

F&B

Long stay

Business travel

Important Notes

Persistent information about the client.

19. UI / UX

The interface should feel like a modern professional sales cockpit.

Design principles:

Clean

Fast

Minimal

Desktop-first

Mobile responsive

Very little unnecessary text

Strong visual hierarchy

One-click actions

Everything important accessible within 1–2 clicks

Use a sidebar navigation:

Dashboard
Clients
Contacts
Calendar
Activities
Requests
Opportunities
Follow-ups
Reports
AI Assistant
Settings

Use cards, tables, timelines, Kanban boards and charts where appropriate.

20. Technology

Build this as a real functional web application, not just a static prototype.

Preferred stack:

Frontend:
React + TypeScript

UI:
Tailwind CSS + shadcn/ui

Backend:
Supabase

Database:
PostgreSQL

Authentication:
Email/password

AI:
LLM API integration with structured outputs.

Calendar:
Internal application calendar initially.

Architecture should be modular so integrations with Google Calendar, Gmail, Outlook and WhatsApp can be added later.

21. Important Data Model

Create database tables for:

users

companies

contacts

activities

meetings

meeting_notes

requests

opportunities

follow_ups

tasks

email_drafts

handovers

account_managers

tags

All records should have:

created_at

updated_at

created_by

Use relationships between all entities.

For example:

Company
→ Contacts
→ Activities
→ Meetings
→ Requests
→ Opportunities
→ Follow-ups
→ Handover

22. Critical UX Requirement

The application must be optimized for speed during real sales work.

The Hunter may be sitting in a meeting and have only 30 seconds to record something.

Therefore:

Do NOT force the user to fill 20 fields.

Allow quick capture:

"Add Note"

Example:

"Client needs 15 rooms in October, interested in conference package, wants flexible cancellation."

The system should automatically suggest:

Request

Opportunity

Follow-up

Client need

Meeting note

The user confirms and saves.

23. Core Philosophy

This application should behave like a personal sales memory + productivity assistant, not just a database.

It should remember:

People

Companies

Conversations

Promises

Requests

Opportunities

Follow-ups

Business history

The goal is that the Hunter never has to think:

"What did we discuss with this client last time?"

The application should answer immediately.

Build the MVP with realistic demo data for a hotel B2B Hunter.

Prioritize these features first:

Dashboard

Client 360°

Meeting logging

Request management

Follow-ups

Opportunity pipeline

Email Assistant

AI Personal Assistant

Calendar

Activity tracking

Make the application fully functional with CRUD operations and realistic mock data before adding advanced integrations.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hunter-buddy-57.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/08f89edc-7a3b-4fe7-bd93-e99381659bb1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
