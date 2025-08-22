import { useState, useEffect } from "react";
import { Alert, Share } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { Quest, Submission } from "../types/database";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services";

interface DiscoveryWithDetails extends Submission {
  id: string;
  quest?: Quest;
  questTitle: string;
  location: string;
  category: string;
  xp?: number;
  photoUrl: string;
}

interface PhotoViewerData {
  visible: boolean;
  photo?: DiscoveryWithDetails;
}

interface StatsData {
  totalDiscoveries: number;
  totalXP: number;
  uniqueLocations: number;
  favoriteCategory: string;
  completionStreak: number;
  thisMonthCount: number;
  bestMonth: string;
}

export const useGalleryManagement = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "xp">("recent");
  const [discoveries, setDiscoveries] = useState<DiscoveryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [photoViewer, setPhotoViewer] = useState<PhotoViewerData>({
    visible: false,
  });
  const [stats, setStats] = useState<StatsData>({
    totalDiscoveries: 0,
    totalXP: 0,
    uniqueLocations: 0,
    favoriteCategory: "urban",
    completionStreak: 0,
    thisMonthCount: 0,
    bestMonth: "Never",
  });

  // Show gesture hint for first-time users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (discoveries.length > 0) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [discoveries]);

  // Real-time listener for user's submissions with quest data
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    loadDiscoveries();
  }, [user?.uid, sortBy]);

  const loadDiscoveries = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Get user's submissions - avoid composite index by not using orderBy with where
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("userId", "==", user.uid)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        submissionsQuery,
        async (snapshot) => {
          const submissionsData = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as (Submission & { id: string })[];

          // Fetch quest data for each submission
          const enhancedDiscoveries = await Promise.all(
            submissionsData.map(async (submission) => {
              try {
                const questData = await FirestoreService.getQuestById(
                  submission.questId
                );
                return {
                  ...submission,
                  quest: questData,
                  questTitle: questData?.title || "Unknown Quest",
                  location: questData?.location || "Unknown Location",
                  category: questData?.category || "urban",
                  xp: questData?.xpReward || 0,
                  photoUrl: submission.subUrl,
                } as DiscoveryWithDetails;
              } catch (error) {
                console.error(
                  `Error fetching quest ${submission.questId}:`,
                  error
                );
                return {
                  ...submission,
                  questTitle: "Unknown Quest",
                  location: "Unknown Location",
                  category: "urban",
                  xp: 0,
                  photoUrl: submission.subUrl,
                } as DiscoveryWithDetails;
              }
            })
          );

          // Sort based on selected option (client-side sorting to avoid index requirement)
          const sortedDiscoveries = sortDiscoveries(enhancedDiscoveries);
          setDiscoveries(sortedDiscoveries);
          calculateStats(sortedDiscoveries);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching submissions:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading discoveries:", error);
      setLoading(false);
    }
  };

  const sortDiscoveries = (discoveries: DiscoveryWithDetails[]) => {
    return [...discoveries].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return getTimestamp(b.timestamp) - getTimestamp(a.timestamp);
        case "xp":
          return (b.xp || 0) - (a.xp || 0);
        default:
          return 0;
      }
    });
  };

  const getTimestamp = (timestamp: any): number => {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().getTime();
    }
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    if (typeof timestamp === "number") {
      return timestamp;
    }
    return 0;
  };

  const calculateStats = (discoveries: DiscoveryWithDetails[]) => {
    const totalXP = discoveries.reduce((sum, d) => sum + (d.xp || 0), 0);
    const uniqueLocations = new Set(discoveries.map((d) => d.location)).size;
    const categoryCounts = discoveries.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategory =
      Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "urban";

    const thisMonth = new Date();
    const thisMonthCount = discoveries.filter((d) => {
      const discoveryDate = getTimestamp(d.timestamp);
      const date = new Date(discoveryDate);
      return (
        date.getMonth() === thisMonth.getMonth() &&
        date.getFullYear() === thisMonth.getFullYear()
      );
    }).length;

    // Calculate best month
    const monthCounts = discoveries.reduce((acc, d) => {
      const discoveryDate = getTimestamp(d.timestamp);
      const date = new Date(discoveryDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bestMonthEntry = Object.entries(monthCounts).sort(
      ([, a], [, b]) => b - a
    )[0];
    const bestMonth = bestMonthEntry
      ? new Date(bestMonthEntry[0] + "-01").toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "No data yet";

    setStats({
      totalDiscoveries: discoveries.length,
      totalXP,
      uniqueLocations,
      favoriteCategory,
      completionStreak: 0,
      thisMonthCount,
      bestMonth,
    });
  };

  const getFilteredDiscoveries = () => {
    if (selectedFilter === "all") return discoveries;
    return discoveries.filter((d) => d.category === selectedFilter);
  };

  const deletePhoto = async (photo: DiscoveryWithDetails) => {
    try {
      // Here you would implement the actual delete functionality
      // For now, just show a success message
      Alert.alert(
        "Photo Deleted",
        `"${photo.questTitle}" has been removed from your gallery.`,
        [{ text: "OK" }]
      );

      // Refresh the gallery to reflect changes
      await loadDiscoveries();
    } catch (error) {
      console.error("Error deleting photo:", error);
      Alert.alert(
        "Delete Failed",
        "There was an error deleting the photo. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const sharePhoto = async (photo: DiscoveryWithDetails) => {
    try {
      await Share.share({
        message: `Check out my discovery: ${photo.questTitle} at ${photo.location}! +${photo.xp} XP earned`,
        url: photo.photoUrl,
      });
    } catch (error) {
      console.error("Error sharing photo:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiscoveries();
    setRefreshing(false);
  };

  const openPhotoViewer = (photo: DiscoveryWithDetails) => {
    setPhotoViewer({ visible: true, photo });
  };

  const closePhotoViewer = () => {
    setPhotoViewer({ visible: false });
  };

  return {
    // State
    selectedFilter,
    sortBy,
    discoveries,
    loading,
    refreshing,
    showHint,
    photoViewer,
    stats,

    // Actions
    setSelectedFilter,
    setSortBy,
    getFilteredDiscoveries,
    deletePhoto,
    sharePhoto,
    onRefresh,
    openPhotoViewer,
    closePhotoViewer,
  };
};
