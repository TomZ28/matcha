# Matcha

An AI-powered talent matching platform for recruiters and job seekers. Built with TypeScript, React, Next.js, and Supabase.

## Table of Contents

1. [Live Demo](#live-demo)
2. [Running the Server Locally](#running-the-server-locally)
3. [Technical Decisions](#technical-decisions)
4. [AI Usage](#ai-usage)

## Live Demo

This project is currently deployed on [https://matcha-gamma.vercel.app/](https://matcha-gamma.vercel.app/). If you'd like to try it out, visit the link and register an account.

**Important:** Since this is a demo, the project uses Supabase's built-in email service, which is limited to 2 emails per hour. If you don't receive the email (check your spam folder) within a few minutes of registering, you may need to try again with a different email - for demo purposes, try a temporary email service.

### Demo Video

[![Matcha Demo](https://img.youtube.com/vi/Y8xFLh67D4k/0.jpg)](https://www.youtube.com/watch?v=Y8xFLh67D4k)

## Running the Server Locally

First, install the required libraries:

```bash
npm install
```

Next, you'll need the database. Set up a [Supabase](https://supabase.com/) account and use the contents of the project file `database/supabase.sql`.

In addition, `.env.local` is also required. Use `.env.example` as a template and enter your personal variables.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technical Decisions

### Tech Stack

The full tech stack of the project:
- TypeScript
- React
- Next.js
- Supabase
- GitHub (Version Control)
- Vercel (Deployment)
- Google Gemini (Text Embeddings)

#### The Code

The bulk of the application is built using TypeScript with React and Next.js. These are popular frameworks with useful features/libraries that can be used to develop applications quickly, and both frontend & backend can be deployed in a single project. While most features are contained here, a portion of the backend (talent matching features) is contained in the database via vector operations.

#### Next.js

[Next.js](https://nextjs.org/) provides features such as server-side rendering and caching for website performance. This provides a faster browsing experience for users.

#### Supabase

I used [Supabase](https://supabase.com/) for its cloud-based database and user authentication features, which saves time and doesn't require a self-hosted database. For the text embeddings, the `vector` extension is used.

#### Gemini

As this is a demo, I decided to use [Gemini](https://ai.google.dev/gemini-api/docs/embeddings) since its text-embedding-004 service is completely free and performs relatively well. For a live production project, another option is [OpenAI](https://platform.openai.com/docs/guides/embeddings), which can also generate embeddings and performs well. Note that you would have to change the database table vector size to match the embedding output.

### Talent Matching with Embeddings

I chose to use embeddings (numerical representations of objects such as texts) as a talent-matching method since applicants are usually encouraged to "tailor their resume to the job description". This allows recruiters to find the best talents for the job, and talents to find the jobs that match them the most.

The method is fairly simple: convert user profiles and job descriptions to embeddings, then compute their distance (i.e. cosine distance). The lower the distance (between 0 and 1), the higher the match percentage. To achieve this, profiles or descriptions are first converted into a single string and are then passed into the embedding model. Next, the result is sent to the database for storage. To calculate and retrieve the match percentage, it is computed in the database via vector operations (rather than in the backend) for better performance before returning the result(s) to the user.

## AI Usage

I used [Cursor](https://www.cursor.com/) to help me with the design and development process. The agent I used was `Claude 3.7 Sonnet - Thinking Mode`. It especially helped with frontend development and creating the UIs. For the backend, I mostly built it myself (which was passed to Claude as context), although Claude was able to analyze and generate some backend code related to authentication and data fetching via Supabase.

### Context

As context, I told Claude that the application is a **Talent-Matching Platform**. I also mentioned concepts that apply to the entire application, such as the theme (modern) and design (Matcha = green colours).

### Frontend Development

For the frontend, I first created the structure of the project. In Next.js, this would be the names of the pages as folders. For the actual pages, I created a very rough skeleton of the page and links to other pages. Once this was done, I prompted Claude to create the pages one-by-one to ensure correctness.

### Backend Development

For the backend, Claude was able to create some Supabase authentication flows, which required little modifying (for additional options). It was also able to implement some data-related operations, given that I provided it with the database schema.

### General Prompt for Each Page/Feature

First, I provide context such as required pages/folders/components/backend for Cursor to understand. Then I provide variants of the following prompt:
```
We are focusing on building the [FEATURE] page. The user should be able to [DESCRIBE PAGE]. I want [FEATURE], [FEATURE], ..., and [FEATURE].

For the [FEATURE] feature, it should... and... I have provided [FILE] as a reference.
(Optional to include in prompt: You may create a function in [FILE] if needed...)
...(Repeat for each feature)

Build the page and additional components using the application's theme and consistent code/folder structure.
```
