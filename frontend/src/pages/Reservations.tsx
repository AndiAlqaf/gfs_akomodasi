import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationAPI, roomAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, User, MapPin, LogIn, LogOut, CheckCircle, Search, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Swal from 'sweetalert2';

const Reservations: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestCategory, setGuestCategory] = useState('REGULAR GUEST');
  const [guestName, setGuestName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [estimatedDeparture, setEstimatedDeparture] = useState('');
  const [remark, setRemark] = useState('');

  const [isCheckInOutDialogOpen, setIsCheckInOutDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState('');
  
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<any>(null);
  const [rescheduleArrival, setRescheduleArrival] = useState('');
  const [rescheduleDeparture, setRescheduleDeparture] = useState('');
  
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
    mutationFn: ({ id, status, estimated_arrival, estimated_departure }: { id: string; status: string; estimated_arrival?: string; estimated_departure?: string }) => reservationAPI.updateStatus(id, status, estimated_arrival, estimated_departure),
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
    if (!guestName || !selectedRoom || !estimatedArrival || !estimatedDeparture) return Swal.fire({ icon: 'warning', title: 'Attention', text: 'Pilih kamar, nama tamu, dan estimasi waktu.', timer: 2000, showConfirmButton: false });
    createReservationMutation.mutate({
      guestName,
      category: guestCategory,
      room_id: selectedRoom,
      estimated_arrival: estimatedArrival.replace('T', ' ') + ':00',
      estimated_departure: estimatedDeparture.replace('T', ' ') + ':00',
      remark
    });
  };

  const handleCheckInOutAction = (status: string) => {
    if (!selectedReservationId) return Swal.fire({ icon: 'warning', title: 'Attention', text: 'Please select a reservation.', timer: 2000, showConfirmButton: false });
    updateReservationMutation.mutate({ id: selectedReservationId, status });
    setIsCheckInOutDialogOpen(false);
    Swal.fire({ icon: 'success', title: 'Success!', text: `Guest successfully marked as ${status}!`, timer: 2000, showConfirmButton: false });
  };

  const handleCheckIn = (res: any) => {
    Swal.fire({
      title: 'Confirm Check In',
      text: `Are you sure you want to check in ${res.guestName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Check In'
    }).then((result) => {
      if (result.isConfirmed) {
        updateReservationMutation.mutate({id: res.id, status: 'ON SITE'});
      }
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

  const bedroomReservations = reservations.filter((r: any) => r.occupants_category !== 'REGULAR GUEST');
  const bedroomTotalPages = Math.ceil(bedroomReservations.length / itemsPerPage) || 1;
  const bedroomPaginatedData = bedroomReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const checkInOutReservations = reservations;
  const checkInOutTotalPages = Math.ceil(checkInOutReservations.length / itemsPerPage) || 1;
  const checkInOutPaginatedData = checkInOutReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">


        <div className="space-y-4">
          <Tabs defaultValue="bedroom" className="w-full">
            <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl border border-stone-200 inline-flex">
              <TabsTrigger value="bedroom" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">BEDROOM</TabsTrigger>
              <TabsTrigger value="meeting" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">MEETING ROOM</TabsTrigger>
              <TabsTrigger value="checkinout" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">CHECK-IN/ OUT</TabsTrigger>
            </TabsList>

            <TabsContent value="bedroom" className="animate-fade-in mt-0">
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
                <CardHeader className="bg-white border-b border-emerald-100 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-emerald-950 uppercase">BEDROOM</CardTitle>
                  <div className="flex gap-4">
                   <div className="relative">
                     <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                     <Input placeholder="Search..." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                   </div>
                   <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4" onClick={() => setIsDialogOpen(true)}>
                     <Plus size={18} /> Book Room
                   </Button>
                 </div>
                </CardHeader>
                <CardContent className="p-6 bg-stone-50/50">
                  <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-[11px] font-semibold tracking-wider">
                        <tr>
                       <th className="px-4 py-3 text-center">DATE</th>
                       <th className="px-4 py-3 text-center">ROOM NO</th>
                       <th className="px-4 py-3 text-center">MESS</th>
                       <th className="px-4 py-3 text-center">NAME</th>
                       <th className="px-4 py-3 text-center">ESTIMATED ARRIVAL</th>
                       <th className="px-4 py-3 text-center">ESTIMATED DEPARTURE</th>
                       <th className="px-4 py-3 text-center">GUEST STATUS</th>
                       <th className="px-4 py-3 text-center">REMARK</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-emerald-50">
                     {bedroomPaginatedData.map((res: any) => (
                        <tr key={res.id} className="hover:bg-emerald-50/50 transition-colors text-center text-emerald-900">
                          <td className="px-4 py-3">{res.created_at ? formatDate(res.created_at) : '-'}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-950">{res.roomNo}</td>
                          <td className="px-4 py-3 text-[11px]">LANDED HOUSE-{res.roomNo?.split('.')[1] || '01'}</td>
                          <td className="px-4 py-3 text-[11px] text-left">{res.guestName}</td>
                          <td className="px-4 py-3 text-emerald-700">{res.estimated_arrival ? formatDate(res.estimated_arrival) : '-'}</td>
                          <td className="px-4 py-3 text-emerald-700">{res.estimated_departure ? formatDate(res.estimated_departure) : '-'}</td>
                          <td className="px-4 py-3">
                            {res.guest_status === 'ON SITE' || res.guest_status === 'OFF SITE' ? (
                              <span className="uppercase text-emerald-800 font-medium text-[11px] px-2">{res.guest_status}</span>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className={`h-7 text-[10px] uppercase font-medium flex items-center gap-1 w-full justify-between
                                      ${res.guest_status === 'CANCELLED' ? 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100' : 
                                        res.guest_status === 'RE-SCHEDULED' || res.guest_status === 'RE-SHEDULLED' ? 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100' : 
                                        'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'}`}
                                  >
                                    {res.guest_status || 'SCHEDULED'}
                                    <ChevronDown size={12} className="opacity-50" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                  <DropdownMenuItem onClick={() => updateReservationMutation.mutate({id: res.id, status: 'SCHEDULED'})}>
                                    SCHEDULED
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { 
                                    setRescheduleData(res); 
                                    setRescheduleArrival(res.estimated_arrival?.replace(' ', 'T') || '');
                                    setRescheduleDeparture(res.estimated_departure?.replace(' ', 'T') || '');
                                    setIsRescheduleDialogOpen(true); 
                                  }}>
                                    RE-SCHEDULED
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateReservationMutation.mutate({id: res.id, status: 'CANCELLED'})}>
                                    CANCELLED
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                          <td className="px-4 py-3 text-left max-w-xs truncate" title={res.remark || ''}>{res.remark || '-'}</td>
                        </tr>
                     ))}
                     {bedroomPaginatedData.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-8 text-gray-500">No reservations found.</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
               
               <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 mt-4 rounded-xl">
                 <div className="text-sm text-emerald-800">
                   Showing <span className="font-semibold">{bedroomReservations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, bedroomReservations.length)}</span> of <span className="font-semibold">{bedroomReservations.length}</span> entries
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                   {Array.from({ length: bedroomTotalPages }, (_, i) => i + 1).map(page => (
                     <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0' : 'text-emerald-700 border-emerald-200'}>
                       {page}
                     </Button>
                   ))}
                   <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, bedroomTotalPages))} disabled={currentPage === bedroomTotalPages}>Next</Button>
                 </div>
               </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="meeting" className="animate-fade-in mt-0">
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
                <CardHeader className="bg-white border-b border-emerald-100 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-emerald-950 uppercase">MEETING ROOM</CardTitle>
                  <div className="flex gap-4">
                   <div className="relative">
                     <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                     <Input placeholder="Search..." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                   </div>
                   <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4">
                     <Plus size={18} /> Book Room
                   </Button>
                 </div>
                </CardHeader>
                <CardContent className="p-6 bg-stone-50/50">
                  <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-[11px] font-semibold tracking-wider">
                        <tr>
                       <th className="px-4 py-3 text-center">DATE</th>
                       <th className="px-4 py-3 text-center">REQUESTED BY</th>
                       <th className="px-4 py-3 text-center">DEPARTEMENT</th>
                       <th className="px-4 py-3 text-center">MEETING ROOM</th>
                       <th className="px-4 py-3 text-center">PARTICIPANTS</th>
                       <th className="px-4 py-3 text-center">START</th>
                       <th className="px-4 py-3 text-center">FINISH</th>
                       <th className="px-4 py-3 text-center">ADDITIONAL INFO</th>
                       <th className="px-4 py-3 text-center">ACTION</th>
                       <th className="px-4 py-3 text-center">REMARK</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-emerald-50">
                     {[1,2,3,4,5,6,7,8].map((_, idx) => (
                         <tr key={idx} className="hover:bg-emerald-50/50 transition-colors h-10"><td colSpan={10}></td></tr>
                     ))}
                   </tbody>
                 </table>
               </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="checkinout" className="animate-fade-in mt-0">
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
                <CardHeader className="bg-white border-b border-emerald-100 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-emerald-950 uppercase">CHECK-IN/ OUT</CardTitle>
                  <div className="flex gap-4">
                   <div className="relative">
                     <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                     <Input placeholder="Search..." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                   </div>
                   <Button className="bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg px-6 shadow-sm" onClick={() => setIsCheckInOutDialogOpen(true)}>
                     Check In/ Out
                   </Button>
                 </div>
                </CardHeader>
                <CardContent className="p-6 bg-stone-50/50">
                  <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-[11px] font-semibold tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-center">ROOM NO</th>
                          <th className="px-4 py-3 text-center">MESS</th>
                          <th className="px-4 py-3 text-center">NAME</th>
                          <th className="px-4 py-3 text-center">CHECK-IN</th>
                          <th className="px-4 py-3 text-center">CHECK-OUT</th>
                          <th className="px-4 py-3 text-center">GUEST STATUS</th>
                          <th className="px-4 py-3 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {checkInOutPaginatedData.map((res: any) => (
                           <tr key={res.id} className="hover:bg-emerald-50/50 transition-colors text-center text-emerald-900">
                             <td className="px-4 py-3 font-semibold text-emerald-950">{res.roomNo}</td>
                             <td className="px-4 py-3 text-[11px]">LANDED HOUSE-{res.roomNo?.split('.')[1] || '01'}</td>
                             <td className="px-4 py-3 text-[11px] text-left">{res.guestName}</td>
                             <td className="px-4 py-3 text-emerald-700">{res.check_in ? formatDate(res.check_in) : res.estimated_arrival ? formatDate(res.estimated_arrival) : '-'}</td>
                             <td className="px-4 py-3 text-emerald-700">{res.check_out ? formatDate(res.check_out) : '-'}</td>
                             <td className="px-4 py-3 uppercase font-medium text-[11px]">{res.guest_status}</td>
                             <td className="px-4 py-3">
                                <div className="flex justify-center gap-1">
                                  {(res.guest_status === 'SCHEDULED' || res.guest_status === 'OFF SITE') && (
                                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => handleCheckIn(res)}>
                                      Check In
                                    </Button>
                                  )}
                                  {res.guest_status === 'ON SITE' && (
                                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" onClick={() => updateReservationMutation.mutate({id: res.id, status: 'OFF SITE'})}>
                                      Check Out
                                    </Button>
                                  )}
                                </div>
                             </td>
                           </tr>
                        ))}
                        {checkInOutPaginatedData.length === 0 && (
                           <tr><td colSpan={7} className="text-center py-8 text-gray-500">No reservations found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 mt-4 rounded-xl">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{checkInOutReservations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, checkInOutReservations.length)}</span> of <span className="font-semibold">{checkInOutReservations.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                      {Array.from({ length: checkInOutTotalPages }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0' : 'text-emerald-700 border-emerald-200'}>
                          {page}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, checkInOutTotalPages))} disabled={currentPage === checkInOutTotalPages}>Next</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

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
                {rooms.filter((r: any) => r.room_status === 'READY').map((r: any) => (
                  <option key={r.id} value={r.id}>{r.room_no} - {r.mess_name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Arrival</label>
                <Input type="datetime-local" value={estimatedArrival} onChange={(e) => setEstimatedArrival(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Departure</label>
                <Input type="datetime-local" value={estimatedDeparture} onChange={(e) => setEstimatedDeparture(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remark (Optional)</label>
              <Input placeholder="Enter remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleBooking} disabled={createReservationMutation.isPending || !selectedRoom || !guestName}>Book Room & Notify</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check In / Out Dialog */}
      <Dialog open={isCheckInOutDialogOpen} onOpenChange={setIsCheckInOutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Check In / Check Out</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-emerald-900">Select Guest</label>
              <select className="w-full border border-emerald-200 p-2 rounded-lg focus:border-emerald-500" value={selectedReservationId} onChange={(e) => setSelectedReservationId(e.target.value)}>
                <option value="">-- Choose Reservation --</option>
                {reservations?.filter((r: any) => r.guest_status === 'SCHEDULED' || r.guest_status === 'ON SITE').map((r: any) => (
                  <option key={r.id} value={r.id}>{r.guestName} - {r.roomNo} ({r.guest_status})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50" onClick={() => handleCheckInOutAction('ON SITE')}>Process Check In</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleCheckInOutAction('OFF SITE')}>Process Check Out</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Reschedule Booking</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="text-sm font-medium text-emerald-800 bg-emerald-50 p-2 rounded">
              Guest: {rescheduleData?.guestName} <br/> Room: {rescheduleData?.roomNo}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Estimated Arrival</label>
              <Input type="datetime-local" value={rescheduleArrival} onChange={(e) => setRescheduleArrival(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Estimated Departure</label>
              <Input type="datetime-local" value={rescheduleDeparture} onChange={(e) => setRescheduleDeparture(e.target.value)} />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => {
                if (!rescheduleArrival || !rescheduleDeparture) return Swal.fire({ icon: 'warning', text: 'Please fill both dates.', timer: 2000, showConfirmButton: false });
                updateReservationMutation.mutate({
                  id: rescheduleData.id, 
                  status: 'RE-SCHEDULED', 
                  estimated_arrival: rescheduleArrival.replace('T', ' ') + ':00', 
                  estimated_departure: rescheduleDeparture.replace('T', ' ') + ':00'
                });
                setIsRescheduleDialogOpen(false);
              }} disabled={updateReservationMutation.isPending}>Save Reschedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;
