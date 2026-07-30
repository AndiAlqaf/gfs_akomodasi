import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laundryAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Swal from 'sweetalert2';
import { Truck, RotateCcw, Search, Plus, Shirt, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAppStore } from '@/stores/useAppStore';
import { ROLE_PERMISSIONS, hasPermission } from '@/config/roles';

const Laundry: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAppStore();

  const canInsertDrop = hasPermission(user?.role, ROLE_PERMISSIONS.laundry.droppingInsert);
  const canInsertDeliver = hasPermission(user?.role, ROLE_PERMISSIONS.laundry.deliveringInsert);
  const canInsertReceive = hasPermission(user?.role, ROLE_PERMISSIONS.laundry.receivingInsert);

  const [activeTab, setActiveTab] = useState('dropping');

  const [room, setRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [bagId, setBagId] = useState('');
  const [boxId, setBoxId] = useState('');
  const [pkg, setPkg] = useState('Regular');
  const [dropPoint, setDropPoint] = useState('');

  // States for Dispatcher Form
  const [dispBox, setDispBox] = useState('');
  const [dispBags, setDispBags] = useState('');
  const [dispPoint, setDispPoint] = useState('');
  const [dispDeliverDate, setDispDeliverDate] = useState('');
  const [dispReturnDate, setDispReturnDate] = useState('');
  const [dispAction, setDispAction] = useState('DELIVERED');

  // States for Officer Form
  const [offBagId, setOffBagId] = useState('');
  const [offBagStatus, setOffBagStatus] = useState('ACCEPTED');
  const [offRecvDate, setOffRecvDate] = useState('');
  const [offWeight, setOffWeight] = useState('');
  const [offPcs, setOffPcs] = useState('');
  const [offAction, setOffAction] = useState('PROCEED');

  const [weightInput, setWeightInput] = useState<{ [key: string]: string }>({});
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<any | null>(null);
  const [clothesList, setClothesList] = useState<any[]>([]);

  // Fetch Laundry Data
  const { data: laundryDataResp } = useQuery({
    queryKey: ['laundry_data'],
    queryFn: () => laundryAPI.getData(),
  });

  const transactions = laundryDataResp?.data?.data || laundryDataResp?.data || [];

  // Derive boxList from transactions grouped by laundry_box_id
  const boxList = React.useMemo(() => {
    const boxMap: Record<string, any> = {};
    (transactions as any[]).forEach((t: any) => {
      const key = t.laundry_box_id;
      if (!boxMap[key]) {
        boxMap[key] = {
          boxId: key,
          dropPoint: t.drop_point,
          bagsCount: 0,
          deliverDate: t.deliver_date,
          returnDate: t.return_date,
          isReadyToDeliver: false,
          isReadyToReturn: false,
          bags: [],
        };
      }
      boxMap[key].bagsCount += 1;
      boxMap[key].bags.push(t);
      // If any bag in this box is DROPPED_AT_POINT, box is ready to deliver
      if (t.current_status === 'DROPPED_AT_POINT') boxMap[key].isReadyToDeliver = true;
      // If all bags are PROCESS_COMPLETED or bag_status Rejected, box is ready to return
      const allDone = boxMap[key].bags.every((b: any) => b.current_status === 'PROCESS_COMPLETED' || b.bag_status === 'Rejected');
      if (allDone && boxMap[key].bags.length > 0) boxMap[key].isReadyToReturn = true;
      if (t.deliver_date) boxMap[key].deliverDate = t.deliver_date;
      if (t.return_date) boxMap[key].returnDate = t.return_date;
    });
    return Object.values(boxMap);
  }, [transactions]);

  const createDropMutation = useMutation({
    mutationFn: (data: any) => laundryAPI.createDrop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry_data'] });
      Swal.fire({ icon: 'success', title: 'Success!', text: 'Laundry Drop Record Created!', timer: 2000, showConfirmButton: false });
      setRoom(''); setGuestName(''); setBagId(''); setBoxId(''); setDropPoint('');
    }
  });

  const actionMutation = useMutation({
    mutationFn: ({ action, id, data }: any) => laundryAPI.updateAction(action, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry_data'] });
      Swal.fire({ icon: 'success', title: 'Action Updated!', timer: 1500, showConfirmButton: false });
      setSelectedTxForDetails(null);
    }
  });

  const handleDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDropMutation.mutate({ room, guest_name: guestName, laundry_bag_id: bagId, laundry_box_id: boxId, services_package: pkg, drop_point: dropPoint });
  };

  const handleDispatcherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dispAction === 'DELIVERED') {
      actionMutation.mutate({ action: 'deliver', id: dispBox });
    } else {
      actionMutation.mutate({ action: 'return', id: dispBox });
    }
  };

  const handleOfficerDetailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (offAction === 'PROCEED') {
      actionMutation.mutate({ action: 'receive', id: offBagId, data: { bag_status: offBagStatus, weight: offWeight } });
    } else {
      actionMutation.mutate({ action: 'complete', id: offBagId });
    }
  };

  const handleWeightChange = (id: string | number, value: string) => {
    setWeightInput(prev => ({ ...prev, [id]: value }));
  };

  const handleDetailsSubmit = (txId: string) => {
    if (clothesList.length === 0) return;
    actionMutation.mutate({ action: 'add_details', id: txId, data: { transaction_id: txId, details: clothesList } });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-full min-w-0 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
        <TabsList className="mb-4 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 inline-flex shadow-sm shrink-0 w-max">
          <TabsTrigger value="dropping" className="rounded-xl px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
            <Shirt size={16} /> DROPPING & DISTRIBUTING
          </TabsTrigger>
          <TabsTrigger value="delivering" className="rounded-xl px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
            <Truck size={16} /> DELIVERING & RETURNING
          </TabsTrigger>
          <TabsTrigger value="receiving" className="rounded-xl px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
            <Package size={16} /> RECEIVING & CLEANING
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: DROPPING & DISTRIBUTING --- */}
        <TabsContent value="dropping" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Tabel Dropping & Distributing</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input placeholder="Search..." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                </div>
                {canInsertDrop && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full">
                        <Plus size={18} /> Drop & Distribute Form
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <DialogHeader>
                        <DialogTitle className="text-emerald-950 text-xl uppercase">Laundry Drop Form</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleDropSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><label className="text-xs font-semibold">ROOM</label><Input value={room} onChange={e => setRoom(e.target.value)} required /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold">NAME</label><Input value={guestName} onChange={e => setGuestName(e.target.value)} required /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold">BAG ID</label><Input value={bagId} onChange={e => setBagId(e.target.value)} required /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold">BOX ID</label><Input value={boxId} onChange={e => setBoxId(e.target.value)} required /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold">PKG</label>
                          <select value={pkg} onChange={e => setPkg(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"><option value="Regular">Regular</option><option value="Express">Express</option></select>
                        </div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold">DROP POINT</label><Input value={dropPoint} onChange={e => setDropPoint(e.target.value)} required /></div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" disabled={createDropMutation.isPending}>Add to Drop Point</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden ">
              <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">ROOM</th>
                        <th className="px-3 py-3 text-center">NAME</th>
                        <th className="px-3 py-3 text-center">LAUNDRY BAG ID</th>
                        <th className="px-3 py-3 text-center">LAUNDRY BOX</th>
                        <th className="px-3 py-3 text-center">SERVICES PACKAGES</th>
                        <th className="px-3 py-3 text-center">DROP POINT</th>
                        <th className="px-3 py-3 text-center">DROPPING DATE</th>
                        <th className="px-3 py-3 text-center">DISTRIBUTING DATE</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {transactions.map((t: any) => (
                        <tr key={t.id} className="hover:bg-emerald-50/50 text-center">
                          <td className="px-1 py-1">{t.room}</td>
                          <td className="px-1 py-1">{t.guest_name}</td>
                          <td className="px-1 py-1 font-medium">{t.laundry_bag_id}</td>
                          <td className="px-1 py-1">{t.laundry_box_id}</td>
                          <td className="px-1 py-1">{t.services_package}</td>
                          <td className="px-1 py-1">{t.drop_point}</td>
                          <td className="px-1 py-1 text-xs">{formatDate(t.drop_date)}</td>
                          <td className="px-1 py-1 text-xs">{formatDate(t.distribute_date)}</td>
                          <td className="px-1 py-1">
                            {t.current_status === 'RETURNED_TO_DROP' ? (
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => actionMutation.mutate({ action: 'distribute', id: t.laundry_bag_id })}>Distribute</Button>
                            ) : <span className="text-xs text-emerald-600 font-semibold">{t.current_status}</span>}
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-gray-500">No data found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: DELIVERING & RETURNING --- */}
        <TabsContent value="delivering" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Tabel Delivering & Returning</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input placeholder="Search..." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                </div>
                {canInsertDeliver && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full">
                        <Plus size={18} /> Deliver & Return Form
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                        <DialogTitle className="text-emerald-950 text-xl uppercase">Laundry Delivering & Returning Form</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleDispatcherSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Laundry Box</label><Input value={dispBox} onChange={e => setDispBox(e.target.value)} required /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Bags</label><Input value={dispBags} onChange={e => setDispBags(e.target.value)} /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Deliver Point</label><Input value={dispPoint} onChange={e => setDispPoint(e.target.value)} /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Delivering Date</label><Input type="date" value={dispDeliverDate} onChange={e => setDispDeliverDate(e.target.value)} /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Returning Date</label><Input type="date" value={dispReturnDate} onChange={e => setDispReturnDate(e.target.value)} /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Action</label>
                          <select value={dispAction} onChange={e => setDispAction(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="RETURNED">RETURNED</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" disabled={actionMutation.isPending}>Submit Form</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden ">
              <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr><th className="px-3 py-3">LAUNDRY BOX</th><th className="px-3 py-3">BAGS</th><th className="px-3 py-3">DELIVER POINT</th><th className="px-3 py-3">DELIVER DATE</th><th className="px-3 py-3">RETURN DATE</th><th className="px-3 py-3">ACTION</th></tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {boxList.map((b: any) => (
                        <tr key={b.boxId} className="hover:bg-emerald-50/50">
                          <td className="px-1 py-1 font-bold text-emerald-900">{b.boxId}</td><td className="px-1 py-1">{b.dropPoint}</td><td className="px-1 py-1 text-emerald-600 font-mono">{b.bagsCount} bags</td>
                          <td className="px-1 py-1 text-xs">{formatDate(b.deliverDate)}</td><td className="px-1 py-1 text-xs">{formatDate(b.returnDate)}</td>
                          <td className="px-1 py-1">
                            {b.isReadyToDeliver ? (
                              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 h-7 text-xs px-3" onClick={() => actionMutation.mutate({ action: 'deliver', id: b.boxId })}><Truck size={14} className="mr-1" /> To Laundry</Button>
                            ) : b.isReadyToReturn && !b.returnDate ? (
                              <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 h-7 text-xs px-3" onClick={() => actionMutation.mutate({ action: 'return', id: b.boxId })}><RotateCcw size={14} className="mr-1" /> Return Box</Button>
                            ) : <span className="text-xs text-gray-500 font-medium">In Process</span>}
                          </td>
                        </tr>
                      ))}
                      {boxList.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No boxes found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: RECEIVING & CLEANING --- */}
        <TabsContent value="receiving" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
          <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
            <CardHeader className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg text-emerald-950 uppercase font-bold">Tabel Receiving & Cleaning</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input placeholder="Search..." className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                </div>
                {canInsertReceive && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full">
                        <Plus size={18} /> Laundry Detail Form
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                        <DialogTitle className="text-emerald-950 text-xl uppercase">Laundry Receiving Form</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleOfficerDetailSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Laundry Bag ID</label><Input value={offBagId} onChange={e => setOffBagId(e.target.value)} required /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Laundry Bag Status</label>
                          <select value={offBagStatus} onChange={e => setOffBagStatus(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Receiving Date</label><Input type="date" value={offRecvDate} onChange={e => setOffRecvDate(e.target.value)} /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Weight</label><Input value={offWeight} onChange={e => setOffWeight(e.target.value)} placeholder="0.0" type="number" step="0.1" /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">No of Pcs</label><Input value={offPcs} onChange={e => setOffPcs(e.target.value)} type="number" /></div>
                        <div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Action</label>
                          <select value={offAction} onChange={e => setOffAction(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                            <option value="PROCEED">PROCEED</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" disabled={actionMutation.isPending}>Submit Form</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden  space-y-4">
              <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
                <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">LAUNDRY BAG ID</th>
                        <th className="px-3 py-3 text-center">LAUNDRY BAG STATUS</th>
                        <th className="px-3 py-3 text-center">RECEIVING DATE</th>
                        <th className="px-3 py-3 text-center">WEIGHT</th>
                        <th className="px-3 py-3 text-center">NO OF PCS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {transactions.filter((t: any) => t.current_status !== 'DROPPED_AT_POINT' && t.current_status !== 'RETURNED_TO_DROP' && t.current_status !== 'DISTRIBUTED_TO_ROOM').map((t: any) => (
                        <tr key={t.id} className="hover:bg-emerald-50/50 text-center">
                          <td className="px-1 py-1 font-bold text-emerald-900">{t.laundry_bag_id}</td>
                          <td className="px-1 py-1 font-semibold text-emerald-700">{t.bag_status}</td>
                          <td className="px-1 py-1 text-xs">{formatDate(t.receiving_date)}</td>
                          <td className="px-1 py-1">
                            {t.current_status === 'DELIVERED_TO_LAUNDRY' ? (
                              <div className="flex justify-center"><Input type="number" step="0.1" className="w-20 h-8 text-center" placeholder="0.0" onChange={e => handleWeightChange(t.id, e.target.value)} value={weightInput[t.id] || ''} /></div>
                            ) : <span className="font-mono">{t.weight || '-'}</span>}
                          </td>
                          <td className="px-1 py-1 font-mono">{t.no_of_pcs_total}</td>
                          <td className="px-1 py-1 text-center">
                            {t.current_status === 'DELIVERED_TO_LAUNDRY' ? (
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-7 px-2" onClick={() => actionMutation.mutate({ action: 'receive', id: t.laundry_bag_id, data: { bag_status: 'Accepted', weight: weightInput[t.id] } })}>Accept</Button>
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 h-7 px-2" onClick={() => actionMutation.mutate({ action: 'receive', id: t.laundry_bag_id, data: { bag_status: 'Rejected', weight: weightInput[t.id] } })}>Reject</Button>
                              </div>
                            ) : t.current_status === 'RECEIVED_AT_LAUNDRY' && t.bag_status === 'Accepted' ? (
                              <span className="text-xs text-amber-600 font-medium">Needs Details</span>
                            ) : t.current_status === 'DETAILS_ADDED' ? (
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 h-7" onClick={() => actionMutation.mutate({ action: 'complete', id: t.laundry_bag_id })}>Mark Done</Button>
                            ) : <span className="text-xs text-gray-400">{t.current_status}</span>}
                          </td>
                        </tr>
                      ))}
                      {transactions.filter((t: any) => t.current_status !== 'DROPPED_AT_POINT').length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No bags arrived yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {!selectedTxForDetails ? (
                <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm p-4">
                  <p className="text-xs font-bold text-emerald-950 uppercase mb-2">Select Bag to Add Item Details:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {transactions.filter((t: any) => t.current_status === 'RECEIVED_AT_LAUNDRY' && t.bag_status === 'Accepted').map((t: any) => (
                      <Button key={t.id} variant="outline" className="h-14 flex flex-col items-center justify-center border-emerald-200 text-emerald-800 hover:bg-emerald-50" onClick={() => { setSelectedTxForDetails(t); setClothesList([{ clothes_type: '', brand: '', colour: '', size: '', no_of_pcs: 1 }]); }}>
                        <span className="font-bold text-xs">{t.laundry_bag_id}</span>
                        <span className="text-[10px] text-emerald-600">{t.room} - {t.guest_name}</span>
                      </Button>
                    ))}
                    {transactions.filter((t: any) => t.current_status === 'RECEIVED_AT_LAUNDRY' && t.bag_status === 'Accepted').length === 0 && <p className="text-xs text-gray-500 col-span-full">No bags waiting for item details.</p>}
                  </div>
                </div>
              ) : (
                <div className="w-full bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                  <div className="bg-emerald-50/60 border-b border-emerald-100 px-4 py-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-950 uppercase">Entering Clothes Details for: {selectedTxForDetails.laundry_bag_id}</p>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTxForDetails(null)} className="h-7 text-xs">Cancel</Button>
                  </div>
                  <div className="p-3">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-emerald-950 text-stone-50 uppercase">
                        <tr><th className="p-2">CLOTHES TYPE</th><th className="p-2">BRAND</th><th className="p-2">COLOUR</th><th className="p-2">SIZE</th><th className="p-2 w-20">QTY</th><th className="p-2 w-10"></th></tr>
                      </thead>
                      <tbody>
                        {clothesList.map((c, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="p-1.5"><Input value={c.clothes_type} onChange={e => { const n = [...clothesList]; n[i].clothes_type = e.target.value; setClothesList(n) }} placeholder="Shirt, Pants..." className="h-8 text-xs" /></td>
                            <td className="p-1.5"><Input value={c.brand} onChange={e => { const n = [...clothesList]; n[i].brand = e.target.value; setClothesList(n) }} placeholder="Brand..." className="h-8 text-xs" /></td>
                            <td className="p-1.5"><Input value={c.colour} onChange={e => { const n = [...clothesList]; n[i].colour = e.target.value; setClothesList(n) }} placeholder="Colour..." className="h-8 text-xs" /></td>
                            <td className="p-1.5"><Input value={c.size} onChange={e => { const n = [...clothesList]; n[i].size = e.target.value; setClothesList(n) }} placeholder="M, L..." className="h-8 text-xs" /></td>
                            <td className="p-1.5"><Input type="number" value={c.no_of_pcs} onChange={e => { const n = [...clothesList]; n[i].no_of_pcs = e.target.value; setClothesList(n) }} min="1" className="h-8 text-xs" /></td>
                            <td className="p-1.5"><Button variant="destructive" size="sm" onClick={() => { const n = [...clothesList]; n.splice(i, 1); setClothesList(n) }} className="h-7 px-2 text-xs">X</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pt-3 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => setClothesList([...clothesList, { clothes_type: '', brand: '', colour: '', size: '', no_of_pcs: 1 }])} className="text-xs">+ Add Row</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold" onClick={() => handleDetailsSubmit(selectedTxForDetails.id)}>Save & Proceed</Button>
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

export default Laundry;
