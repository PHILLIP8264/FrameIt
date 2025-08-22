import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FirestoreService } from "../../services";

interface XpLevelProps {
  xp: number;
  userId: string;
  style?: any;
}

function calculateLevel(xp: number) {
  const baseXP = 500;
  let level = 1;
  let xpRequired = baseXP;
  while (xp >= xpRequired) {
    level++;
    xpRequired += baseXP * Math.pow(1.3, level - 1);
  }
  return level;
}

function getLevelProgress(xp: number) {
  const baseXP = 500;
  let level = 1;
  let xpRequired = baseXP;
  let prevLevelXP = 0;
  while (xp >= xpRequired) {
    level++;
    prevLevelXP = xpRequired;
    xpRequired += baseXP * Math.pow(1.3, level - 1);
  }
  const progress = ((xp - prevLevelXP) / (xpRequired - prevLevelXP)) * 100;
  return {
    level,
    progressPercentage: Math.max(0, Math.min(100, progress)),
    remainingXP: Math.max(0, Math.round(xpRequired - xp)),
    nextLevel: level + 1,
  };
}

const XpLevel: React.FC<XpLevelProps> = ({ xp: initialXp, userId, style }) => {
  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState({
    level: 1,
    progressPercentage: 0,
    remainingXP: 0,
    nextLevel: 2,
  });

  useEffect(() => {
    const fetchUserXp = async () => {
      if (userId) {
        try {
          const userData = await FirestoreService.getUser(userId);
          if (userData && userData.xp !== undefined) {
            setXp(userData.xp);
          }
        } catch (error) {
          console.error("Error fetching user XP:", error);
        }
      }
    };

    fetchUserXp();
    const newLevel = calculateLevel(xp);
    setLevel(newLevel);
    setProgress(getLevelProgress(xp));
    // Update level in database if changed
    FirestoreService.getUser(userId).then((user) => {
      if (user && user.level !== newLevel) {
        FirestoreService.setUser(userId, { ...user, level: newLevel });
      }
    });
  }, [xp, userId]);

  return (
    <View style={[styles.xpSection, style]}>
      <View style={styles.xpHeader}>
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress.progressPercentage}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {progress.remainingXP.toLocaleString()} XP to Level {progress.nextLevel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  xpSection: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  xpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  xpText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  progressBar: {
    height: 14,
    backgroundColor: "#eee",
    borderRadius: 7,
    overflow: "hidden",
    marginVertical: 8,
  },
  progressFill: {
    height: 14,
    backgroundColor: "#007AFF",
    borderRadius: 7,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
});

export default XpLevel;
