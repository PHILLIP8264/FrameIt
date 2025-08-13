# Database Seeding Instructions

This folder contains scripts to seed your Firebase Firestore database with sample data for the FrameIt app.

## Files

- `seedDatabase.js` - Standalone Node.js script for seeding the database
- `seedFullDatabase.ts` - TypeScript version that can be integrated into your app

## Setup

1. **Configure Firebase**: Before running the seed script, you need to add your Firebase configuration to `seedDatabase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

2. **Install dependencies** (if not already installed):

```bash
npm install firebase
```

## Running the Seed Script

From the project root directory, run:

```bash
node scripts/seedDatabase.js
```

## What Gets Seeded

The script will populate your Firestore database with:

### Users (4 users)

- **user1**: John Doe (basic user, level 2, 750 XP)
- **user2**: Jane Smith (management user, level 3, 1250 XP)
- **user3**: Mike Johnson (admin user, level 5, 2500 XP)
- **user4**: Sarah Wilson (basic user, level 1, 300 XP)

### Tags (5 tags)

- Beginner Adventure
- Amateur Adventure
- Advanced Adventure
- Seasoned Adventure
- Pro Adventure

### Groups (3 groups)

- Photography Enthusiasts
- Urban Explorers
- Nature Seekers

### Achievements (6 achievements)

- First Quest
- Photographer
- Streak Master
- Explorer
- Social Butterfly
- Dedicated Adventurer

### Quests (5 active quests)

- Urban Explorer (Downtown, 150 XP)
- Street Art Hunter (Arts District, 200 XP)
- Architecture Seeker (Business District, 300 XP)
- Nature's Beauty (Riverside Park, 250 XP)
- Golden Hour Magic (Any Location, 400 XP)

### Submissions (3 submissions)

- Sample photo submissions from users for various quests

### Completed Quests

- User completion history stored in subcollections
- user1: 2 completed quests
- user2: 3 completed quests
- user3: 5 completed quests (admin with most experience)

### Votes

- Sample voting data for photo submissions

## Database Structure

The seeded data follows your database schema with these collections:

- `users/` - User profiles and data
- `users/{userId}/completedQuests/` - Subcollection of completed quests per user
- `tags/` - Achievement tags
- `groups/` - User groups
- `achievements/` - Available achievements
- `quests/` - Available quests
- `submissions/` - Photo submissions
- `submissions/{subId}/votes/` - Subcollection of votes per submission

## Security Note

Make sure to:

1. Never commit your Firebase config with real credentials to version control
2. Use environment variables for production configurations
3. Set proper Firestore security rules before going live

## Troubleshooting

If you get authentication errors:

1. Make sure your Firebase config is correct
2. Ensure your Firestore database exists and has the right permissions
3. Check that your project has Firestore enabled

The script will output detailed progress information and a summary of what was seeded when it completes successfully.
