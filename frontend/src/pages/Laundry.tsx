import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laundryAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

type Role = 'office_boy' | 'driver' | 'laundry_coordinator' | 'laundry_officer' | 'laundry_crew';

const Laundry: React.FC = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<Role>('office_boy');
  const [weightInput, setWeightInput] = useState<{ [key: string]: string }>({});

  const { data: laundryResponse, isLoading } = useQuery({
    queryKey: ['laundry'],
    queryFn: laundryAPI.getAll
  });

  const laundryItems = laundryResponse?.data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, extraData }: { id: string; status: string; extraData?: any }) => 
      laundryAPI.updateStatus(id, status, extraData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => laundryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry'] });
    }
  });

  const updateStatus = (id: string, newStatus: string, extraData: any = {}) => {
    updateStatusMutation.mutate({ id, status: newStatus, extraData });
  };

  const handleWeightChange = (id: string, value: string) => {
    setWeightInput(prev => ({ ...prev, [id]: value }));
  };

  const renderActions = (item: any) => {
    switch (role) {
      case 'office_boy':
        if (item.status === 'IN_TRANSIT_CLEAN') return <Button size="sm" onClick={() => updateStatus(item.id, 'DELIVERED_ROOM')} disabled={updateStatusMutation.isPending}>Deliver to Room</Button>;
        if (item.status === 'DELIVERED_ROOM') return <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'COMPLETED')} disabled={updateStatusMutation.isPending}>Mark Completed</Button>;
        if (item.status === 'REJECTED') return <Button size="sm" variant="destructive" onClick={() => updateStatus(item.id, 'COMPLETED')} disabled={updateStatusMutation.isPending}>Return Rejected to Room</Button>;
        break;
      case 'driver':
        if (item.status === 'COLLECTED_DIRTY') return <Button size="sm" onClick={() => updateStatus(item.id, 'IN_TRANSIT_DIRTY')} disabled={updateStatusMutation.isPending}>Deliver to Laundry House</Button>;
        if (item.status === 'CHECKED_CLEAN') return <Button size="sm" onClick={() => updateStatus(item.id, 'IN_TRANSIT_CLEAN')} disabled={updateStatusMutation.isPending}>Deliver to Mess Drop Point</Button>;
        break;
      case 'laundry_officer':
        if (item.status === 'IN_TRANSIT_DIRTY') return <Button size="sm" onClick={() => updateStatus(item.id, 'RECEIVED_AT_LAUNDRY')} disabled={updateStatusMutation.isPending}>Receive Bag</Button>;
        if (item.status === 'RECEIVED_AT_LAUNDRY') {
          return (
            <div className="flex gap-2 items-center">
              <Input 
                type="number" 
                placeholder="Weight (kg)" 
                className="w-24 h-8"
                value={weightInput[item.id] || ''}
                onChange={(e) => handleWeightChange(item.id, e.target.value)}
              />
              <Button size="sm" onClick={() => {
                if (weightInput[item.id]) updateStatus(item.id, 'WEIGHED', { weight: parseFloat(weightInput[item.id]) });
              }} disabled={updateStatusMutation.isPending || !weightInput[item.id]}>Accept & Weigh</Button>
              <Button size="sm" variant="destructive" onClick={() => updateStatus(item.id, 'REJECTED')} disabled={updateStatusMutation.isPending}>Reject</Button>
            </div>
          );
        }
        if (item.status === 'PACKING') return <Button size="sm" onClick={() => updateStatus(item.id, 'CHECKED_CLEAN')} disabled={updateStatusMutation.isPending}>Check Clean Bag</Button>;
        break;
      case 'laundry_coordinator':
        if (item.status === 'REJECTED') return <span className="text-red-500 font-medium">Handle Rejected</span>;
        break;
      case 'laundry_crew':
        if (item.status === 'WEIGHED') return <Button size="sm" onClick={() => updateStatus(item.id, 'WASHING')} disabled={updateStatusMutation.isPending}>Start Washing</Button>;
        if (item.status === 'WASHING') return <Button size="sm" onClick={() => updateStatus(item.id, 'IRONING')} disabled={updateStatusMutation.isPending}>Start Ironing</Button>;
        if (item.status === 'IRONING') return <Button size="sm" onClick={() => updateStatus(item.id, 'PACKING')} disabled={updateStatusMutation.isPending}>Start Packing</Button>;
        break;
    }
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-gray-500 mt-1">Role-based Laundry Tracking</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <span className="font-semibold text-gray-700">Simulate Role:</span>
          <div className="flex gap-2 flex-wrap">
            {(['office_boy', 'driver', 'laundry_coordinator', 'laundry_officer', 'laundry_crew'] as Role[]).map(r => (
              <Button 
                key={r} 
                variant={role === r ? 'default' : 'outline'}
                onClick={() => setRole(r)}
                className="capitalize"
              >
                {r.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg uppercase">{role.replace('_', ' ')} Action Board</CardTitle>
          {role === 'office_boy' && (
            <Button size="sm" onClick={() => {
              const newId = Date.now().toString().slice(-4);
              createMutation.mutate({
                roomNo: `NEW.${newId}`,
                guestName: 'NEW GUEST'
              });
            }} disabled={createMutation.isPending}>Collect New Dirty Laundry</Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading data from database...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bag ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action Needed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laundryItems.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.laundryBagId}</TableCell>
                    <TableCell>{l.guestName}</TableCell>
                    <TableCell>{parseFloat(l.weight) > 0 ? `${l.weight} kg` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={l.status === 'COMPLETED' ? 'default' : l.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {l.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderActions(l)}</TableCell>
                  </TableRow>
                ))}
                {laundryItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">No laundry items in database</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default Laundry;
