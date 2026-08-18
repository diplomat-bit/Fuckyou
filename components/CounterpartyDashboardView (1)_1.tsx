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

// Mock API call to fetch counterparties
const fetchCounterparties = async (params: ListCounterpartiesParams): Promise<ListCounterpartiesResponse> => {
  console.log('Fetching counterparties:', params);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data generation based on filters
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

  // Simulate pagination by returning a subset of data and a next cursor
  const startIndex = params.after_cursor ? parseInt(params.after_cursor.split('_')[1] || '0') : 0;
  const endIndex = Math.min(startIndex + (params.per_page || 10), mockData.length);
  const paginatedData = mockData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    next_cursor: endIndex < mockData.length ? `cursor_${endIndex}` : null,
  };
};

// Mock API call to delete a counterparty
const deleteCounterparty = async (id: string): Promise<void> => {
    console.log(`Deleting counterparty: ${id}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, you would make a DELETE request to your API here
};

export function CounterpartyDashboardView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for filtering
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  
  // State for pagination
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]); // Stores cursors for each page
  const [currentPage, setCurrentPage] = useState(0);

  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCounterparty, setSelectedCounterparty] = useState<Counterparty | null>(null);

  const per_page = 15; // Number of items per page

  // Fetch counterparties using react-query
  const { data, isLoading, isError, error, isFetching } = useQuery<ListCounterpartiesResponse, Error>({
    queryKey: ['counterparties', { cursor, nameFilter, emailFilter, per_page }],
    queryFn: () => fetchCounterparties({ after_cursor: cursor, name: nameFilter, email: emailFilter, per_page }),
    keepPreviousData: true, // Keep previous data while fetching new data
  });

  // Mutation for deleting a counterparty
  const deleteMutation = useMutation({
    mutationFn: deleteCounterparty,
    onSuccess: () => {
        // Invalidate the query to refetch the list of counterparties
        queryClient.invalidateQueries({ queryKey: ['counterparties'] });
        // Close the dialog and reset selected counterparty
        setIsDeleteDialogOpen(false);
        setSelectedCounterparty(null);
    },
    onError: (err) => {
        console.error("Failed to delete counterparty:", err);
        // Handle error, e.g., show a toast notification
    }
  });
  
  // Handler for navigating to the next page
  const handleNextPage = () => {
    if (data?.next_cursor) {
      // Store the current cursor before moving to the next page
      const newCursors = [...pageCursors.slice(0, currentPage + 1), data.next_cursor];
      setPageCursors(newCursors);
      setCursor(data.next_cursor);
      setCurrentPage(currentPage + 1);
    }
  };

  // Handler for navigating to the previous page
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      // Retrieve the cursor for the previous page
      setCursor(pageCursors[prevPage]);
      setCurrentPage(prevPage);
    }
  };
  
  // Helper function to format date strings
  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
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
        {/* Button to navigate to the new counterparty form */}
        <Button onClick={() => navigate('/counterparties/new')} className="bg-indigo-600 hover:bg-indigo-500">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Counterparty
        </Button>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Counterparties</CardTitle>
          {/* Filter inputs */}
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
                {/* Display loading state */}
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
                ) : isError ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-red-500">Error: {error.message}</TableCell></TableRow>
                ) : data?.data.length === 0 ? (
                  // Display message if no counterparties found
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">No counterparties found.</TableCell></TableRow>
                ) : (
                  // Map through counterparties and render table rows
                  data?.data.map((counterparty) => (
                    <TableRow key={counterparty.id} className="border-gray-700 hover:bg-gray-800/30">
                      <TableCell className="font-medium text-white">{counterparty.name || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">{counterparty.email || 'N/A'}</TableCell>
                      <TableCell className="text-gray-400">{formatDateTime(counterparty.created_at)}</TableCell>
                      <TableCell className="text-gray-400">{counterparty.send_remittance_advice ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        {/* Dropdown menu for actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-white">
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800" onSelect={() => navigate(`/counterparties/${counterparty.id}`)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800" onSelect={() => navigate(`/counterparties/${counterparty.id}/edit`)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-gray-800 text-red-400"
                              onSelect={() => {
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
        {/* Pagination controls */}
        <CardFooter className="flex items-center justify-between border-t border-gray-700 pt-6">
            <div className="text-sm text-gray-500 font-mono">Page {currentPage + 1}</div>
            <div className="space-x-2">
                <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 0 || isFetching} className="border-gray-700 text-gray-300">Previous</Button>
                <Button variant="outline" onClick={handleNextPage} disabled={!data?.next_cursor || isFetching} className="border-gray-700 text-gray-300">Next</Button>
            </div>
        </CardFooter>
      </Card>

      {/* Delete confirmation dialog */}
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
                    onClick={() => selectedCounterparty && deleteMutation.mutate(selectedCounterparty.id)}
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