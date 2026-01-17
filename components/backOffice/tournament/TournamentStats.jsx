import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, PlayCircle, CheckCircle } from "lucide-react";
import { formatNumber } from "@/utils/tournament.utils";

export function TournamentStats({ tournament }) {
  if (!tournament) return null;

  const stats = [
    {
      title: "Total Teams",
      value: tournament._count?.participation || 0,
      icon: Users,
      description: "Registered families",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Total Matches",
      value: tournament._count?.matches || 0,
      icon: Trophy,
      description: "Scheduled games",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Ongoing",
      value: tournament.matches?.filter((m) => m.status === "ONGOING").length || 0,
      icon: PlayCircle,
      description: "Live matches",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Completed",
      value: tournament.matches?.filter((m) => m.status === "COMPLETED").length || 0,
      icon: CheckCircle,
      description: "Finished games",
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stat.value)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}   