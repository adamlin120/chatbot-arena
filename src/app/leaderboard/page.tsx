import { getLeaderboard } from "./_components/action";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();
  if (!leaderboard)
    return (
      <div className="text-center h-[90%dvh] text-xl mt-10">
        目前排行榜出了點問題，請稍後再試。
      </div>
    );
  return (
    <div
      id="leaderboard"
      className="py-5 mx-5 md:mx-24 lg:mx-44 fade-in overflow-x-auto"
    >
      <div className="flex flex-col gap-3">
        <div className="text-3xl font-bold">Leaderboard</div>
        <div className="text-md">模型分數越高代表根據統計回答越令人滿意</div>
        <div></div>
      </div>
      <table className="table-auto w-full rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-600 font-bold">
            <th className="px-6 py-1">排名 Rank</th>
            <th className="px-6 py-3">語言模型 Model</th>
            <th className="px-6 py-3">目前分數 Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map(
            (model: { modelName: string; eloRating: number }, index) => (
              <tr
                key={model.modelName}
                className="border-b border-gray-200 hover:bg-gray-700"
              >
                <td className="px-6 py-1">{index + 1}</td>
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
