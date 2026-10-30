import React from "react";
import ContributionGrid from "../ContributionGrid";

export function ActivityCard({ onSummaryChange = null, className = "" }) {
  return (
    <div className={`w-full ${className}`}>
      <ContributionGrid
        hideStreakWidget={true}
        showCustomHeader={true}
        onSummaryChange={onSummaryChange}
        footerNote="Streaks reset at midnight Asia/Kolkata (IST). Includes all first-time accepted submissions."
      />
    </div>
  );
}

export default ActivityCard;

