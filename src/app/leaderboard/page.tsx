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
    <div className="container mx-auto">
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
            (model: { modelName: string; score: number }, index) => (
              <tr
                key={model.modelName}
                className="border-b border-gray-200 hover:bg-gray-700"
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{model.modelName}</td>
                <td className="px-6 py-4">{model.score}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
