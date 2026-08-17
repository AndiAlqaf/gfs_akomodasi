import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { informationAPI, laundryAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightText } from '@/components/ui/HighlightText';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const Information: React.FC = () => {
  const [roomPage, setRoomPage] = useState(1);
  const [pobPage, setPobPage] = useState(1);
  const [mealsPage, setMealsPage] = useState(1);
  const [laundryPage, setLaundryPage] = useState(1);
  const [meetingPage, setMeetingPage] = useState(1);

  const [roomSearch, setRoomSearch] = useState('');
  const [pobSearch, setPobSearch] = useState('');
  const [mealsSearch, setMealsSearch] = useState('');
  const [laundrySearch, setLaundrySearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');
  const { data: roomInfoResp, isLoading: roomLoading } = useQuery({
    queryKey: ['info-rooms'],
    queryFn: informationAPI.getRooms,
  });

  const { data: pobInfoResp, isLoading: pobLoading } = useQuery({
    queryKey: ['info-pob'],
    queryFn: informationAPI.getPob,
  });

  const rooms = roomInfoResp?.data?.data || [];
  const pobs = pobInfoResp?.data?.data || [];

  const { data: mealsInfoResp, isLoading: mealsLoading } = useQuery({
    queryKey: ['info-meals'],
    queryFn: informationAPI.getMealsInfo,
  });

  const { data: laundryResp, isLoading: laundryLoading } = useQuery({
    queryKey: ['laundry'],
    queryFn: laundryAPI.getAll,
  });

  const { data: meetingResp, isLoading: meetingLoading } = useQuery({
    queryKey: ['info-meeting'],
    queryFn: informationAPI.getMeetingRooms,
  });


  const mealsServicesData = mealsInfoResp?.data?.data || [];
  const laundryItems = laundryResp?.data?.data || laundryResp?.data || [];

  const filteredRooms = rooms.filter((r: any) => {
    const searchStr = `${r.room} ${r.mess} ${r.area} ${r.room_allocation} ${r.beds_total} ${r.beds_occupied} ${r.beds_vacant} ${r.status}`.toLowerCase();
    return searchStr.includes(roomSearch.toLowerCase());
  });
  const filteredPobs = pobs.filter((p: any) => {
    const searchStr = `${formatDate(p.date)} ${p.room_no} ${p.mess} ${p.area} ${p.reg_id_card || '-'} ${p.job || '-'} ${p.position || '-'} ${p.level_category || '-'} ${p.institution_company || '-'} ${p.occupants_category || '-'} ${p.boarding_status}`.toLowerCase();
    return searchStr.includes(pobSearch.toLowerCase());
  });
  const filteredMeals = mealsServicesData.filter((r: any) => {
    const searchStr = `${formatDate(r.date)} ${r.meals_packages} ${r.delivery_point} ${r.meal_time} ${r.no_of_packs} ${r.accommodation_status}`.toLowerCase();
    return searchStr.includes(mealsSearch.toLowerCase());
  });
  const filteredLaundry = laundryItems.filter((r: any) => {
    const searchStr = `${r.guest_name} ${r.room} ${r.laundry_bag_id} ${r.laundry_box_id} ${r.services_package} ${r.weight || '-'} ${r.no_of_pcs_total || '-'} ${formatDate(r.receiving_date) || '-'}`.toLowerCase();
    return searchStr.includes(laundrySearch.toLowerCase());
  });

  const meetingRoomsData = meetingResp?.data?.data || [];
  const filteredMeetingRooms = meetingRoomsData.filter((r: any) => {
    const searchStr = `${r.date} ${r.room} ${r.building} ${r.capacity} ${r.booking_status} ${r.reserved_by} ${r.status}`.toLowerCase();
    return searchStr.includes(meetingSearch.toLowerCase());
  });

  const roomTotalPages = Math.max(1, Math.ceil(filteredRooms.length / ITEMS_PER_PAGE));
  const paginatedRooms = filteredRooms.slice((roomPage - 1) * ITEMS_PER_PAGE, roomPage * ITEMS_PER_PAGE);

  const totalBedsAvailable = filteredRooms.reduce((sum: number, r: any) => sum + (Number(r.beds_total) || 0), 0);
  const totalBedsOccupied = filteredRooms.reduce((sum: number, r: any) => sum + (Number(r.beds_occupied) || 0), 0);
  const totalBedsVacant = filteredRooms.reduce((sum: number, r: any) => sum + (Number(r.beds_vacant) || 0), 0);

  const onBoardCount = filteredPobs.filter((p: any) => p.boarding_status === 'ON BOARD').length;
  const offBoardCount = filteredPobs.filter((p: any) => p.boarding_status !== 'ON BOARD').length;

  const pobTotalPages = Math.max(1, Math.ceil(filteredPobs.length / ITEMS_PER_PAGE));
  const paginatedPobs = filteredPobs.slice((pobPage - 1) * ITEMS_PER_PAGE, pobPage * ITEMS_PER_PAGE);

  const totalWeight = filteredLaundry.reduce((sum: number, r: any) => sum + (Number(r.weight) || 0), 0);
  const formattedWeight = Number.isInteger(totalWeight) ? totalWeight : Number(totalWeight.toFixed(2));
  const totalAmount = filteredLaundry.reduce((sum: number, r: any) => sum + (Number(r.no_of_pcs_total || r.no_of_pcs || r.pcs) || 0), 0);

  const laundryTotalPages = Math.max(1, Math.ceil(filteredLaundry.length / ITEMS_PER_PAGE));
  const paginatedLaundryItems = filteredLaundry.slice((laundryPage - 1) * ITEMS_PER_PAGE, laundryPage * ITEMS_PER_PAGE);

  const accommodatedCount = filteredMeals
    .filter((r: any) => r.accommodation_status === 'PROVIDED' || r.accommodation_status === 'ACCOMODATED')
    .reduce((sum: number, r: any) => sum + (Number(r.no_of_packs) || 0), 0);

  const nonAccommodatedCount = filteredMeals
    .filter((r: any) => r.accommodation_status !== 'PROVIDED' && r.accommodation_status !== 'ACCOMODATED')
    .reduce((sum: number, r: any) => sum + (Number(r.no_of_packs) || 0), 0);

  const mealsTotalPages = Math.max(1, Math.ceil(filteredMeals.length / ITEMS_PER_PAGE));
  const paginatedMeals = filteredMeals.slice((mealsPage - 1) * ITEMS_PER_PAGE, mealsPage * ITEMS_PER_PAGE);

  const meetingTotalPages = Math.max(1, Math.ceil(filteredMeetingRooms.length / ITEMS_PER_PAGE));
  const paginatedMeetingRooms = filteredMeetingRooms.slice((meetingPage - 1) * ITEMS_PER_PAGE, meetingPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-full min-w-0 overflow-hidden">
      <Tabs defaultValue="rooms" className="w-full flex flex-col flex-1 min-h-0">
        <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl border border-stone-200 inline-flex shrink-0 w-max">
          <TabsTrigger value="rooms" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">BEDROOM INFO</TabsTrigger>
          <TabsTrigger value="meeting_rooms" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">MEETING ROOM INFO</TabsTrigger>
          <TabsTrigger value="pob" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">PERSON ON BOARD INFO</TabsTrigger>
          <TabsTrigger value="meals" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">MEALS SERVICES INFO</TabsTrigger>
          <TabsTrigger value="laundry" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">LAUNDRY SERVICES INFO</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="animate-fade-in mt-0 data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Bedroom Information</CardTitle>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <Input placeholder="Search..." value={roomSearch} onChange={e => { setRoomSearch(e.target.value); setRoomPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setRoomPage(1)}>Search</Button>
                </div>
                <div className="flex flex-row flex-wrap gap-6 font-bold text-xs text-slate-800 shrink-0 border-l border-emerald-100 pl-6">
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-24 text-right uppercase tracking-wide">AVAILABLE</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {totalBedsAvailable}
                    </div>
                    <span className="w-10 text-left uppercase text-slate-600">BEDS</span>
                  </div>
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-24 text-right uppercase tracking-wide">OCCUPIED</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {totalBedsOccupied}
                    </div>
                    <span className="w-10 text-left uppercase text-slate-600">BEDS</span>
                  </div>
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-24 text-right uppercase tracking-wide">VACANT</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {totalBedsVacant}
                    </div>
                    <span className="w-10 text-left uppercase text-slate-600">BEDS</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden">
              {roomLoading ? (
                <div className="text-center py-8">Loading Room Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                  <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-1 py-1" rowSpan={2}>NO</th>
                          <th className="px-1 py-1" rowSpan={2}>ROOM</th>
                          <th className="px-1 py-1" rowSpan={2}>MESS</th>
                          <th className="px-1 py-1" rowSpan={2}>AREA</th>
                          <th className="px-1 py-1" rowSpan={2}>ROOM ALLOCATION</th>
                          <th className="px-1 py-1 text-center border-b border-emerald-900" colSpan={3}>BEDS</th>
                          <th className="px-1 py-1" rowSpan={2}>STATUS</th>
                        </tr>
                        <tr className="bg-emerald-900/50">
                          <th className="px-6 py-2 text-center border-t border-emerald-900">AVAILABLE</th>
                          <th className="px-6 py-2 text-center border-t border-emerald-900">OCCUPIED</th>
                          <th className="px-6 py-2 text-center border-t border-emerald-900">VACANT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedRooms.map((r: any, idx: number) => (
                          <tr key={r.id} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-1 py-1 font-medium text-emerald-950">{((roomPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                            <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={r.room} highlight={roomSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700"><HighlightText text={r.mess} highlight={roomSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700"><HighlightText text={r.area} highlight={roomSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700"><HighlightText text={r.room_allocation} highlight={roomSearch} /></td>
                            <td className="px-1 py-1 text-center font-semibold bg-emerald-50/50 text-emerald-800 border-x border-emerald-100"><HighlightText text={r.beds_total} highlight={roomSearch} /></td>
                            <td className="px-1 py-1 text-center font-semibold bg-lime-50/50 text-lime-800 border-x border-emerald-100"><HighlightText text={r.beds_occupied} highlight={roomSearch} /></td>
                            <td className="px-1 py-1 text-center font-semibold bg-stone-50 text-stone-800 border-x border-emerald-100"><HighlightText text={r.beds_vacant} highlight={roomSearch} /></td>
                            <td className="px-1 py-1">
                              <span className="bg-lime-400 text-emerald-950 px-2 py-1 rounded-full text-xs shadow-sm font-bold"><HighlightText text={r.status} highlight={roomSearch} /></span>
                            </td>
                          </tr>
                        ))}
                        {paginatedRooms.length === 0 && (
                          <tr><td colSpan={11} className="text-center py-8 text-gray-500">No rooms found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{filteredRooms.length > 0 ? (roomPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(roomPage * ITEMS_PER_PAGE, filteredRooms.length)}</span> of <span className="font-semibold">{filteredRooms.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setRoomPage(prev => Math.max(prev - 1, 1))} disabled={roomPage === 1}>Previous</Button>
                      {Array.from({ length: roomTotalPages }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={roomPage === page ? 'default' : 'outline'} size="sm" onClick={() => setRoomPage(page)} className={roomPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                          {page}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setRoomPage(prev => Math.min(prev + 1, roomTotalPages))} disabled={roomPage === roomTotalPages}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meeting_rooms" className="animate-fade-in mt-0 data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase">Meeting Room Information</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input placeholder="Search..." value={meetingSearch} onChange={e => { setMeetingSearch(e.target.value); setMeetingPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setMeetingPage(1)}>Search</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden">
              {meetingLoading ? (
                <div className="text-center py-8">Loading Meeting Rooms Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                  <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-center">DATE</th>
                          <th className="px-3 py-3 text-left">ROOM</th>
                          <th className="px-3 py-3 text-left">BUILDING</th>
                          <th className="px-3 py-3 text-center">CAPACITY</th>
                          <th className="px-3 py-3 text-center">BOOKING STATUS</th>
                          <th className="px-3 py-3 text-center">RESERVED BY</th>
                          <th className="px-3 py-3 text-center">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedMeetingRooms.map((r: any, i: number) => (
                          <tr key={i} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-1 py-1 text-emerald-800 font-medium text-center"><HighlightText text={r.date} highlight={meetingSearch} /></td>
                            <td className="px-1 py-1 text-emerald-800 font-medium text-left"><HighlightText text={r.room} highlight={meetingSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700 text-left"><HighlightText text={r.building} highlight={meetingSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700 text-center"><HighlightText text={r.capacity} highlight={meetingSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700 text-center font-semibold"><HighlightText text={r.booking_status} highlight={meetingSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700 text-center"><HighlightText text={r.reserved_by} highlight={meetingSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700 text-center"><HighlightText text={r.status} highlight={meetingSearch} /></td>
                          </tr>
                        ))}
                        {paginatedMeetingRooms.length === 0 && (
                          <tr><td colSpan={7} className="text-center py-8 text-gray-500">No meeting rooms found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{filteredMeetingRooms.length > 0 ? (meetingPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(meetingPage * ITEMS_PER_PAGE, filteredMeetingRooms.length)}</span> of <span className="font-semibold">{filteredMeetingRooms.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setMeetingPage(prev => Math.max(prev - 1, 1))} disabled={meetingPage === 1}>Previous</Button>
                      {Array.from({ length: meetingTotalPages }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={meetingPage === page ? 'default' : 'outline'} size="sm" onClick={() => setMeetingPage(page)} className={meetingPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                          {page}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setMeetingPage(prev => Math.min(prev + 1, meetingTotalPages))} disabled={meetingPage === meetingTotalPages}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pob" className="animate-fade-in mt-0 data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Person On Board (POB) Information</CardTitle>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <Input placeholder="Search..." value={pobSearch} onChange={e => { setPobSearch(e.target.value); setPobPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setPobPage(1)}>Search</Button>
                </div>
                <div className="flex flex-col gap-1.5 font-bold text-xs text-slate-800 shrink-0 border-l border-emerald-100 pl-6">
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-20 text-right uppercase tracking-wide">ON BOARD</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {onBoardCount}
                    </div>
                    <span className="w-14 text-left uppercase tracking-wide">PERSON</span>
                  </div>
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-20 text-right uppercase tracking-wide">OFF BOARD</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {offBoardCount}
                    </div>
                    <span className="w-14 text-left uppercase tracking-wide">PERSON</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden">
              {pobLoading ? (
                <div className="text-center py-8">Loading POB Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                  <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                    <table className="w-full min-w-max text-xs text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3">NO</th>
                          <th className="px-3 py-3">DATE</th>
                          <th className="px-3 py-3">ROOM NO</th>
                          <th className="px-3 py-3">MESS</th>
                          <th className="px-3 py-3">AREA</th>
                          <th className="px-3 py-3">REG. ID</th>
                          <th className="px-3 py-3">JOB</th>
                          <th className="px-3 py-3">POSITION</th>
                          <th className="px-3 py-3">LEVEL CATEGORY</th>
                          <th className="px-3 py-3">INSTITUTION/COMPANY</th>
                          <th className="px-3 py-3">OCCUPANTS CATEGORY</th>
                          <th className="px-3 py-3 text-center">BOARDING STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedPobs.map((p: any, idx: number) => (
                          <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-1 py-1 font-medium text-emerald-950">{((pobPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                            <td className="px-1 py-1 text-emerald-700"><HighlightText text={formatDate(p.date)} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={p.room_no} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700"><HighlightText text={p.mess} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700"><HighlightText text={p.area} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-600"><HighlightText text={p.reg_id_card || '-'} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-600"><HighlightText text={p.job || '-'} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-600"><HighlightText text={p.position || '-'} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-600"><HighlightText text={p.level_category || '-'} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-emerald-700">
                              <span className="bg-stone-100 text-emerald-800 px-2 py-1 rounded-md border border-stone-200"><HighlightText text={p.institution_company || '-'} highlight={pobSearch} /></span>
                            </td>
                            <td className="px-1 py-1 text-emerald-700"><HighlightText text={p.occupants_category || '-'} highlight={pobSearch} /></td>
                            <td className="px-1 py-1 text-center">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${p.boarding_status === 'ON BOARD' ? 'bg-lime-400 text-emerald-950 shadow-sm' : 'bg-stone-200 text-stone-600'}`}><HighlightText text={p.boarding_status} highlight={pobSearch} /></span>
                            </td>
                          </tr>
                        ))}
                        {paginatedPobs.length === 0 && (
                          <tr><td colSpan={14} className="text-center py-8 text-gray-500">No POB data found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{filteredPobs.length > 0 ? (pobPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(pobPage * ITEMS_PER_PAGE, filteredPobs.length)}</span> of <span className="font-semibold">{filteredPobs.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPobPage(prev => Math.max(prev - 1, 1))} disabled={pobPage === 1}>Previous</Button>
                      {Array.from({ length: pobTotalPages }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={pobPage === page ? 'default' : 'outline'} size="sm" onClick={() => setPobPage(page)} className={pobPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                          {page}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setPobPage(prev => Math.min(prev + 1, pobTotalPages))} disabled={pobPage === pobTotalPages}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="animate-fade-in mt-0 data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Meals Services Info</CardTitle>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <Input placeholder="Search..." value={mealsSearch} onChange={e => { setMealsSearch(e.target.value); setMealsPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setMealsPage(1)}>Search</Button>
                </div>
                <div className="flex flex-col gap-1.5 font-bold text-xs text-slate-800 shrink-0 border-l border-emerald-100 pl-6">
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-36 text-right uppercase tracking-wide">ACCOMODATED</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {accommodatedCount}
                    </div>
                    <span className="w-10 text-left uppercase tracking-wide">PAX</span>
                  </div>
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-36 text-right uppercase tracking-wide">NON ACCOMODATED</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {nonAccommodatedCount}
                    </div>
                    <span className="w-10 text-left uppercase tracking-wide">PAX</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden">
              {mealsLoading ? (
                <div className="text-center py-8">Loading Meals Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                  <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3">NO</th>
                          <th className="px-3 py-3">DATE</th>
                          <th className="px-3 py-3">MEALS PACKAGES</th>
                          <th className="px-3 py-3">MEALS DELIVERY POINT</th>
                          <th className="px-3 py-3">MEAL TIME</th>
                          <th className="px-3 py-3 text-center">NO OF PACKS</th>
                          <th className="px-3 py-3">ACCOMODATION STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedMeals.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-8 text-gray-500">No meals found for today.</td>
                          </tr>
                        ) : (
                          paginatedMeals.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-emerald-50/50 transition-colors">
                              <td className="px-1 py-1 font-medium text-emerald-950">{((mealsPage - 1) * ITEMS_PER_PAGE) + i + 1}</td>
                              <td className="px-1 py-1 text-emerald-700"><HighlightText text={formatDate(row.date)} highlight={mealsSearch} /></td>
                              <td className="px-1 py-1 font-medium text-emerald-900"><HighlightText text={row.meals_packages} highlight={mealsSearch} /></td>
                              <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.delivery_point} highlight={mealsSearch} /></td>
                              <td className="px-1 py-1 text-emerald-700 font-medium"><HighlightText text={row.meal_time} highlight={mealsSearch} /></td>
                              <td className="px-1 py-1 text-center font-bold text-lg text-emerald-800 bg-emerald-50/50 border-x border-emerald-100"><HighlightText text={row.no_of_packs} highlight={mealsSearch} /></td>
                              <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.accommodation_status} highlight={mealsSearch} /></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{filteredMeals.length > 0 ? (mealsPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(mealsPage * ITEMS_PER_PAGE, filteredMeals.length)}</span> of <span className="font-semibold">{filteredMeals.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setMealsPage(prev => Math.max(prev - 1, 1))} disabled={mealsPage === 1}>Previous</Button>
                      {Array.from({ length: mealsTotalPages }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={mealsPage === page ? 'default' : 'outline'} size="sm" onClick={() => setMealsPage(page)} className={mealsPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                          {page}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setMealsPage(prev => Math.min(prev + 1, mealsTotalPages))} disabled={mealsPage === mealsTotalPages}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laundry" className="animate-fade-in mt-0 data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Laundry Services Info</CardTitle>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <Input placeholder="Search..." value={laundrySearch} onChange={e => { setLaundrySearch(e.target.value); setLaundryPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setLaundryPage(1)}>Search</Button>
                </div>
                <div className="flex flex-col gap-1.5 font-bold text-xs text-slate-800 shrink-0 border-l border-emerald-100 pl-6">
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-20 text-right uppercase tracking-wide">WEIGHT</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {formattedWeight}
                    </div>
                    <span className="w-10 text-left tracking-wide font-bold">Kg</span>
                  </div>
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="w-20 text-right uppercase tracking-wide">AMOUNT</span>
                    <div className="w-14 h-7 bg-white border-2 border-sky-500 rounded-md flex items-center justify-center font-extrabold text-slate-800 shadow-sm text-sm">
                      {totalAmount}
                    </div>
                    <span className="w-10 text-left tracking-wide font-bold">Pcs</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden">
              {laundryLoading ? (
                <div className="text-center py-8">Loading Laundry Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                  <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                    <table className="w-full min-w-max text-xs text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-center">NAME</th>
                          <th className="px-3 py-3 text-center">ROOM</th>
                          <th className="px-3 py-3 text-center">LAUNDRY<br />BAG ID</th>
                          <th className="px-3 py-3 text-center">LAUNDRY<br />BOX</th>
                          <th className="px-3 py-3 text-center">SERVICES<br />PACKAGES</th>
                          <th className="px-3 py-3 text-center">WEIGHT</th>
                          <th className="px-3 py-3 text-center">PCS</th>
                          <th className="px-3 py-3 text-center">RECEIVING<br />DATE</th>
                          <th className="px-3 py-3 text-center">COMPLETION<br />DATE</th>
                          <th className="px-3 py-3 text-center">DURATION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedLaundryItems.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="text-center py-8 text-gray-500">No laundry services found.</td>
                          </tr>
                        ) : (
                          paginatedLaundryItems.map((row: any) => (
                            <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors text-center font-medium">
                              <td className="px-4 py-2 text-emerald-800"><HighlightText text={row.guest_name} highlight={laundrySearch} /></td>
                              <td className="px-4 py-2 text-emerald-800"><HighlightText text={row.room} highlight={laundrySearch} /></td>
                              <td className="px-4 py-2 text-emerald-700 font-bold"><span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md border border-stone-200"><HighlightText text={row.laundry_bag_id} highlight={laundrySearch} /></span></td>
                              <td className="px-4 py-2 text-emerald-700"><HighlightText text={row.laundry_box_id} highlight={laundrySearch} /></td>
                              <td className="px-4 py-2 text-emerald-700"><HighlightText text={row.services_package} highlight={laundrySearch} /></td>
                              <td className="px-4 py-2 font-bold text-emerald-800"><HighlightText text={row.weight || '-'} highlight={laundrySearch} /></td>
                              <td className="px-4 py-2 text-emerald-700"><HighlightText text={row.no_of_pcs_total || '-'} highlight={laundrySearch} /></td>
                              <td className="px-4 py-2 text-emerald-700"><HighlightText text={formatDate(row.receiving_date) || '-'} highlight={laundrySearch} /></td>
                              <td className="px-4 py-2 text-emerald-700">-</td>
                              <td className="px-4 py-2 text-emerald-700">-</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{filteredLaundry.length > 0 ? (laundryPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(laundryPage * ITEMS_PER_PAGE, filteredLaundry.length)}</span> of <span className="font-semibold">{filteredLaundry.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setLaundryPage(prev => Math.max(prev - 1, 1))} disabled={laundryPage === 1}>Previous</Button>
                      {Array.from({ length: laundryTotalPages }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={laundryPage === page ? 'default' : 'outline'} size="sm" onClick={() => setLaundryPage(page)} className={laundryPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                          {page}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setLaundryPage(prev => Math.min(prev + 1, laundryTotalPages))} disabled={laundryPage === laundryTotalPages}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Information;
