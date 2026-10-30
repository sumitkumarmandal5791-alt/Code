import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import profileService from "../services/profileService";

export const useProfile = (username = null) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    solvedProblems: [],
    counts: {
      easy: { solved: 0, total: 843 },
      medium: { solved: 0, total: 1762 },
      hard: { solved: 0, total: 768 },
    },
    totalSolved: 0,
    totalProblems: 3373,
  });
  const [ranking, setRanking] = useState({
    percentile: "Top 99.9%",
    totalSolved: 0,
    distribution: [],
    explanation: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if viewing own profile
  const isOwnProfile = !username || (authUser && (
    username === authUser.username ||
    username === (authUser.emailId?.split("@")[0]) ||
    username === authUser._id
  ));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, statsData] = await Promise.all([
        profileService.getProfile(username),
        profileService.getSolvedStats(),
      ]);

      setProfile(profileData);
      setStats(statsData);

      const rankData = profileService.calculateRanking(statsData.totalSolved);
      setRanking(rankData);

      const coursesData = profileService.getCoursesProgress(statsData.totalSolved);
      setCourses(coursesData);
    } catch (err) {
      console.error("[useProfile] Load error:", err);
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProfile = async (formData) => {
    const previousProfile = { ...profile };
    // Optimistic update
    setProfile((prev) => ({
      ...prev,
      ...formData,
    }));

    try {
      const result = await profileService.updateProfile(formData);
      setProfile((prev) => ({
        ...prev,
        ...result,
      }));
      toast.success("Profile updated successfully!");
      return { success: true, data: result };
    } catch (err) {
      // Revert optimistic update
      setProfile(previousProfile);
      toast.error(err.message || "Failed to update profile");
      throw err;
    }
  };

  return {
    profile: profile || {
      firstName: authUser?.firstName || "Developer",
      username: authUser?.emailId ? authUser.emailId.split("@")[0] : "coder",
      email: authUser?.emailId || "developer@codebits.dev",
      role: authUser?.role || "user",
      avatar: "",
      bio: "Mastering algorithms and building scalable systems.",
      visibility: "public",
      createdAt: authUser?.createdAt || new Date().toISOString(),
    },
    isOwnProfile,
    stats,
    ranking,
    courses,
    loading,
    error,
    refetch: loadData,
    updateProfile,
  };
};

export default useProfile;

