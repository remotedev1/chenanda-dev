"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Search,
  Calendar,
  Trophy,
  Users,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useToastContext } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";

const statusColors = {
  DRAFT: "bg-gray-500",
  REGISTRATION: "bg-blue-500",
  UPCOMING: "bg-yellow-500",
  ONGOING: "bg-green-500",
  COMPLETED: "bg-purple-500",
  CANCELLED: "bg-red-500",
};

export function TournamentList({ onEdit, onDelete, onView }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToastContext();
  const router = useRouter();

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(yearFilter !== "all" && { year: yearFilter }),
      });

      const response = await fetch(`/api/tournaments?${params}`);
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setTournaments(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tournaments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [page, statusFilter, yearFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchTournaments();
  };

  // const handleDelete = async (id) => {
  //   if (!confirm("Are you sure you want to delete this tournament?")) return;

  //   try {
  //     const response = await fetch(`/api/tournaments/${id}`, {
  //       method: "DELETE",
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       toast({
  //         title: "Success",
  //         description: data.message,
  //       });
  //       fetchTournaments();
  //       onDelete?.(id);
  //     } else {
  //       throw new Error(data.error);
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete tournament",
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <Card className="shadow-xl rounded-2xl bg-blue-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tournaments</CardTitle>
            <CardDescription>Manage and view all tournaments</CardDescription>
          </div>
          <Button asChild className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href="/dashboard/game/tournaments-list/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Search tournaments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="REGISTRATION">Registration</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading tournaments...
          </div>
        ) : tournaments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No tournaments found
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Sports</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Stats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell className="font-medium">
                        {tournament.name}
                      </TableCell>
                      <TableCell>{tournament.year}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tournament.sports.slice(0, 2).map((sport) => (
                            <Badge key={sport} variant="outline">
                              {sport.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {tournament.sports.length > 2 && (
                            <Badge variant="outline">
                              +{tournament.sports.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(tournament.startDate),
                            "MMM d"
                          )} -{" "}
                          {format(new Date(tournament.endDate), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[tournament.status]}>
                          {tournament.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {tournament._count.participation}
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {tournament._count.matches}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onView?.(tournament.id) ||
                                router.push(
                                  `/game/tournaments-list/${tournament.id}/view`
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onEdit?.(tournament) ||
                                router.push(
                                  `/dashboard/game/tournaments-list/${tournament.id}`
                                )
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {/* <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(tournament.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
