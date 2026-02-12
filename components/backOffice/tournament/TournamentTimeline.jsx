import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flag, Users, Trophy } from "lucide-react";
import { formatDate, calculateProgress,cn } from "@/utils/tournament.utils";

export function TournamentTimeline({ tournament }) {
  if (!tournament) return null;

  const progress = calculateProgress(tournament);
  const now = new Date();
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  const regDeadline = tournament.registrationDeadline
    ? new Date(tournament.registrationDeadline)
    : null;

  const milestones = [
    {
      label: "Registration Deadline",
      date: regDeadline,
      icon: Users,
      status: regDeadline && now > regDeadline ? "completed" : "upcoming",
      show: !!regDeadline,
    },
    {
      label: "Tournament Start",
      date: startDate,
      icon: Flag,
      status: now > startDate ? "completed" : "upcoming",
      show: true,
    },
    {
      label: "Tournament End",
      date: endDate,
      icon: Trophy,
      status: now > endDate ? "completed" : "upcoming",
      show: true,
    },
  ].filter((m) => m.show);

  return (
    <Card className="bg-slate-50 dark:bg-slate-800 text-blue-400 ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 ">
          <Calendar className="h-5 w-5" />
          Tournament Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black dark:text-blue-600">Progress</span>
            {/* <span className="font-medium text-black dark:text-blue-600">{progress}%</span> */}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-4 pb-4",
                index !== milestones.length - 1 && "border-b"
              )}
            >
              <div
                className={cn(
                  "rounded-full p-2 mt-0.5",
                  milestone.status === "completed"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <milestone.icon
                  className={cn(
                    "h-4 w-4",
                    milestone.status === "completed"
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400"
                  )}
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-black dark:text-blue-600">{milestone.label}</p>
                  <Badge
                    variant={
                      milestone.status === "completed" ? "default" : "secondary"
                    }
                    className={cn(
                      milestone.status === "completed" &&
                        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    )}
                  >
                    {milestone.status === "completed" ? "Completed" : "Upcoming"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(milestone.date)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Duration Info */}
        <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
          <span className="text-black dark:text-blue-600">Duration</span>
          <span className="font-medium text-black dark:text-blue-600">
            {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
          </span>
        </div>
      </CardContent>
    </Card>
  );
}