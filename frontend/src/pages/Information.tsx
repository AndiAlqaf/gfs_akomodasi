import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { informationAPI, laundryAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 10;

const Information: React.FC = () => {
  const [roomPage, setRoomPage] = useState(1);
  const [pobPage, setPobPage] = useState(1);
  const [mealsPage, setMealsPage] = useState(1);
  const [laundryPage, setLaundryPage] = useState(1);
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
    queryFn: informationAPI.getMeals,
  });

  const { data: laundryResp, isLoading: laundryLoading } = useQuery({
    queryKey: ['laundry'],
    queryFn: laundryAPI.getAll,
  });

  const mealsServicesData = mealsInfoResp?.data?.data || [];
  const laundryItems = laundryResp?.data?.data || [];

  const roomTotalPages = Math.max(1, Math.ceil(rooms.length / ITEMS_PER_PAGE));
  const paginatedRooms = rooms.slice((roomPage - 1) * ITEMS_PER_PAGE, roomPage * ITEMS_PER_PAGE);

  const pobTotalPages = Math.max(1, Math.ceil(pobs.length / ITEMS_PER_PAGE));
  const paginatedPobs = pobs.slice((pobPage - 1) * ITEMS_PER_PAGE, pobPage * ITEMS_PER_PAGE);

  const laundryTotalPages = Math.max(1, Math.ceil(laundryItems.length / ITEMS_PER_PAGE));
  const paginatedLaundryItems = laundryItems.slice((laundryPage - 1) * ITEMS_PER_PAGE, laundryPage * ITEMS_PER_PAGE);

  const mealsTotalPages = Math.max(1, Math.ceil(mealsServicesData.length / ITEMS_PER_PAGE));
  const paginatedMeals = mealsServicesData.slice((mealsPage - 1) * ITEMS_PER_PAGE, mealsPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-emerald-700 mt-1">Live data reports from database</p>
      </div>

      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl border border-stone-200 inline-flex">
          <TabsTrigger value="rooms" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">ROOM INFO</TabsTrigger>
          <TabsTrigger value="pob" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">PERSON ON BOARD INFO</TabsTrigger>
          <TabsTrigger value="meals" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">MEALS SERVICES INFO</TabsTrigger>
          <TabsTrigger value="laundry" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">LAUNDRY SERVICES INFO</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="animate-fade-in mt-0">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
            <CardHeader className="bg-white border-b border-emerald-100">
              <CardTitle className="text-lg text-emerald-950 uppercase">Room Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50">
              {roomLoading ? (
                <div className="text-center py-8">Loading Room Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4" rowSpan={2}>NO</th>
                        <th className="px-6 py-4" rowSpan={2}>ROOM</th>
                        <th className="px-6 py-4" rowSpan={2}>MESS</th>
                        <th className="px-6 py-4" rowSpan={2}>AREA</th>
                        <th className="px-6 py-4" rowSpan={2}>NAME</th>
                        <th className="px-6 py-4" rowSpan={2}>ROOM ALLOCATION</th>
                        <th className="px-6 py-4 text-center border-b border-emerald-900" colSpan={3}>BEDS</th>
                        <th className="px-6 py-4" rowSpan={2}>STATUS</th>
                        <th className="px-6 py-4" rowSpan={2}>REMARK</th>
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
                          <td className="px-6 py-3 font-medium text-emerald-950">{((roomPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                          <td className="px-6 py-3 text-emerald-800 font-medium">{r.room}</td>
                          <td className="px-6 py-3 text-emerald-700">{r.mess}</td>
                          <td className="px-6 py-3 text-emerald-700">{r.area}</td>
                          <td className="px-6 py-3 font-medium text-emerald-900">{r.guest_name || '-'}</td>
                          <td className="px-6 py-3 text-emerald-700">{r.room_allocation}</td>
                          <td className="px-6 py-3 text-center font-semibold bg-emerald-50/50 text-emerald-800 border-x border-emerald-100">{r.beds_total}</td>
                          <td className="px-6 py-3 text-center font-semibold bg-lime-50/50 text-lime-800 border-x border-emerald-100">{r.beds_occupied}</td>
                          <td className="px-6 py-3 text-center font-semibold bg-stone-50 text-stone-800 border-x border-emerald-100">{r.beds_vacant}</td>
                          <td className="px-6 py-3">
                            <span className="bg-lime-400 text-emerald-950 px-2 py-1 rounded-full text-xs shadow-sm font-bold">{r.status}</span>
                          </td>
                          <td className="px-6 py-3 text-emerald-600">{r.remark}</td>
                        </tr>
                      ))}
                      {paginatedRooms.length === 0 && (
                        <tr><td colSpan={11} className="text-center py-8 text-gray-500">No rooms found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{rooms.length > 0 ? (roomPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(roomPage * ITEMS_PER_PAGE, rooms.length)}</span> of <span className="font-semibold">{rooms.length}</span> entries
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

        <TabsContent value="pob" className="animate-fade-in mt-0">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
            <CardHeader className="bg-white border-b border-emerald-100">
              <CardTitle className="text-lg text-emerald-950 uppercase">Person On Board (POB) Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50">
              {pobLoading ? (
                <div className="text-center py-8">Loading POB Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-xs text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">NO</th>
                        <th className="px-6 py-4">DATE</th>
                        <th className="px-6 py-4">ROOM NO</th>
                        <th className="px-6 py-4">MESS</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">NAME</th>
                        <th className="px-6 py-4">REG. ID</th>
                        <th className="px-6 py-4">JOB</th>
                        <th className="px-6 py-4">POSITION</th>
                        <th className="px-6 py-4">LEVEL CATEGORY</th>
                        <th className="px-6 py-4">INSTITUTION/COMPANY</th>
                        <th className="px-6 py-4">OCCUPANTS CATEGORY</th>
                        <th className="px-6 py-4 text-center">BOARDING STATUS</th>
                        <th className="px-6 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedPobs.map((p: any, idx: number) => (
                        <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-emerald-950">{((pobPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                          <td className="px-6 py-3 text-emerald-700">{formatDate(p.date)}</td>
                          <td className="px-6 py-3 text-emerald-800 font-medium">{p.room_no}</td>
                          <td className="px-6 py-3 text-emerald-700">{p.mess}</td>
                          <td className="px-6 py-3 text-emerald-700">{p.area}</td>
                          <td className="px-6 py-3 font-medium text-emerald-900">{p.name}</td>
                          <td className="px-6 py-3 text-emerald-600">{p.reg_id_card || '-'}</td>
                          <td className="px-6 py-3 text-emerald-600">{p.job || '-'}</td>
                          <td className="px-6 py-3 text-emerald-600">{p.position || '-'}</td>
                          <td className="px-6 py-3 text-emerald-600">{p.level_category || '-'}</td>
                          <td className="px-6 py-3 text-emerald-700">
                            <span className="bg-stone-100 text-emerald-800 px-2 py-1 rounded-md border border-stone-200">{p.institution_company || '-'}</span>
                          </td>
                          <td className="px-6 py-3 text-emerald-700">{p.occupants_category || '-'}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${p.boarding_status === 'ON BOARD' ? 'bg-lime-400 text-emerald-950 shadow-sm' : 'bg-stone-200 text-stone-600'}`}>{p.boarding_status}</span>
                          </td>
                          <td className="px-6 py-3 text-emerald-600">{p.remarks || '-'}</td>
                        </tr>
                      ))}
                      {paginatedPobs.length === 0 && (
                        <tr><td colSpan={14} className="text-center py-8 text-gray-500">No POB data found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{pobs.length > 0 ? (pobPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(pobPage * ITEMS_PER_PAGE, pobs.length)}</span> of <span className="font-semibold">{pobs.length}</span> entries
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

        <TabsContent value="meals" className="animate-fade-in mt-0">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
            <CardHeader className="bg-white border-b border-emerald-100">
              <CardTitle className="text-lg text-emerald-950 uppercase">Meals Services Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50">
              {mealsLoading ? (
                <div className="text-center py-8">Loading Meals Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4">NO</th>
                        <th className="px-6 py-4">DATE</th>
                        <th className="px-6 py-4">MEALS PACKAGES</th>
                        <th className="px-6 py-4">MEALS DELIVERY POINT</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">MEAL TIME</th>
                        <th className="px-6 py-4 text-center">NO OF PACKS</th>
                        <th className="px-6 py-4">ACCOMODATION STATUS</th>
                        <th className="px-6 py-4">REMARK</th>
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
                            <td className="px-6 py-3 font-medium text-emerald-950">{((mealsPage - 1) * ITEMS_PER_PAGE) + i + 1}</td>
                            <td className="px-6 py-3 text-emerald-700">{new Date().toISOString().split('T')[0]}</td>
                            <td className="px-6 py-3 font-medium text-emerald-900">{row.meals_packages}</td>
                            <td className="px-6 py-3 text-emerald-800">{row.delivery_point}</td>
                            <td className="px-6 py-3 text-gray-500">{row.area}</td>
                            <td className="px-6 py-3 text-emerald-700 font-medium">{row.meal_time}</td>
                            <td className="px-6 py-3 text-center font-bold text-lg text-emerald-800 bg-emerald-50/50 border-x border-emerald-100">{row.no_of_packs}</td>
                            <td className="px-6 py-3 text-emerald-700">{row.accommodation_status}</td>
                            <td className="px-6 py-3 text-emerald-600">-</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{mealsServicesData.length > 0 ? (mealsPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(mealsPage * ITEMS_PER_PAGE, mealsServicesData.length)}</span> of <span className="font-semibold">{mealsServicesData.length}</span> entries
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

        <TabsContent value="laundry" className="animate-fade-in mt-0">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
            <CardHeader className="bg-white border-b border-emerald-100">
              <CardTitle className="text-lg text-emerald-950 uppercase">Laundry Services Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50">
              {laundryLoading ? (
                <div className="text-center py-8">Loading Laundry Data...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-xs text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="px-4 py-3">NO</th>
                        <th className="px-4 py-3">DATE</th>
                        <th className="px-4 py-3">ROOM</th>
                        <th className="px-4 py-3">MESS</th>
                        <th className="px-4 py-3">NAME</th>
                        <th className="px-4 py-3">LAUNDRY BAG ID</th>
                        <th className="px-4 py-3">LAUNDRY BOX</th>
                        <th className="px-4 py-3">SERVICES PACKAGES</th>
                        <th className="px-4 py-3">DROPPED BY</th>
                        <th className="px-4 py-3">DROP POINT</th>
                        <th className="px-4 py-3">DELIVERY BY</th>
                        <th className="px-4 py-3">DELIVERY POINT</th>
                        <th className="px-4 py-3">RECEIVED BY</th>
                        <th className="px-4 py-3">RECEIVING DATE</th>
                        <th className="px-4 py-3">BAG STATUS</th>
                        <th className="px-4 py-3 text-center">WEIGHT</th>
                        <th className="px-4 py-3 text-center">NO OF PCS</th>
                        <th className="px-4 py-3">CHECK BY</th>
                        <th className="px-4 py-3">DELIVERED BY</th>
                        <th className="px-4 py-3">RE-DELIVERED POINT</th>
                        <th className="px-4 py-3">DISTRIBUTED BY</th>
                        <th className="px-4 py-3 text-center">LAUNDRY STATUS</th>
                        <th className="px-4 py-3">COMPLETION DATE</th>
                        <th className="px-4 py-3">REMARK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedLaundryItems.length === 0 ? (
                        <tr>
                          <td colSpan={16} className="text-center py-8 text-gray-500">No laundry services found.</td>
                        </tr>
                      ) : (
                        paginatedLaundryItems.map((row: any, i: number) => (
                          <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-4 py-2 font-medium text-emerald-950">{((laundryPage - 1) * ITEMS_PER_PAGE) + i + 1}</td>
                            <td className="px-4 py-2 text-emerald-700">{formatDate(row.created_at)}</td>
                            <td className="px-4 py-2 text-emerald-800 font-medium">{row.room}</td>
                            <td className="px-4 py-2 text-gray-500">-</td>
                            <td className="px-4 py-2 text-emerald-800 font-medium">{row.guest_name}</td>
                            <td className="px-4 py-2 text-emerald-700"><span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md border border-stone-200">{row.laundry_bag_id}</span></td>
                            <td className="px-4 py-2 text-emerald-700">{row.laundry_box_id}</td>
                            <td className="px-4 py-2 text-emerald-700">{row.services_package}</td>
                            <td className="px-4 py-2 text-emerald-700">Office Boy</td>
                            <td className="px-4 py-2 text-emerald-700">{row.drop_point}</td>
                            <td className="px-4 py-2 text-emerald-700">Dispatcher</td>
                            <td className="px-4 py-2 text-emerald-700">Laundry House</td>
                            <td className="px-4 py-2 text-emerald-700">Laundry Officer</td>
                            <td className="px-4 py-2 text-emerald-700">{formatDate(row.receiving_date) || '-'}</td>
                            <td className="px-4 py-2 text-emerald-700">{row.bag_status}</td>
                            <td className="px-4 py-2 text-center font-bold text-emerald-800 bg-emerald-50/50">{row.weight || '-'}</td>
                            <td className="px-4 py-2 text-center text-emerald-700">{row.no_of_pcs_total || '-'}</td>
                            <td className="px-4 py-2 text-emerald-700">Laundry Officer</td>
                            <td className="px-4 py-2 text-emerald-700">Dispatcher</td>
                            <td className="px-4 py-2 text-emerald-700">{row.drop_point}</td>
                            <td className="px-4 py-2 text-emerald-700">Office Boy</td>
                            <td className="px-4 py-2 text-center">
                              <span className="px-2 py-1 rounded-full text-[9px] font-bold tracking-wider bg-lime-400 text-emerald-950 shadow-sm">{row.current_status}</span>
                            </td>
                            <td className="px-4 py-2 text-emerald-700">-</td>
                            <td className="px-4 py-2 text-emerald-600">-</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-stone-50/50">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{laundryItems.length > 0 ? (laundryPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(laundryPage * ITEMS_PER_PAGE, laundryItems.length)}</span> of <span className="font-semibold">{laundryItems.length}</span> entries
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
