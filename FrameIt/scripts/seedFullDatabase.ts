import { db } from "../config/firebase";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";

const seedFullDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    const batch = writeBatch(db);

    // Seed Users Collection
    console.log("👥 Seeding users...");
    const users = [
      {
        id: "user1",
        userId: "user1",
        displayName: "John Doe",
        email: "john@example.com",
        role: "basic",
        xp: 750,
        level: 2,
        signedUpDate: new Date("2024-01-15").toISOString(),
        streakCount: 5,
        profileImageUrl: "",
        tag: "amateur",
        group: "group1",
      },
      {
        id: "user2",
        userId: "user2",
        displayName: "Jane Smith",
        email: "jane@example.com",
        role: "management",
        xp: 1250,
        level: 3,
        signedUpDate: new Date("2024-02-01").toISOString(),
        streakCount: 12,
        profileImageUrl: "",
        tag: "advanced",
        group: "group1",
      },
      {
        id: "user3",
        userId: "user3",
        displayName: "Mike Johnson",
        email: "mike@example.com",
        role: "admin",
        xp: 2500,
        level: 5,
        signedUpDate: new Date("2023-12-01").toISOString(),
        streakCount: 25,
        profileImageUrl: "",
        tag: "seasoned",
        group: null,
      },
      {
        id: "user4",
        userId: "user4",
        displayName: "Sarah Wilson",
        email: "sarah@example.com",
        role: "basic",
        xp: 300,
        level: 1,
        signedUpDate: new Date("2024-07-15").toISOString(),
        streakCount: 2,
        profileImageUrl: "",
        tag: "beginner",
        group: "group2",
      },
    ];

    users.forEach((user) => {
      const userRef = doc(collection(db, "users"), user.id);
      batch.set(userRef, user);
    });

    // Seed Tags Collection
    console.log("🏷️ Seeding tags...");
    const tags = [
      {
        id: "beginner",
        name: "Beginner Adventure",
        description: "Awarded for starting your journey.",
      },
      {
        id: "amateur",
        name: "Amateur Adventure",
        description: "Awarded after completing 5 quests.",
      },
      {
        id: "advanced",
        name: "Advanced Adventure",
        description: "Awarded after completing 50 quests.",
      },
      {
        id: "seasoned",
        name: "Seasoned Adventure",
        description: "Awarded after completing 100 quests.",
      },
      {
        id: "pro",
        name: "Pro Adventure",
        description: "Awarded after completing 200 quests.",
      },
    ];

    tags.forEach((tag) => {
      const tagRef = doc(collection(db, "tags"), tag.id);
      batch.set(tagRef, tag);
    });

    // Seed Groups Collection
    console.log("👥 Seeding groups...");
    const groups = [
      {
        groupId: "group1",
        name: "Photography Enthusiasts",
        description:
          "A group for beginner photographers learning the art of capturing moments.",
        createdBy: "user2",
        members: ["user1", "user2"],
        createdAt: new Date("2024-01-20").toISOString(),
      },
      {
        groupId: "group2",
        name: "Urban Explorers",
        description: "Discover the hidden gems and stories of city life.",
        createdBy: "user2",
        members: ["user4"],
        createdAt: new Date("2024-07-01").toISOString(),
      },
      {
        groupId: "group3",
        name: "Nature Seekers",
        description: "Connect with nature and capture its beauty.",
        createdBy: "user3",
        members: [],
        createdAt: new Date("2024-03-15").toISOString(),
      },
    ];

    groups.forEach((group) => {
      const groupRef = doc(collection(db, "groups"), group.groupId);
      batch.set(groupRef, group);
    });

    // Seed Achievements Collection
    console.log("🏆 Seeding achievements...");
    const achievements = [
      {
        id: "first-quest",
        name: "First Quest",
        description: "Complete your first quest",
        type: "quest",
      },
      {
        id: "photographer",
        name: "Photographer",
        description: "Win 50 photo votes in any category",
        type: "vote",
      },
      {
        id: "streak-master",
        name: "Streak Master",
        description: "Maintain a 100-day streak",
        type: "streak",
      },
      {
        id: "explorer",
        name: "Explorer",
        description: "Complete 10 quests",
        type: "quest",
      },
      {
        id: "social-butterfly",
        name: "Social Butterfly",
        description: "Get 100 total votes on submissions",
        type: "vote",
      },
      {
        id: "dedicated-adventurer",
        name: "Dedicated Adventurer",
        description: "Maintain a 30-day streak",
        type: "streak",
      },
    ];

    achievements.forEach((achievement) => {
      const achievementRef = doc(
        collection(db, "achievements"),
        achievement.id
      );
      batch.set(achievementRef, achievement);
    });

    // Seed Quests Collection
    console.log("🎯 Seeding quests...");
    const quests = [
      {
        questId: "quest1",
        title: "Urban Explorer",
        description:
          "Capture the essence of city life in downtown. Look for interesting architecture, street art, or bustling crowds.",
        category: "urban",
        location: "Downtown",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        xpReward: 150,
        createdBy: "user3",
        status: "active",
      },
      {
        questId: "quest2",
        title: "Street Art Hunter",
        description:
          "Find and photograph unique street art, murals, or graffiti in the arts district.",
        category: "creative",
        location: "Arts District",
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        xpReward: 200,
        createdBy: "user3",
        status: "active",
      },
      {
        questId: "quest3",
        title: "Architecture Seeker",
        description:
          "Photograph impressive buildings and architectural details in the business district.",
        category: "buildings",
        location: "Business District",
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        xpReward: 300,
        createdBy: "user3",
        status: "active",
      },
      {
        questId: "quest4",
        title: "Nature's Beauty",
        description:
          "Capture the natural beauty of the riverside park. Focus on landscapes, wildlife, or water features.",
        category: "nature",
        location: "Riverside Park",
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        xpReward: 250,
        createdBy: "user2",
        status: "active",
      },
      {
        questId: "quest5",
        title: "Golden Hour Magic",
        description:
          "Photograph during the golden hour (sunrise or sunset) at any location of your choice.",
        category: "creative",
        location: "Any Location",
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        xpReward: 400,
        createdBy: "user3",
        status: "active",
      },
    ];

    quests.forEach((quest) => {
      const questRef = doc(collection(db, "quests"), quest.questId);
      batch.set(questRef, quest);
    });

    // Seed Submissions Collection
    console.log("📸 Seeding submissions...");
    const submissions = [
      {
        subId: "sub1",
        userId: "user1",
        subUrl: "https://example.com/photos/urban1.jpg",
        questId: "quest1",
        timestamp: new Date("2024-08-01").toISOString(),
        votes: 15,
      },
      {
        subId: "sub2",
        userId: "user2",
        subUrl: "https://example.com/photos/street-art1.jpg",
        questId: "quest2",
        timestamp: new Date("2024-08-02").toISOString(),
        votes: 23,
      },
      {
        subId: "sub3",
        userId: "user4",
        subUrl: "https://example.com/photos/architecture1.jpg",
        questId: "quest3",
        timestamp: new Date("2024-08-03").toISOString(),
        votes: 8,
      },
    ];

    submissions.forEach((submission) => {
      const submissionRef = doc(
        collection(db, "submissions"),
        submission.subId
      );
      batch.set(submissionRef, submission);
    });

    // Commit the batch
    console.log("💾 Committing batch write...");
    await batch.commit();

    // Seed individual completed quests for users (subcollections)
    console.log("✅ Seeding completed quests...");

    // User1 completed quests
    const user1CompletedQuests = [
      {
        questId: "quest1",
        completedAt: new Date("2024-08-01").toISOString(),
        xpEarned: 150,
      },
      {
        questId: "quest2",
        completedAt: new Date("2024-08-05").toISOString(),
        xpEarned: 200,
      },
    ];

    for (const quest of user1CompletedQuests) {
      const questRef = doc(
        collection(db, "users", "user1", "completedQuests"),
        quest.questId
      );
      await setDoc(questRef, quest);
    }

    // User2 completed quests
    const user2CompletedQuests = [
      {
        questId: "quest1",
        completedAt: new Date("2024-07-28").toISOString(),
        xpEarned: 150,
      },
      {
        questId: "quest2",
        completedAt: new Date("2024-08-02").toISOString(),
        xpEarned: 200,
      },
      {
        questId: "quest3",
        completedAt: new Date("2024-08-06").toISOString(),
        xpEarned: 300,
      },
    ];

    for (const quest of user2CompletedQuests) {
      const questRef = doc(
        collection(db, "users", "user2", "completedQuests"),
        quest.questId
      );
      await setDoc(questRef, quest);
    }

    // User3 completed quests (admin with many completed)
    const user3CompletedQuests = [
      {
        questId: "quest1",
        completedAt: new Date("2024-07-15").toISOString(),
        xpEarned: 150,
      },
      {
        questId: "quest2",
        completedAt: new Date("2024-07-20").toISOString(),
        xpEarned: 200,
      },
      {
        questId: "quest3",
        completedAt: new Date("2024-07-25").toISOString(),
        xpEarned: 300,
      },
      {
        questId: "quest4",
        completedAt: new Date("2024-07-30").toISOString(),
        xpEarned: 250,
      },
      {
        questId: "quest5",
        completedAt: new Date("2024-08-04").toISOString(),
        xpEarned: 400,
      },
    ];

    for (const quest of user3CompletedQuests) {
      const questRef = doc(
        collection(db, "users", "user3", "completedQuests"),
        quest.questId
      );
      await setDoc(questRef, quest);
    }

    // Seed some votes for submissions
    console.log("🗳️ Seeding votes...");

    // Votes for submission 1
    const sub1Votes = [
      {
        userId: "user2",
        timestamp: new Date("2024-08-01T14:30:00").toISOString(),
      },
      {
        userId: "user3",
        timestamp: new Date("2024-08-01T15:15:00").toISOString(),
      },
      {
        userId: "user4",
        timestamp: new Date("2024-08-02T09:20:00").toISOString(),
      },
    ];

    for (const vote of sub1Votes) {
      const voteRef = doc(
        collection(db, "submissions", "sub1", "votes"),
        vote.userId
      );
      await setDoc(voteRef, vote);
    }

    // Votes for submission 2
    const sub2Votes = [
      {
        userId: "user1",
        timestamp: new Date("2024-08-02T16:45:00").toISOString(),
      },
      {
        userId: "user3",
        timestamp: new Date("2024-08-02T17:30:00").toISOString(),
      },
      {
        userId: "user4",
        timestamp: new Date("2024-08-03T10:15:00").toISOString(),
      },
    ];

    for (const vote of sub2Votes) {
      const voteRef = doc(
        collection(db, "submissions", "sub2", "votes"),
        vote.userId
      );
      await setDoc(voteRef, vote);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
    📊 Seeded Data Summary:
    - 👥 Users: ${users.length}
    - 🏷️ Tags: ${tags.length}
    - 👥 Groups: ${groups.length}
    - 🏆 Achievements: ${achievements.length}
    - 🎯 Quests: ${quests.length}
    - 📸 Submissions: ${submissions.length}
    - ✅ Completed Quests: ${
      user1CompletedQuests.length +
      user2CompletedQuests.length +
      user3CompletedQuests.length
    }
    - 🗳️ Votes: ${sub1Votes.length + sub2Votes.length}
    `);
  } catch (error) {
    console.error("❌ Error seeding database: ", error);
  }
};

seedFullDatabase();
