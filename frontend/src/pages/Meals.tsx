import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsAPI, informationAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CheckCircle, Plus, Search, Truck, Utensils } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { HighlightText } from '@/components/ui/HighlightText';

import { useAppStore } from '@/stores/useAppStore';
import { ROLE_PERMISSIONS, hasPermission } from '@/config/roles';

const ITEMS_PER_PAGE = 20;

const Meals: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAppStore();

  const canInsertRequest = hasPermission(user?.role, ROLE_PERMISSIONS.meals.requestInsert);
  const canActionApprove = hasPermission(user?.role, ROLE_PERMISSIONS.meals.requestAction);

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
    queryFn: informationAPI.getMealsDelivery,
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
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-full min-w-0 overflow-hidden">
      <Tabs defaultValue="request" className="w-full flex flex-col flex-1 min-h-0">
        <TabsList className="mb-4 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 inline-flex shadow-sm shrink-0 w-max">
          <TabsTrigger value="request" className="rounded-xl px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
            <Utensils size={16} /> MEALS ON REQUEST
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-xl px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
            <Calendar size={16} /> MEALS ON SCHEDULE
          </TabsTrigger>
          <TabsTrigger value="delivery" className="rounded-xl px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
            <Truck size={16} /> MEALS FOR DELIVERY
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Tabel Meals on Request</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <Input placeholder="Search..." value={requestSearch} onChange={e => { setRequestSearch(e.target.value); setRequestPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setRequestPage(1)}>Search</Button>
                </div>
                {canInsertRequest && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full">
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
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden ">
                {requestLoading ? (
                  <div className="text-center py-8 text-emerald-600">Loading requests...</div>
                ) : (
                  <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                    <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                      <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                        <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-1 border-b border-emerald-900 text-center w-16" rowSpan={2}>NO</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>DATE</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>GUESTS</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>REQUEST BY</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>APPROVED BY</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>MEALS PACKAGES</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center border-l border-emerald-800" colSpan={3}>DELIVERY POINT</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center border-l border-emerald-800" colSpan={3}>NO OF PACK</th>
                            <th className="px-1 py-1 border-b border-emerald-900 text-center border-l border-emerald-800" rowSpan={2}>ACTION</th>
                          </tr>
                          <tr className="bg-emerald-900/50">
                            <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">BREAKFAST</th>
                            <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">LUNCH</th>
                            <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">DINNER</th>
                            <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">BREAKFAST</th>
                            <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">LUNCH</th>
                            <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">DINNER</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                          {paginatedRequests.map((req: any, idx: number) => (
                            <tr key={req.id} className="hover:bg-emerald-50/50 transition-colors">
                              <td className="px-4 py-1 text-center font-medium text-emerald-950">{((requestPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                              <td className="px-1 py-1 text-center text-emerald-700">{formatDate(req.date)}</td>
                              <td className="px-1 py-1 font-semibold text-emerald-900"><HighlightText text={req.guest_name} highlight={requestSearch} /></td>
                              <td className="px-1 py-1 text-center text-emerald-700"><HighlightText text={req.request_by} highlight={requestSearch} /></td>
                              <td className="px-1 py-1 text-center text-emerald-700"><HighlightText text={req.approved_by || "-"} highlight={requestSearch} /></td>
                              <td className="px-1 py-1 text-center">
                                <span className="bg-stone-100 text-emerald-800 border border-stone-200 px-2 py-1 rounded text-xs font-medium"><HighlightText text={req.meals_package} highlight={requestSearch} /></span>
                              </td>

                              <td className="px-1 py-1 text-center text-xs text-emerald-700 border-l border-emerald-50">{req.meal_time === 'BREAKFAST' ? req.delivery_point : '-'}</td>
                              <td className="px-1 py-1 text-center text-xs text-emerald-700 border-l border-emerald-50">{req.meal_time === 'LUNCH' ? req.delivery_point : '-'}</td>
                              <td className="px-1 py-1 text-center text-xs text-emerald-700 border-l border-emerald-50">{req.meal_time === 'DINNER' ? req.delivery_point : '-'}</td>

                              <td className="px-1 py-1 text-center font-mono font-medium text-emerald-800 border-l border-emerald-50 bg-emerald-50/30">{req.meal_time === 'BREAKFAST' ? req.no_of_packs : '-'}</td>
                              <td className="px-1 py-1 text-center font-mono font-medium text-emerald-800 border-l border-emerald-50 bg-emerald-50/30">{req.meal_time === 'LUNCH' ? req.no_of_packs : '-'}</td>
                              <td className="px-1 py-1 text-center font-mono font-medium text-emerald-800 border-l border-emerald-50 bg-emerald-50/30">{req.meal_time === 'DINNER' ? req.no_of_packs : '-'}</td>

                                <td className="px-1 py-1 text-center border-l border-emerald-50">
                                  {req.status === 'PENDING' ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="text-amber-600 font-semibold text-xs bg-amber-50 px-2.5 py-1 rounded border border-amber-200">PENDING</span>
                                      {canActionApprove && (
                                        <Button size="sm" className="bg-lime-500 hover:bg-lime-600 text-emerald-950 font-bold px-3 h-7 text-xs shadow-sm" onClick={() => approveRequestMutation.mutate({ id: req.id, approvedBy: user?.name || 'Supervisor' })}>
                                          <CheckCircle size={14} className="mr-1" /> Approve
                                        </Button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-emerald-700 font-bold text-xs bg-lime-100 px-2.5 py-1 rounded border border-lime-200">APPROVED</span>
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
                    <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
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
        </TabsContent>

        <TabsContent value="schedule" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Tabel Meals on Schedule</CardTitle>
                <span className="text-xs font-normal text-emerald-700 normal-case bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  Auto-updated daily based on On-Site Guests
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <Input placeholder="Search..." value={scheduleSearch} onChange={e => { setScheduleSearch(e.target.value); setSchedulePage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setSchedulePage(1)}>Search</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden ">
              {scheduleLoading ? (
                <div className="text-center py-8 text-emerald-600">Loading schedule...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                  <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-1 border-b border-emerald-900 text-center w-16" rowSpan={2}>NO</th>
                          <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>DATE</th>
                          <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>ROOM</th>
                          <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>MESS</th>
                          <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>NAME</th>
                          <th className="px-1 py-1 border-b border-emerald-900 text-center" rowSpan={2}>MEALS PACKAGES</th>
                          <th className="px-1 py-1 border-b border-emerald-900 text-center border-l border-emerald-800" colSpan={3}>DELIVERY POINT</th>
                        </tr>
                        <tr className="bg-emerald-900/50">
                          <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">BREAKFAST</th>
                          <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">LUNCH</th>
                          <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">DINNER</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedSchedule.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-emerald-50/50 transition-colors text-center">
                            <td className="px-4 py-1 text-center font-medium text-emerald-950">{((schedulePage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                            <td className="px-1 py-1 text-emerald-700">{row.date ? new Date(row.date).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true }) : new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                            <td className="px-1 py-1 font-semibold text-emerald-950 text-left">{row.room}</td>
                            <td className="px-1 py-1 text-emerald-700 text-left">{row.mess}</td>
                            <td className="px-1 py-1 font-medium text-emerald-900 text-left">{row.name}</td>
                            <td className="px-1 py-1 text-center">
                              <span className="bg-stone-100 text-emerald-800 border border-stone-200 px-2 py-1 rounded text-xs font-medium">{row.meals_packages}</span>
                            </td>
                            <td className="px-1 py-1 text-center text-xs text-emerald-700 border-l border-emerald-50 bg-emerald-50/20">{row.breakfast_dp || '-'}</td>
                            <td className="px-1 py-1 text-center text-xs text-emerald-700 border-l border-emerald-50 bg-emerald-50/20">{row.lunch_dp || '-'}</td>
                            <td className="px-1 py-1 text-center text-xs text-emerald-700 border-l border-emerald-50 bg-emerald-50/20">{row.dinner_dp || '-'}</td>
                          </tr>
                        ))}
                        {paginatedSchedule.length === 0 && (
                          <tr><td colSpan={10} className="text-center py-8 text-emerald-600">No scheduled meals found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
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

        <TabsContent value="delivery" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Tabel Meals for Delivery</CardTitle>
                <span className="text-xs font-normal text-emerald-700 normal-case bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  Aggregated from Schedule and Approved Requests
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <Input placeholder="Search..." value={deliverySearch} onChange={e => { setDeliverySearch(e.target.value); setDeliveryPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setDeliveryPage(1)}>Search</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden ">
              {deliveryLoading ? (
                <div className="text-center py-8 text-emerald-600">Loading delivery info...</div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                  <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                    <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                      <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 border-b border-emerald-900 text-center w-16">NO</th>
                          <th className="px-3 py-3 border-b border-emerald-900 text-center">DATE</th>
                          <th className="px-3 py-3 border-b border-emerald-900 text-center">MEALS PACKAGES</th>
                          <th className="px-3 py-3 border-b border-emerald-900 text-center">MEALS DELIVERY POINT</th>
                          <th className="px-3 py-3 border-b border-emerald-900 text-center">AREA</th>
                          <th className="px-3 py-3 border-b border-emerald-900 text-center">MEAL TIME</th>
                          <th className="px-3 py-3 border-b border-emerald-900 text-center">NO OF PACKS</th>
                          <th className="px-3 py-3 border-b border-emerald-900 text-center">ACCOMODATION STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {paginatedDelivery.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-4 py-1 text-center font-semibold text-emerald-950">{((deliveryPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                            <td className="px-1 py-1 text-emerald-700 text-center">{formatDate(row.date)}</td>
                            <td className="px-1 py-1 font-medium text-emerald-900">{row.meals_packages}</td>
                            <td className="px-1 py-1 text-emerald-800">{row.delivery_point}</td>
                            <td className="px-1 py-1 text-gray-500 text-center">{row.area}</td>
                            <td className="px-1 py-1 text-emerald-700 font-medium text-center">{row.meal_time}</td>
                            <td className="px-1 py-1 text-center font-bold text-lg text-emerald-800 bg-emerald-50/50 border-x border-emerald-100">{row.no_of_packs}</td>
                            <td className="px-1 py-1 text-emerald-700 text-center">{row.accommodation_status}</td>
                          </tr>
                        ))}
                        {paginatedDelivery.length === 0 && (
                          <tr><td colSpan={9} className="text-center py-8 text-emerald-600">No delivery info found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
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
