import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationAPI, roomAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, User, MapPin, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Reservations: React.FC = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'front_desk' | 'office_boy'>('front_desk');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestCategory, setGuestCategory] = useState('REGULAR GUEST');
  const [guestName, setGuestName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  const { data: reservationsResp, isLoading: resLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationAPI.getAll,
  });

  const { data: roomsResp, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', guestCategory],
    queryFn: () => roomAPI.getAll(guestCategory),
  });

  const updateReservationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reservationAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    }
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => roomAPI.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] })
  });

  const createReservationMutation = useMutation({
    mutationFn: (data: any) => reservationAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setIsDialogOpen(false);
      alert('Sponsor Notified (Simulated Email/WA)');
    }
  });

  const handleBooking = () => {
    if (!guestName || !selectedRoom) return alert("Pilih kamar dan masukkan nama tamu.");
    createReservationMutation.mutate({
      guestName,
      category: guestCategory,
      room_id: selectedRoom,
      estimated_arrival: new Date().toISOString().slice(0, 19).replace('T', ' '),
      estimated_departure: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 19).replace('T', ' ')
    });
  };

  const reservations = reservationsResp?.data?.data || [];
  const rooms = roomsResp?.data?.data || [];

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'ON SITE': 'success',
      'SCHEDULED': 'warning',
      'OFF SITE': 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredReservations = reservations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 mt-1">Manage guest arrivals and room status</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
        <span className="font-semibold text-gray-700">Simulate Role:</span>
        <div className="flex gap-2">
          {['front_desk', 'office_boy'].map(r => (
            <Button 
              key={r} 
              variant={role === r ? 'default' : 'outline'}
              onClick={() => setRole(r as any)}
              className="capitalize"
            >
              {r.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {role === 'office_boy' && (
        <Card>
          <CardHeader><CardTitle className="text-lg uppercase">Room Readiness Checklist (Office Boy)</CardTitle></CardHeader>
          <CardContent>
            {roomsLoading ? <p>Loading rooms...</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Allocation</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rooms.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.room_no}</TableCell>
                      <TableCell>{r.room_allocation}</TableCell>
                      <TableCell><Badge variant={r.room_status === 'READY' ? 'default' : 'destructive'}>{r.room_status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateRoomMutation.mutate({id: r.id, status: 'READY'})}>Set Ready</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateRoomMutation.mutate({id: r.id, status: 'NOT READY YET'})}>Set Not Ready</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {role === 'front_desk' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg uppercase">All Reservations</CardTitle>
              <div className="flex gap-4 items-center">

                {role === 'front_desk' && (
                  <Button className="gap-2" onClick={() => setIsDialogOpen(true)}><Plus size={20} /> Book Room</Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {resLoading ? <div className="text-center py-4">Loading database...</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room No</TableHead>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Estimated Arrival</TableHead>
                    <TableHead>Estimate Departure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations?.map((reservation: any) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.roomNo}</TableCell>
                      <TableCell>{reservation.guestName}</TableCell>
                      <TableCell>{reservation.occupants_category}</TableCell>
                      <TableCell>{reservation.check_in || '-'}</TableCell>
                      <TableCell>{reservation.check_out || '-'}</TableCell>
                      <TableCell>{reservation.estimated_arrival || '-'}</TableCell>
                      <TableCell>{reservation.estimated_departure || '-'}</TableCell>
                      <TableCell>{getStatusBadge(reservation.guest_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {reservation.guest_status === 'SCHEDULED' && (
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => updateReservationMutation.mutate({id: reservation.id, status: 'ON SITE'})} title="Front Desk Check-in or QR Code Scan">
                              <LogIn size={16} /> Check In (Scan QR)
                            </Button>
                          )}
                          {reservation.guest_status === 'ON SITE' && (
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => updateReservationMutation.mutate({id: reservation.id, status: 'OFF SITE'})}>
                              <LogOut size={16} /> Check Out
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReservations.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center py-4">No reservations found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>New Room Booking</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guest Category</label>
              <select className="w-full border p-2 rounded-md" value={guestCategory} onChange={(e) => setGuestCategory(e.target.value)}>
                <option value="REGULAR GUEST">Regular Guest</option>
                <option value="SPECIAL GUEST">Special Guest</option>
                <option value="EXECUTIVE/VIPs GUEST">Executive/VIPs Guest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guest Name</label>
              <Input placeholder="Enter guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Available Room</label>
              <select className="w-full border p-2 rounded-md" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                <option value="">-- Choose Room --</option>
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.room_no} - {r.mess_name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleBooking} disabled={createReservationMutation.isPending || !selectedRoom || !guestName}>Book Room & Notify</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;
