import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { contestStyles as styles } from "../../styles";

interface ContestTimerProps {
  contestStatus: string;
  isActive: boolean;
}

export default function ContestTimer({
  contestStatus,
  isActive,
}: ContestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();

      if (isActive) {
        // Calculate time until midnight (end of voting)
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight

        const timeUntilEnd = midnight.getTime() - now.getTime();
        const hours = Math.floor(timeUntilEnd / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60)
        );

        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else if (currentTime < 1800) {
        // Calculate time until 18:00 (start of voting)
        const today6PM = new Date(now);
        today6PM.setHours(18, 0, 0, 0);

        const timeUntilStart = today6PM.getTime() - now.getTime();
        const hours = Math.floor(timeUntilStart / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeUntilStart % (1000 * 60 * 60)) / (1000 * 60)
        );

        setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
      } else {
        setTimeRemaining("Voting ended");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <View
      style={[styles.timerContainer, isActive && styles.timerContainerActive]}
    >
      <View>
        <Text style={[styles.timerText, isActive && styles.timerTextActive]}>
          {contestStatus}
        </Text>
        {timeRemaining && (
          <Text
            style={[
              styles.timerText,
              isActive && styles.timerTextActive,
              { fontSize: 12, opacity: 0.8 },
            ]}
          >
            {timeRemaining}
          </Text>
        )}
      </View>
      <Ionicons
        name={isActive ? "time" : "time-outline"}
        size={20}
        color={isActive ? "#4CAF50" : "#007AFF"}
        style={styles.timerIcon}
      />
    </View>
  );
}
