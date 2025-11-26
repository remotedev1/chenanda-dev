import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardSkeleton({ withMedia = true }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>

      {withMedia && (
        <div className="px-6">
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      )}

      <CardContent className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-16 rounded-xl" />
        </div>
        <Skeleton className="h-5 w-20" />
      </CardFooter>
    </Card>
  );
}
