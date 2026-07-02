import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laundryAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Swal from 'sweetalert2';
import { CheckCircle, Truck, Package, RotateCcw, Box, UserCheck, Plus, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Role = 'office_boy' | 'dispatcher' | 'officer';

const Laundry: React.FC = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<Role>('office_boy');
  
  // States for Office Boy Drop Form
  const [room, setRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [bagId, setBagId] = useState('');
  const [boxId, setBoxId] = useState('');
  const [pkg, setPkg] = useState('Regular');
  const [dropPoint, setDropPoint] = useState('');

  // States for Officer Receiving
  const [weightInput, setWeightInput] = useState<{ [key: string]: string }>({});

  // States for Officer Details Form
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<any>(null);
  const [clothesList, setClothesList] = useState<any[]>([]);

  const { data: laundryResponse, isLoading } = useQuery({
    queryKey: ['laundry'],
    queryFn: laundryAPI.getAll
  });

  const transactions = laundryResponse?.data?.data || [];

  // Derived state for Dispatcher (Groups by Box ID)
  const boxes = transactions.reduce((acc: any, tx: any) => {
    if (!acc[tx.laundry_box_id]) {
      acc[tx.laundry_box_id] = {
        boxId: tx.laundry_box_id,
        dropPoint: tx.drop_point,
        deliverDate: tx.deliver_date,
        returnDate: tx.return_date,
        bagsCount: 0,
        statusSet: new Set()
      };
    }
    acc[tx.laundry_box_id].bagsCount++;
    acc[tx.laundry_box_id].statusSet.add(tx.current_status);
    return acc;
  }, {});

  const boxList = Object.values(boxes).map((b: any) => ({
    ...b,
    isReadyToDeliver: b.statusSet.has('DROPPED_AT_POINT') && !b.statusSet.has('DELIVERED_TO_LAUNDRY'),
    isReadyToReturn: b.statusSet.has('PROCESS_COMPLETED') || b.statusSet.has('RECEIVED_AT_LAUNDRY') // Or Rejected
  }));

  // Mutations
  const createDropMutation = useMutation({
    mutationFn: (data: any) => laundryAPI.createDrop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry'] });
      setRoom(''); setGuestName(''); setBagId(''); setBoxId(''); setDropPoint('');
      Swal.fire({ icon: 'success', title: 'Dropped!', timer: 1500, showConfirmButton: false });
    }
  });

  const actionMutation = useMutation({
    mutationFn: ({ action, id, data }: any): Promise<any> => {
      switch(action) {
        case 'deliver': return laundryAPI.deliverToLaundry(id) as Promise<any>;
        case 'receive': return laundryAPI.receiveBag({ laundry_bag_id: id, ...data }) as Promise<any>;
        case 'add_details': return laundryAPI.addDetails(data) as Promise<any>;
        case 'complete': return laundryAPI.completeProcess(id) as Promise<any>;
        case 'return': return laundryAPI.returnToDrop(id) as Promise<any>;
        case 'distribute': return laundryAPI.distributeToRoom(id) as Promise<any>;
        default: return Promise.resolve();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry'] });
      Swal.fire({ icon: 'success', title: 'Success', timer: 1500, showConfirmButton: false });
      setSelectedTxForDetails(null);
    }
  });

  const handleDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDropMutation.mutate({ room, guest_name: guestName, laundry_bag_id: bagId, laundry_box_id: boxId, services_package: pkg, drop_point: dropPoint });
  };

  const handleWeightChange = (id: string | number, value: string) => {
    setWeightInput(prev => ({ ...prev, [id]: value }));
  };

  const handleDetailsSubmit = (txId: string) => {
    if (clothesList.length === 0) return;
    actionMutation.mutate({ action: 'add_details', id: txId, data: { transaction_id: txId, details: clothesList } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-700 mt-1">Laundry Tracking System</p>
        </div>
      </div>

      <div className="glass p-2 rounded-xl flex items-center justify-start gap-2 animate-fade-in border-emerald-100 shadow-sm bg-white mb-6">
        <div className="flex w-full md:w-auto gap-2">
          <Button variant={role === 'office_boy' ? 'default' : 'outline'} className={`flex-1 md:flex-none px-6 py-6 font-bold uppercase tracking-wider ${role === 'office_boy' ? 'bg-emerald-950 text-stone-50' : 'text-emerald-800 border-emerald-200'}`} onClick={() => setRole('office_boy')}>LAUNDRY CREW</Button>
          <Button variant={role === 'dispatcher' ? 'default' : 'outline'} className={`flex-1 md:flex-none px-6 py-6 font-bold uppercase tracking-wider ${role === 'dispatcher' ? 'bg-emerald-950 text-stone-50' : 'text-emerald-800 border-emerald-200'}`} onClick={() => setRole('dispatcher')}>LAUNDRY DISPATCHER</Button>
          <Button variant={role === 'officer' ? 'default' : 'outline'} className={`flex-1 md:flex-none px-6 py-6 font-bold uppercase tracking-wider ${role === 'officer' ? 'bg-emerald-950 text-stone-50' : 'text-emerald-800 border-emerald-200'}`} onClick={() => setRole('officer')}>LAUNDRY OFFICER</Button>
        </div>
      </div>



        {/* --- OFFICE BOY TAB --- */}
        {role === 'office_boy' && (
          <div className="m-0 animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 px-2 gap-4">
              <h2 className="text-xl font-bold text-emerald-950 uppercase">LAUNDRY DROPPING & DISTRIBUTING</h2>
              
              <div className="flex items-center gap-4">
                <div className="relative w-full md:w-[300px]">
                  <Input type="text" placeholder="Search..." className="w-full pl-10 border-emerald-200 rounded-md h-10 shadow-sm focus-visible:ring-emerald-500" />
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 text-stone-50 hover:bg-emerald-700 font-bold text-xs px-6 py-5 flex flex-col leading-tight shadow-md rounded-xl">
                      <span>Drop & Distribute</span>
                      <span>Form</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-950 text-xl uppercase">Laundry Drop Form</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDropSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold">ROOM</label><Input value={room} onChange={e=>setRoom(e.target.value)} required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold">NAME</label><Input value={guestName} onChange={e=>setGuestName(e.target.value)} required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold">BAG ID</label><Input value={bagId} onChange={e=>setBagId(e.target.value)} required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold">BOX ID</label><Input value={boxId} onChange={e=>setBoxId(e.target.value)} required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold">PKG</label>
                      <select value={pkg} onChange={e=>setPkg(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"><option value="Regular">Regular</option><option value="Express">Express</option></select>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold">DROP POINT</label><Input value={dropPoint} onChange={e=>setDropPoint(e.target.value)} required /></div>
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" disabled={createDropMutation.isPending}>Add to Drop Point</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            <Card className="border border-emerald-100 shadow-sm rounded-xl overflow-hidden">
              <div className="w-full relative overflow-hidden bg-white">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">ROOM</th>
                        <th className="px-6 py-4 text-center">NAME</th>
                        <th className="px-6 py-4 text-center">LAUNDRY<br/>BAG ID</th>
                        <th className="px-6 py-4 text-center">LAUNDRY<br/>BOX</th>
                        <th className="px-6 py-4 text-center">SERVICES<br/>PACKAGES</th>
                        <th className="px-6 py-4 text-center">DROP<br/>POINT</th>
                        <th className="px-6 py-4 text-center">DROPPING<br/>DATE</th>
                        <th className="px-6 py-4 text-center">DISTRIBUTING<br/>DATE</th>
                        <th className="px-6 py-4 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {transactions.map((t: any) => (
                        <tr key={t.id} className="hover:bg-emerald-50/50 text-center">
                          <td className="px-6 py-3">{t.room}</td>
                          <td className="px-6 py-3">{t.guest_name}</td>
                          <td className="px-6 py-3 font-medium">{t.laundry_bag_id}</td>
                          <td className="px-6 py-3">{t.laundry_box_id}</td>
                          <td className="px-6 py-3">{t.services_package}</td>
                          <td className="px-6 py-3">{t.drop_point}</td>
                          <td className="px-6 py-3 text-xs">{formatDate(t.drop_date)}</td>
                          <td className="px-6 py-3 text-xs">{formatDate(t.distribute_date)}</td>
                          <td className="px-6 py-3">
                            {t.current_status === 'RETURNED_TO_DROP' ? (
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={()=>actionMutation.mutate({action:'distribute', id: t.laundry_bag_id})}>Distribute</Button>
                            ) : <span className="text-xs text-emerald-600">{t.current_status}</span>}
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-gray-500">No data found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- DISPATCHER TAB --- */}
        {role === 'dispatcher' && (
          <div className="m-0 animate-fade-in space-y-6">
            <Card className="border border-emerald-100 shadow-sm rounded-xl overflow-hidden">
               <CardHeader className="bg-white border-b border-emerald-100 py-4"><CardTitle className="text-md text-emerald-900 uppercase">Deliver & Returned Board</CardTitle></CardHeader>
               <div className="w-full relative overflow-hidden bg-white">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr><th className="px-6 py-4">LAUNDRY BOX</th><th className="px-6 py-4">BAGS</th><th className="px-6 py-4">DELIVER POINT</th><th className="px-6 py-4">DELIVER DATE</th><th className="px-6 py-4">RETURN DATE</th><th className="px-6 py-4">ACTION</th></tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {boxList.map((b: any) => (
                        <tr key={b.boxId} className="hover:bg-emerald-50/50">
                          <td className="px-6 py-3 font-bold text-emerald-900">{b.boxId}</td><td className="px-6 py-3">{b.dropPoint}</td><td className="px-6 py-3 text-emerald-600 font-mono">{b.bagsCount} bags</td>
                          <td className="px-6 py-3 text-xs">{formatDate(b.deliverDate)}</td><td className="px-6 py-3 text-xs">{formatDate(b.returnDate)}</td>
                          <td className="px-6 py-3">
                            {b.isReadyToDeliver ? (
                              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 h-7 text-xs px-3" onClick={()=>actionMutation.mutate({action:'deliver', id: b.boxId})}><Truck size={14} className="mr-1"/> To Laundry</Button>
                            ) : b.isReadyToReturn && !b.returnDate ? (
                              <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 h-7 text-xs px-3" onClick={()=>actionMutation.mutate({action:'return', id: b.boxId})}><RotateCcw size={14} className="mr-1"/> Return Box</Button>
                            ) : <span className="text-xs text-gray-500">In Process</span>}
                          </td>
                        </tr>
                      ))}
                      {boxList.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No boxes found</td></tr>}
                    </tbody>
                  </table>
                </div>
               </div>
            </Card>
          </div>
        )}

        {/* --- OFFICER TABS --- */}
        {role === 'officer' && (
          <div className="flex flex-col gap-8 w-full animate-fade-in">
            <div className="m-0 space-y-6">
            <Card className="border border-emerald-100 shadow-sm rounded-xl overflow-hidden">
               <CardHeader className="bg-white border-b border-emerald-100 py-4"><CardTitle className="text-md text-emerald-900 uppercase">Receiving Form (Status & Weight)</CardTitle></CardHeader>
               <div className="w-full relative overflow-hidden bg-white">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">LAUNDRY BAG ID</th>
                        <th className="px-6 py-4 text-center">LAUNDRY BAG STATUS</th>
                        <th className="px-6 py-4 text-center">RECEIVING DATE</th>
                        <th className="px-6 py-4 text-center">WEIGHT</th>
                        <th className="px-6 py-4 text-center">NO OF PCS</th>
                        <th className="px-6 py-4 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {transactions.filter((t:any) => t.current_status !== 'DROPPED_AT_POINT' && t.current_status !== 'RETURNED_TO_DROP' && t.current_status !== 'DISTRIBUTED_TO_ROOM').map((t: any) => (
                        <tr key={t.id} className="hover:bg-emerald-50/50 text-center">
                          <td className="px-6 py-3 font-bold text-emerald-900">{t.laundry_bag_id}</td>
                          <td className="px-6 py-3 font-semibold text-emerald-700">{t.bag_status}</td>
                          <td className="px-6 py-3 text-xs">{formatDate(t.receiving_date)}</td>
                          <td className="px-6 py-3">
                            {t.current_status === 'DELIVERED_TO_LAUNDRY' ? (
                              <div className="flex justify-center"><Input type="number" step="0.1" className="w-20 h-8 text-center" placeholder="0.0" onChange={e => handleWeightChange(t.id, e.target.value)} value={weightInput[t.id] || ''} /></div>
                            ) : <span className="font-mono">{t.weight || '-'}</span>}
                          </td>
                          <td className="px-6 py-3 font-mono">{t.no_of_pcs_total}</td>
                          <td className="px-6 py-3 text-center">
                            {t.current_status === 'DELIVERED_TO_LAUNDRY' ? (
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-7 px-2" onClick={()=>actionMutation.mutate({action:'receive', id: t.laundry_bag_id, data: { bag_status: 'Accepted', weight: weightInput[t.id] }})}>Accept</Button>
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 h-7 px-2" onClick={()=>actionMutation.mutate({action:'receive', id: t.laundry_bag_id, data: { bag_status: 'Rejected', weight: weightInput[t.id] }})}>Reject</Button>
                              </div>
                            ) : t.current_status === 'RECEIVED_AT_LAUNDRY' && t.bag_status === 'Accepted' ? (
                              <span className="text-xs text-amber-600 font-medium">Needs Details</span>
                            ) : t.current_status === 'DETAILS_ADDED' ? (
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 h-7" onClick={()=>actionMutation.mutate({action:'complete', id: t.laundry_bag_id})}>Mark Done</Button>
                            ) : <span className="text-xs text-gray-400">{t.current_status}</span>}
                          </td>
                        </tr>
                      ))}
                      {transactions.filter((t:any) => t.current_status !== 'DROPPED_AT_POINT').length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No bags arrived yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
               </div>
            </Card>
          </div>

          <div className="m-0 space-y-6">
            {!selectedTxForDetails ? (
              <Card className="border border-emerald-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-white border-b border-emerald-100 py-4"><CardTitle className="text-md text-emerald-900 uppercase">Select Bag to Add Details</CardTitle></CardHeader>
                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {transactions.filter((t:any) => t.current_status === 'RECEIVED_AT_LAUNDRY' && t.bag_status === 'Accepted').map((t:any) => (
                    <Button key={t.id} variant="outline" className="h-16 flex flex-col items-center justify-center border-emerald-200 text-emerald-800 hover:bg-emerald-50" onClick={() => { setSelectedTxForDetails(t); setClothesList([{ clothes_type: '', brand: '', colour: '', size: '', no_of_pcs: 1 }]); }}>
                      <span className="font-bold">{t.laundry_bag_id}</span>
                      <span className="text-xs text-emerald-600">{t.room} - {t.guest_name}</span>
                    </Button>
                  ))}
                  {transactions.filter((t:any) => t.current_status === 'RECEIVED_AT_LAUNDRY' && t.bag_status === 'Accepted').length === 0 && <p className="text-sm text-gray-500 col-span-full">No bags waiting for details.</p>}
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-emerald-200 shadow-sm rounded-xl overflow-hidden bg-white">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-md text-emerald-900 uppercase">Entering Details for: {selectedTxForDetails.laundry_bag_id}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTxForDetails(null)}>Cancel</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-emerald-950 text-stone-50 text-xs">
                        <tr><th className="p-3">CLOTHES TYPE</th><th className="p-3">BRAND</th><th className="p-3">COLOUR</th><th className="p-3">SIZE</th><th className="p-3 w-20">QTY</th><th className="p-3 w-10"></th></tr>
                      </thead>
                      <tbody>
                        {clothesList.map((c, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="p-2"><Input value={c.clothes_type} onChange={e => {const n=[...clothesList]; n[i].clothes_type=e.target.value; setClothesList(n)}} placeholder="Shirt, Pants..." /></td>
                            <td className="p-2"><Input value={c.brand} onChange={e => {const n=[...clothesList]; n[i].brand=e.target.value; setClothesList(n)}} placeholder="Nike..." /></td>
                            <td className="p-2"><Input value={c.colour} onChange={e => {const n=[...clothesList]; n[i].colour=e.target.value; setClothesList(n)}} placeholder="Blue..." /></td>
                            <td className="p-2"><Input value={c.size} onChange={e => {const n=[...clothesList]; n[i].size=e.target.value; setClothesList(n)}} placeholder="M, L..." /></td>
                            <td className="p-2"><Input type="number" value={c.no_of_pcs} onChange={e => {const n=[...clothesList]; n[i].no_of_pcs=e.target.value; setClothesList(n)}} min="1" /></td>
                            <td className="p-2"><Button variant="destructive" size="sm" onClick={() => {const n=[...clothesList]; n.splice(i,1); setClothesList(n)}} className="h-8 px-2">X</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 flex justify-between bg-emerald-50/20">
                    <Button variant="outline" onClick={() => setClothesList([...clothesList, { clothes_type: '', brand: '', colour: '', size: '', no_of_pcs: 1 }])}>+ Add Row</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleDetailsSubmit(selectedTxForDetails.id)}>Save & Proceed</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        )}
    </div>
  );
};
export default Laundry;
