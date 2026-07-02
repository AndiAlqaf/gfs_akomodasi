import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsAPI, informationAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Plus, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

const Meals: React.FC = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'canteen_officer' | 'canteen_supervisor'>('canteen_officer');
  
  // Form state
  const [guestName, setGuestName] = useState('');
  const [mealsPackage, setMealsPackage] = useState('');
  const [deliveryPointId, setDeliveryPointId] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [noOfPacks, setNoOfPacks] = useState('1');
  const [remark, setRemark] = useState('');

  // Search states
  const [requestSearch, setRequestSearch] = useState('');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [deliverySearch, setDeliverySearch] = useState('');

  // Pagination states
  const [requestPage, setRequestPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const [deliveryPage, setDeliveryPage] = useState(1);

  const { data: scheduleResp, isLoading: scheduleLoading } = useQuery({
    queryKey: ['meals-schedule'],
    queryFn: mealsAPI.getSchedule,
  });

  const { data: requestResp, isLoading: requestLoading } = useQuery({
    queryKey: ['meals-requests'],
    queryFn: mealsAPI.getRequests,
  });

  const { data: dpResp } = useQuery({
    queryKey: ['meals-dp'],
    queryFn: mealsAPI.getDeliveryPoints,
  });

  const { data: deliveryResp, isLoading: deliveryLoading } = useQuery({
    queryKey: ['meals-delivery-info'],
    queryFn: informationAPI.getMeals,
  });

  const createRequestMutation = useMutation({
    mutationFn: (data: any) => mealsAPI.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals-requests'] });
      setGuestName('');
      setMealsPackage('');
      setDeliveryPointId('');
      setMealTime('');
      setNoOfPacks('1');
      setRemark('');
    }
  });

  const approveRequestMutation = useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) => mealsAPI.approveRequest(id, approvedBy),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals-requests'] })
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !mealsPackage || !deliveryPointId || !mealTime) return;
    createRequestMutation.mutate({
      guest_name: guestName,
      request_by: 'Canteen Officer A', // Simulated name
      meals_package: mealsPackage,
      delivery_point_id: parseInt(deliveryPointId),
      meal_time: mealTime,
      no_of_packs: parseInt(noOfPacks),
      remark
    });
  };

  const requestsData = requestResp?.data?.data || [];
  const scheduleData = scheduleResp?.data?.data || [];
  const deliveryPoints = dpResp?.data?.data || [];
  const deliveryData = deliveryResp?.data?.data || [];

  const filteredRequests = requestsData.filter((r: any) => Object.values(r).some(v => String(v).toLowerCase().includes(requestSearch.toLowerCase())));
  const filteredSchedule = scheduleData.filter((r: any) => Object.values(r).some(v => String(v).toLowerCase().includes(scheduleSearch.toLowerCase())));
  const filteredDelivery = deliveryData.filter((r: any) => Object.values(r).some(v => String(v).toLowerCase().includes(deliverySearch.toLowerCase())));

  const reqTotalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const paginatedRequests = filteredRequests.slice((requestPage - 1) * ITEMS_PER_PAGE, requestPage * ITEMS_PER_PAGE);

  const schedTotalPages = Math.max(1, Math.ceil(filteredSchedule.length / ITEMS_PER_PAGE));
  const paginatedSchedule = filteredSchedule.slice((schedulePage - 1) * ITEMS_PER_PAGE, schedulePage * ITEMS_PER_PAGE);

  const deliveryTotalPages = Math.max(1, Math.ceil(filteredDelivery.length / ITEMS_PER_PAGE));
  const paginatedDelivery = filteredDelivery.slice((deliveryPage - 1) * ITEMS_PER_PAGE, deliveryPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-700 mt-1">Meals Request and Schedule Dashboard</p>
        </div>
      </div>

      <div className="glass p-4 rounded-xl flex items-center gap-4 animate-fade-in border-emerald-100 shadow-sm bg-white">
        <span className="font-semibold text-emerald-800">Simulate Role:</span>
        <div className="flex gap-2">
          <Button 
            variant={role === 'canteen_officer' ? 'default' : 'outline'}
            className={role === 'canteen_officer' ? 'bg-emerald-950 text-stone-50 hover:bg-emerald-900' : 'text-emerald-800 border-emerald-200 hover:bg-emerald-50'}
            onClick={() => setRole('canteen_officer')}
          >
            Canteen Officer
          </Button>
          <Button 
            variant={role === 'canteen_supervisor' ? 'default' : 'outline'}
            className={role === 'canteen_supervisor' ? 'bg-emerald-950 text-stone-50 hover:bg-emerald-900' : 'text-emerald-800 border-emerald-200 hover:bg-emerald-50'}
            onClick={() => setRole('canteen_supervisor')}
          >
            Canteen Supervisor
          </Button>
        </div>
      </div>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl border border-stone-200 inline-flex shadow-sm">
          <TabsTrigger value="request" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-6 py-2.5 font-medium">Meals on Request</TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-6 py-2.5 font-medium">Meals on Schedule</TabsTrigger>
          <TabsTrigger value="delivery" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-6 py-2.5 font-medium">Meals for Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="m-0 animate-fade-in">
          <div className="space-y-6">
            <div className="flex justify-end items-center gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                <Input placeholder="Search..." value={requestSearch} onChange={e => {setRequestSearch(e.target.value); setRequestPage(1);}} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
              </div>
              {role === 'canteen_officer' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-950 text-stone-50 hover:bg-emerald-900 shadow-sm font-bold flex items-center gap-2 px-6 rounded-full">
                      <Plus size={18} /> Meals Request Form
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="text-emerald-950 text-xl uppercase">Meals Request Form</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-900">GUEST / EVENT NAME</label>
                        <Input value={guestName} onChange={e => setGuestName(e.target.value)} required placeholder="e.g. Tamu Perusahaan" className="bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-900">MEALS PACKAGES</label>
                        <select 
                          value={mealsPackage} 
                          onChange={e => setMealsPackage(e.target.value)} 
                          required 
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>Select Package</option>
                          <option value="Standard Buffet">Standard Buffet</option>
                          <option value="VIP Buffet">VIP Buffet</option>
                          <option value="Room Delivery">Room Delivery</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-900">DELIVERY POINT</label>
                        <select 
                          value={deliveryPointId} 
                          onChange={e => setDeliveryPointId(e.target.value)} 
                          required 
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>Select Delivery Point</option>
                          {deliveryPoints.map((dp: any) => (
                            <option key={dp.id} value={dp.id.toString()}>{dp.delivery_point}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-900">MEAL TIME</label>
                        <select 
                          value={mealTime} 
                          onChange={e => setMealTime(e.target.value)} 
                          required 
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>Select Meal Time</option>
                          <option value="BREAKFAST">Breakfast</option>
                          <option value="LUNCH">Lunch</option>
                          <option value="DINNER">Dinner</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-900">NO OF PACKS</label>
                        <Input type="number" min="1" value={noOfPacks} onChange={e => setNoOfPacks(e.target.value)} required className="bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-900">REMARK</label>
                        <Input value={remark} onChange={e => setRemark(e.target.value)} placeholder="Optional remark" className="bg-white" />
                      </div>
                      <div className="md:col-span-2 flex justify-end mt-2">
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8" disabled={createRequestMutation.isPending}>
                          Submit Request
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <Card className="border border-emerald-100 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-emerald-100 py-4">
                <CardTitle className="text-md text-emerald-900 uppercase">Tabel Meals on Request</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {requestLoading ? (
                  <div className="text-center py-8 text-emerald-600">Loading requests...</div>
                ) : (
                  <div className="w-full relative overflow-hidden bg-white">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                        <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                          <tr>
                            <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>NO</th>
                            <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>DATE</th>
                            <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>GUESTS</th>
                            <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>REQUEST BY</th>
                            <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>APPROVED BY</th>
                            <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>MEALS PACKAGES</th>
                            <th className="px-6 py-3 border-b border-emerald-900 text-center border-l border-emerald-800" colSpan={3}>DELIVERY POINT</th>
                            <th className="px-6 py-3 border-b border-emerald-900 text-center border-l border-emerald-800" colSpan={3}>NO OF PACK</th>
                            <th className="px-6 py-4 border-b border-emerald-900 text-center border-l border-emerald-800" rowSpan={2}>ACTION</th>
                          </tr>
                          <tr className="bg-emerald-900/50">
                            <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">BREAKFAST</th>
                            <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">LUNCH</th>
                            <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">DINNER</th>
                            <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">BREAKFAST</th>
                            <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">LUNCH</th>
                            <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">DINNER</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                          {paginatedRequests.map((req: any, idx: number) => (
                            <tr key={req.id} className="hover:bg-emerald-50/50 transition-colors">
                              <td className="px-6 py-3 text-center font-medium text-emerald-950">{((requestPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                              <td className="px-6 py-3 text-center text-emerald-700">{formatDate(req.date)}</td>
                              <td className="px-6 py-3 font-semibold text-emerald-900">{req.guest_name}</td>
                              <td className="px-6 py-3 text-center text-emerald-700">{req.request_by}</td>
                              <td className="px-6 py-3 text-center text-emerald-700">{req.approved_by || '-'}</td>
                              <td className="px-6 py-3 text-center">
                                <span className="bg-stone-100 text-emerald-800 border border-stone-200 px-2 py-1 rounded text-xs font-medium">{req.meals_package}</span>
                              </td>
                              
                              <td className="px-4 py-3 text-center text-xs text-emerald-700 border-l border-emerald-50">{req.meal_time === 'BREAKFAST' ? req.delivery_point : '-'}</td>
                              <td className="px-4 py-3 text-center text-xs text-emerald-700 border-l border-emerald-50">{req.meal_time === 'LUNCH' ? req.delivery_point : '-'}</td>
                              <td className="px-4 py-3 text-center text-xs text-emerald-700 border-l border-emerald-50">{req.meal_time === 'DINNER' ? req.delivery_point : '-'}</td>
                              
                              <td className="px-4 py-3 text-center font-mono font-medium text-emerald-800 border-l border-emerald-50 bg-emerald-50/30">{req.meal_time === 'BREAKFAST' ? req.no_of_packs : '-'}</td>
                              <td className="px-4 py-3 text-center font-mono font-medium text-emerald-800 border-l border-emerald-50 bg-emerald-50/30">{req.meal_time === 'LUNCH' ? req.no_of_packs : '-'}</td>
                              <td className="px-4 py-3 text-center font-mono font-medium text-emerald-800 border-l border-emerald-50 bg-emerald-50/30">{req.meal_time === 'DINNER' ? req.no_of_packs : '-'}</td>
                              
                              <td className="px-6 py-3 text-center border-l border-emerald-50">
                                {req.status === 'PENDING' ? (
                                  role === 'canteen_supervisor' ? (
                                    <Button size="sm" className="bg-lime-500 hover:bg-lime-600 text-emerald-950 font-bold px-4 h-7 text-xs" onClick={() => approveRequestMutation.mutate({id: req.id, approvedBy: 'Supervisor S'})}>
                                      <CheckCircle size={14} className="mr-1" /> Approve
                                    </Button>
                                  ) : (
                                    <span className="text-amber-600 font-semibold text-xs bg-amber-50 px-2 py-1 rounded border border-amber-200">PENDING</span>
                                  )
                                ) : (
                                  <span className="text-emerald-700 font-bold text-xs bg-lime-100 px-2 py-1 rounded border border-lime-200">APPROVED</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {paginatedRequests.length === 0 && (
                            <tr><td colSpan={14} className="text-center py-8 text-emerald-600">No requests found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50">
                      <div className="text-sm text-emerald-800">
                        Showing <span className="font-semibold">{filteredRequests.length > 0 ? (requestPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(requestPage * ITEMS_PER_PAGE, filteredRequests.length)}</span> of <span className="font-semibold">{filteredRequests.length}</span> entries
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setRequestPage(p => Math.max(p - 1, 1))} disabled={requestPage === 1}>Previous</Button>
                        {Array.from({ length: reqTotalPages }, (_, i) => i + 1).map(p => (
                          <Button key={p} variant={requestPage === p ? 'default' : 'outline'} size="sm" onClick={() => setRequestPage(p)} className={requestPage === p ? 'bg-emerald-600 text-white' : ''}>{p}</Button>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setRequestPage(p => Math.min(p + 1, reqTotalPages))} disabled={requestPage === reqTotalPages}>Next</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="m-0 animate-fade-in">
          <Card className="border border-emerald-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-emerald-100 py-4">
              <CardTitle className="text-md text-emerald-900 uppercase flex items-center justify-between">
                <div>
                  Tabel Meals on Schedule
                  <span className="text-xs font-normal text-emerald-600 normal-case bg-stone-100 px-3 py-1 rounded-full border border-stone-200 ml-2">
                    Auto-updated daily based on On-Site Guests
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input placeholder="Search..." value={scheduleSearch} onChange={e => {setScheduleSearch(e.target.value); setSchedulePage(1);}} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {scheduleLoading ? (
                <div className="text-center py-8 text-emerald-600">Loading schedule...</div>
              ) : (
                <div className="w-full relative overflow-hidden bg-white">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>ROOM</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>MESS</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>NAME</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center" rowSpan={2}>MEALS PACKAGES</th>
                          <th className="px-6 py-3 border-b border-emerald-900 text-center border-l border-emerald-800" colSpan={3}>DELIVERY POINT</th>
                        </tr>
                        <tr className="bg-emerald-900/50">
                          <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">BREAKFAST</th>
                          <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">LUNCH</th>
                          <th className="px-4 py-2 text-center text-[10px] tracking-wider border-l border-emerald-800">DINNER</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedSchedule.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-6 py-3 font-semibold text-emerald-950">{row.room}</td>
                            <td className="px-6 py-3 text-emerald-700">{row.mess}</td>
                            <td className="px-6 py-3 font-medium text-emerald-900">{row.name}</td>
                            <td className="px-6 py-3 text-center">
                              <span className="bg-stone-100 text-emerald-800 border border-stone-200 px-2 py-1 rounded text-xs font-medium">{row.meals_packages}</span>
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-emerald-700 border-l border-emerald-50 bg-emerald-50/20">{row.breakfast_dp || '-'}</td>
                            <td className="px-4 py-3 text-center text-xs text-emerald-700 border-l border-emerald-50 bg-emerald-50/20">{row.lunch_dp || '-'}</td>
                            <td className="px-4 py-3 text-center text-xs text-emerald-700 border-l border-emerald-50 bg-emerald-50/20">{row.dinner_dp || '-'}</td>
                          </tr>
                        ))}
                        {paginatedSchedule.length === 0 && (
                          <tr><td colSpan={8} className="text-center py-8 text-emerald-600">No scheduled meals found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{filteredSchedule.length > 0 ? (schedulePage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(schedulePage * ITEMS_PER_PAGE, filteredSchedule.length)}</span> of <span className="font-semibold">{filteredSchedule.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSchedulePage(p => Math.max(p - 1, 1))} disabled={schedulePage === 1}>Previous</Button>
                      {Array.from({ length: schedTotalPages }, (_, i) => i + 1).map(p => (
                        <Button key={p} variant={schedulePage === p ? 'default' : 'outline'} size="sm" onClick={() => setSchedulePage(p)} className={schedulePage === p ? 'bg-emerald-600 text-white' : ''}>{p}</Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setSchedulePage(p => Math.min(p + 1, schedTotalPages))} disabled={schedulePage === schedTotalPages}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="m-0 animate-fade-in">
          <Card className="border border-emerald-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-emerald-100 py-4">
              <CardTitle className="text-md text-emerald-900 uppercase flex items-center justify-between">
                <div>
                  Tabel Meals for Delivery
                  <span className="text-xs font-normal text-emerald-600 normal-case bg-stone-100 px-3 py-1 rounded-full border border-stone-200 ml-2">
                    Aggregated from Schedule and Approved Requests
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input placeholder="Search..." value={deliverySearch} onChange={e => {setDeliverySearch(e.target.value); setDeliveryPage(1);}} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {deliveryLoading ? (
                <div className="text-center py-8 text-emerald-600">Loading delivery info...</div>
              ) : (
                <div className="w-full relative overflow-hidden bg-white">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">NO</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">DATE</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">MEALS PACKAGES</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">MEALS DELIVERY POINT</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">AREA</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">MEAL TIME</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">NO OF PACKS</th>
                          <th className="px-6 py-4 border-b border-emerald-900 text-center">ACCOMODATION STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedDelivery.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-6 py-3 font-semibold text-emerald-950 text-center">{((deliveryPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                            <td className="px-6 py-3 text-emerald-700 text-center">{new Date().toISOString().split('T')[0]}</td>
                            <td className="px-6 py-3 font-medium text-emerald-900">{row.meals_packages}</td>
                            <td className="px-6 py-3 text-emerald-800">{row.delivery_point}</td>
                            <td className="px-6 py-3 text-gray-500 text-center">{row.area}</td>
                            <td className="px-6 py-3 text-emerald-700 font-medium text-center">{row.meal_time}</td>
                            <td className="px-6 py-3 text-center font-bold text-lg text-emerald-800 bg-emerald-50/50 border-x border-emerald-100">{row.no_of_packs}</td>
                            <td className="px-6 py-3 text-emerald-700 text-center">{row.accommodation_status}</td>
                          </tr>
                        ))}
                        {paginatedDelivery.length === 0 && (
                          <tr><td colSpan={9} className="text-center py-8 text-emerald-600">No delivery info found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50">
                    <div className="text-sm text-emerald-800">
                      Showing <span className="font-semibold">{filteredDelivery.length > 0 ? (deliveryPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(deliveryPage * ITEMS_PER_PAGE, filteredDelivery.length)}</span> of <span className="font-semibold">{filteredDelivery.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDeliveryPage(p => Math.max(p - 1, 1))} disabled={deliveryPage === 1}>Previous</Button>
                      {Array.from({ length: deliveryTotalPages }, (_, i) => i + 1).map(p => (
                        <Button key={p} variant={deliveryPage === p ? 'default' : 'outline'} size="sm" onClick={() => setDeliveryPage(p)} className={deliveryPage === p ? 'bg-emerald-600 text-white' : ''}>{p}</Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setDeliveryPage(p => Math.min(p + 1, deliveryTotalPages))} disabled={deliveryPage === deliveryTotalPages}>Next</Button>
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

export default Meals;
