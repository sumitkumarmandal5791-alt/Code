import React, { useState } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/profile/ProfileCard";
import StreakCards from "../components/profile/StreakCards";
import RankCard from "../components/profile/RankCard";
import SolvedGauge from "../components/profile/SolvedGauge";
import ActivityCard from "../components/profile/ActivityCard";
import CourseProgress from "../components/profile/CourseProgress";
import useProfile from "../hooks/useProfile";
import useActivity from "../hooks/useActivity";

export function ProfilePage() {
  const { username } = useParams();
  const {
    profile,
    isOwnProfile,
    stats,
    ranking,
    courses,
    loading: profileLoading,
    error: profileError,
    updateProfile,
  } = useProfile(username);

  // Activity hook providing real-time streak summary and heatmap sync
  const { summary: activitySummary, loading: activityLoading } = useActivity();
  const [liveSummary, setLiveSummary] = useState(null);

  const effectiveSummary = liveSummary || activitySummary;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Top Heading for Accessibility */}
        <h1 className="sr-only">Developer Profile &amp; Activity Dashboard</h1>

        {/* Two-Column Responsive Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ═══════════════ LEFT COLUMN (~370px) ═══════════════ */}
          <aside
            aria-label="User Profile and Stats"
            className="w-full lg:w-[370px] space-y-4 flex-shrink-0"
          >
            {/* 1. Profile Details Card */}
            <ProfileCard
              profile={profile}
              isOwnProfile={isOwnProfile}
              onUpdateProfile={updateProfile}
            />

            {/* 2. Side-by-Side Streak Cards */}
            <StreakCards
              summary={effectiveSummary}
              loading={activityLoading || profileLoading}
            />

            {/* 3. Global Rank & Distribution Card */}
            <RankCard
              ranking={{
                ...ranking,
                totalSolved: stats.totalSolved,
              }}
              loading={profileLoading}
            />

            {/* 4. Solved Problems by Difficulty + Circular Donut Gauge */}
            <SolvedGauge stats={stats} loading={profileLoading} />
          </aside>

          {/* ═══════════════ RIGHT COLUMN (Flexible Width) ═══════════════ */}
          <section
            aria-label="Activity and Learning Progress"
            className="flex-1 min-w-0 w-full space-y-6"
          >
            {/* 1. Activity & Live Contribution Heatmap */}
            <ActivityCard
              onSummaryChange={setLiveSummary}
            />

            {/* 2. "Your Progress" Section: Curated Courses & Roadmaps */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
              <CourseProgress
                courses={courses}
                loading={profileLoading}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;

