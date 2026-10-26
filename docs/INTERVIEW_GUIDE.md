# SkillSync — Interview Demo Guide

Use this as a straightforward walkthrough when presenting SkillSync to an interviewer.

## 1. What is SkillSync?

SkillSync is a peer-to-peer learning platform. Instead of paying for every lesson, students find other students who can teach a skill they know while learning something they want to improve. A request formalizes the proposed exchange, and messages help the two students coordinate.

## 2. How to prepare a good live demo

1. Create two accounts using two email addresses you can open and confirm.
2. Sign in as Student A. Open **My profile**, add your name, college, a short introduction, skills you can teach (for example, HTML and CSS), and skills you want to learn (for example, React and Figma). Click **Save profile**.
3. Sign out and sign in as Student B. Fill in a complementary profile—for example, teach React and learn HTML/CSS. Save the profile.
4. As Student B, open **Discover students**, find Student A, click **Propose an exchange**, choose the skill pair, write a brief note, and click **Send request**.
5. Open **Skill exchanges** as Student A. Under **Incoming**, click **Accept**.
6. Open **Messages** from either account and send a note. Switch to the other account and refresh/reopen the conversation to see the message.
7. Once the exchange is finished, open the request and click **Mark complete**. The exchange status changes to Completed.

This produces real database records and demonstrates the full loop without relying on fake profiles.

## 3. What each page and button does

### Discover students
- **Search:** filters member profiles by name, headline, college, bio, or skill.
- **Category chips:** filter by Development, Design, Data & AI, and Communication.
- **Saved only:** shows profiles you bookmarked.
- **Bookmark icon:** saves or removes a member from your saved list; the choice persists in the database.
- **Propose an exchange:** opens a form to choose the skill you will teach, the skill you want to learn, and a personal message. Sending it creates a pending request.

### My profile
- **Full name, headline, college, bio:** describe the student.
- **Skills I can teach:** comma-separated skills the student is willing to share.
- **Skills I want to learn:** comma-separated goals.
- **Profile preview:** previews the values currently in the form.
- **Save profile:** writes the changes to the database and makes the profile visible to signed-in members.

### Skill exchanges
- **Incoming:** requests sent to the current account.
- **Sent by me:** requests initiated by the current account.
- **All requests:** both directions.
- **Accept:** accepts a pending incoming request and unlocks messaging.
- **Decline:** rejects a pending incoming request.
- **Cancel request:** withdraws a pending outgoing request.
- **Open messages:** opens the conversation for an accepted or completed exchange.
- **Mark complete:** marks an accepted exchange finished. The conversation remains readable but becomes read-only.

### Messages
- **Conversation list:** selects an accepted exchange.
- **Message box + Send:** sends a message to the other participant and stores it.
- **Refresh icon:** fetches the newest messages from the database.
- Completed exchanges are read-only. There are no built-in video calls or calendar bookings.

### Account controls
- **Create account:** registers an account with email and password. Confirm the email if Supabase asks you to.
- **Sign in:** authenticates an existing account.
- **Forgot password?:** sends a reset link to the email address, if an account is associated with it.
- **Sign out:** ends the current authenticated session.

## 4. How the data is protected

The app uses Supabase Auth for accounts and PostgreSQL for data. Row Level Security policies restrict profile editing to the profile owner, bookmarks to the person who saved them, requests to the two request participants, and messages to participants of an accepted or completed exchange. The browser uses only a public publishable key; no service-role key is shipped to the client.

## 5. Simple architecture explanation

- **React + TypeScript:** renders pages, forms, cards, and navigation.
- **Vite:** builds the frontend bundle for deployment.
- **Supabase Auth:** manages account creation, sign-in, sessions, and password reset.
- **Supabase Postgres:** persists student profiles, exchange requests, saved profiles, and messages.
- **Row Level Security:** enforces access rules at the database rather than relying only on hidden UI controls.
- **Vercel:** hosts the production website and redeploys updates from the GitHub repository.

## 6. What to say about the scope

The implemented flow covers member accounts, editable profiles, search and category filters, persistent bookmarks, exchange request creation and decisions, messaging after acceptance, and completion status. It is intentionally simple to explain.

It does not currently provide live video calling, calendar scheduling, document uploads, ratings, or real-time message push. The message thread has a Refresh control to load new messages. Avoid claiming those unimplemented features during the interview.
