"use client";
import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";
export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);
  return (
    <div
      id="leaderboard"
      className="p-5 px-10 md:px-44 fade-in hidden-scrollbar"
    >
      <div className="flex flex-col gap-3">
        <div className="text-3xl font-bold">Leaderboard</div>
        <div className="text-s">模型分數越高代表根據統計回答越令人滿意</div>
        <div></div>
      </div>
      <table className="table-auto w-full rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-600 font-bold">
            <th className="px-6 py-3">Rank</th>
            <th className="px-6 py-3">Model</th>
            <th className="px-6 py-3">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map(
            (model: { modelName: string; eloRating: number }, index) => (
              <tr
                key={model.modelName}
                className="border-b border-gray-200 hover:bg-gray-700"
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{model.modelName}</td>
                <td className="px-6 py-4">{model.eloRating.toFixed(2)}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
