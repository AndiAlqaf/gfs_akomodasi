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
import Swal from 'sweetalert2';

const Reservations: React.FC = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'front_desk' | 'office_boy'>('front_desk');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestCategory, setGuestCategory] = useState('REGULAR GUEST');
  const [guestName, setGuestName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsCurrentPage, setRoomsCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsDialogOpen(false);
      Swal.fire({ icon: 'success', title: 'Booked!', text: 'Room successfully booked!', timer: 2000, showConfirmButton: false });
    }
  });

  const handleBooking = () => {
    if (!guestName || !selectedRoom) return Swal.fire({ icon: 'warning', title: 'Attention', text: 'Pilih kamar dan masukkan nama tamu.', timer: 2000, showConfirmButton: false });
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

  console.log('reservationsResp:', reservationsResp);
  console.log('reservations:', reservations);

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'ON SITE': 'success',
      'SCHEDULED': 'warning',
      'OFF SITE': 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredReservations = reservations;
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage) || 1;
  const paginatedData = filteredReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100"><CardTitle className="text-lg uppercase text-emerald-950">Room Readiness Checklist (Office Boy)</CardTitle></CardHeader>
          <CardContent className="p-0">
            {roomsLoading ? <div className="p-4 text-center text-emerald-700">Loading rooms...</div> : (
              <div className="w-full bg-white overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                  <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Room</th>
                      <th className="px-6 py-4">Allocation</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {(() => {
                      const paginatedRooms = rooms.slice((roomsCurrentPage - 1) * itemsPerPage, roomsCurrentPage * itemsPerPage);
                      return paginatedRooms.map((r: any) => (
                        <tr key={r.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-emerald-950">{r.room_no}</td>
                          <td className="px-6 py-3 text-emerald-700">{r.room_allocation}</td>
                          <td className="px-6 py-3"><Badge variant={r.room_status === 'READY' ? 'success' : 'destructive'}>{r.room_status}</Badge></td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => updateRoomMutation.mutate({id: r.id, status: 'READY'})}>Set Ready</Button>
                              <Button size="sm" variant="destructive" onClick={() => updateRoomMutation.mutate({id: r.id, status: 'NOT READY YET'})}>Set Not Ready</Button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                    {rooms.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-8 text-gray-500">No rooms found.</td></tr>
                    )}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 rounded-b-xl">
                  <div className="text-sm text-emerald-800">
                    Showing <span className="font-semibold">{rooms.length > 0 ? (roomsCurrentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold">{Math.min(roomsCurrentPage * itemsPerPage, rooms.length)}</span> of <span className="font-semibold">{rooms.length}</span> entries
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRoomsCurrentPage(prev => Math.max(prev - 1, 1))} disabled={roomsCurrentPage === 1}>Previous</Button>
                    {Array.from({ length: Math.ceil(rooms.length / itemsPerPage) || 1 }, (_, i) => i + 1).map(page => (
                      <Button key={page} variant={roomsCurrentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setRoomsCurrentPage(page)} className={roomsCurrentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setRoomsCurrentPage(prev => Math.min(prev + 1, Math.ceil(rooms.length / itemsPerPage) || 1))} disabled={roomsCurrentPage === (Math.ceil(rooms.length / itemsPerPage) || 1)}>Next</Button>
                  </div>
                </div>
              </div>
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
              <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4">ROOM NO</th>
                        <th className="px-6 py-4">GUEST NAME</th>
                        <th className="px-6 py-4">CATEGORY</th>
                        <th className="px-6 py-4">CHECK-IN</th>
                        <th className="px-6 py-4">CHECK-OUT</th>
                        <th className="px-6 py-4">ESTIMATED ARRIVAL</th>
                        <th className="px-6 py-4">ESTIMATE DEPARTURE</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData?.map((reservation: any) => (
                        <tr key={reservation.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-emerald-950">{reservation.roomNo}</td>
                          <td className="px-6 py-3 font-medium text-emerald-900">{reservation.guestName}</td>
                          <td className="px-6 py-3 text-emerald-700">{reservation.occupants_category}</td>
                          <td className="px-6 py-3 text-emerald-600">{reservation.check_in ? formatDate(reservation.check_in) : '-'}</td>
                          <td className="px-6 py-3 text-emerald-600">{reservation.check_out ? formatDate(reservation.check_out) : '-'}</td>
                          <td className="px-6 py-3 text-emerald-600">{reservation.estimated_arrival ? formatDate(reservation.estimated_arrival) : '-'}</td>
                          <td className="px-6 py-3 text-emerald-600">{reservation.estimated_departure ? formatDate(reservation.estimated_departure) : '-'}</td>
                          <td className="px-6 py-3">{getStatusBadge(reservation.guest_status)}</td>
                          <td className="px-6 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            {reservation.guest_status === 'SCHEDULED' && (
                              <Button size="sm" variant="outline" className="gap-1" onClick={() => updateReservationMutation.mutate({id: reservation.id, status: 'ON SITE'})} title="Front Desk Check-in or QR Code Scan">
                                <LogIn size={16} /> Check In (Scan QR)
                              </Button>
                            )}
                            {reservation.guest_status === 'ON SITE' && (
                              <Button size="sm" variant="outline" className="gap-1 bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800" onClick={() => updateReservationMutation.mutate({id: reservation.id, status: 'OFF SITE'})} title="Simulate Front Desk or QR Scan Check-Out">
                                <LogOut size={16} /> Check Out
                              </Button>
                            )}
                          </div>
                        </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr><td colSpan={9} className="text-center py-8 text-gray-500">No reservations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 mt-4 rounded-xl">
                  <div className="text-sm text-emerald-800">
                    Showing <span className="font-semibold">{filteredReservations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredReservations.length)}</span> of <span className="font-semibold">{filteredReservations.length}</span> entries
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              </div>
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
