
# Firebase Studio Task Tracker

This is a NextJS starter app for a task tracker, built in Firebase Studio. It uses Firestore for the database.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deploying to Vercel

You can easily deploy this application to Vercel.

1.  **Push to a Git Repository**: Push your code to a repository on GitHub, GitLab, or Bitbucket.
2.  **Import Project on Vercel**: Go to your Vercel dashboard and import the Git repository. Vercel will automatically detect that it's a Next.js project.
3.  **Configure Environment Variables**: In the Vercel project settings, navigate to "Environment Variables" and add the following variables. You can find these values in your Firebase project's settings.

    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_FIREBASE_APP_ID`

4.  **Deploy**: Click the "Deploy" button. Vercel will build and deploy your application.
