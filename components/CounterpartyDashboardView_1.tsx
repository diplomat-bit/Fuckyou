import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/index';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

interface Counterparty {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  send_remittance_advice: boolean;
  accounts: any[];
  metadata: Record<string, string>;
}

interface ListCounterpartiesParams {
  after_cursor?: string | null;
  per_page?: number;
  name?: string;
  email?: string;
}

interface ListCounterpartiesResponse {
  data: Counterparty[];
  next_cursor: string | null;
}

const fetchCounterparties = async (params: ListCounterpartiesParams): Promise<ListCounterpartiesResponse> => {
  console.log('Fetching counterparties:', params);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockData: Counterparty[] = Array.from({ length: params.per_page || 10 }, (_, i) => ({
    id: `cp_${Math.random().toString(36).substr(2, 9)}`,
    object: 'counterparty',
    live_mode: false,
    created_at: new Date(Date.now() - (i + (params.after_cursor ? 10 : 0)) * 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    name: params.name ? `${params.name} #${i + 1}` : `Test Counterparty ${i + 1}`,
    email: params.email ? `user@${params.email}` : `test${i + 1}@example.com`,
    send_remittance_advice: i % 2 === 0,
    accounts: [],
    metadata: { user_id: `user_${i}` },
  }));

  return {
    data: mockData,
    next_cursor: `cursor_${Math.random().toString(36).substr(2, 9)}`,
  };
};

const deleteCounterparty = async (id: string): Promise<void> => {
    console.log(`Deleting counterparty: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
};

export function CounterpartyDashboardView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(0);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCounterparty, setSelectedCounterparty] = useState<Counterparty | null>(null);

  const per_page = 15;

  const { data, isLoading, isError, error, isFetching } = useQuery<ListCounterpartiesResponse, Error>({
    queryKey: ['counterparties', { cursor, nameFilter, emailFilter, per_page }],
    queryFn: () => fetchCounterparties({ after_cursor: cursor, name: nameFilter, email: emailFilter, per_page }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCounterparty,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['counterparties'] });
        setIsDeleteDialogOpen(false);
        setSelectedCounterparty(null);
    }
  });
  
  const handleNextPage = () => {
    if (data?.next_cursor) {
      const newCursors = [...pageCursors.slice(0, currentPage + 1), data.next_cursor];
      setPageCursors(newCursors);
      setCursor(data.next_cursor);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCursor(pageCursors[prevPage]);
      setCurrentPage(prevPage);
    }
  };
  
  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Counterparties</h1>
          <p className="text-gray-400">Search and manage all linked entities.</p>
        </div>
        <Button onClick={() => navigate('/counterparties/new')} className="bg-indigo-600 hover:bg-indigo-500">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Counterparty
        </Button>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Counterparties</CardTitle>
          <div className="flex items-center space-x-4 pt-4">
            <Input
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="max-w-sm bg-gray-900 border-gray-700 text-white"
            />
            <Input
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="max-w-sm bg-gray-900 border-gray-700 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Created At</TableHead>
                  <TableHead className="text-gray-400">Remittance Advice</TableHead>
                  <TableHead className="text-right text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">No counterparties found.</TableCell></TableRow>
                ) : (
                  data?.data.map((counterparty) => (
                    <TableRow key={counterparty.id} className="border-gray-700 hover:bg-gray-800/30">
                      <TableCell className="font-medium text-white">{counterparty.name || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">{counterparty.email || 'N/A'}</TableCell>
                      <TableCell className="text-gray-400">{formatDateTime(counterparty.created_at)}</TableCell>
                      <TableCell className="text-gray-400">{counterparty.send_remittance_advice ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-white">
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">View Details</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">Edit</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-gray-800 text-red-400"
                              onClick={() => {
                                setSelectedCounterparty(counterparty);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-gray-700 pt-6">
            <div className="text-sm text-gray-500 font-mono">Page {currentPage + 1}</div>
            <div className="space-x-2">
                <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 0 || isFetching} className="border-gray-700 text-gray-300">Previous</Button>
                <Button variant="outline" onClick={handleNextPage} disabled={!data?.next_cursor || isFetching} className="border-gray-700 text-gray-300">Next</Button>
            </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                    This action cannot be undone. This will permanently delete "{selectedCounterparty?.name}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => deleteMutation.mutate(selectedCounterparty!.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CounterpartyDashboardView;