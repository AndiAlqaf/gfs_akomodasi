import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, MapPin, Home, BedDouble, Utensils, Shirt, Package, Users } from 'lucide-react';
import Swal from 'sweetalert2';

import { dataRegisterAPI } from '@/services/api';

export default function DataRegister() {
  const [activeTab, setActiveTab] = useState('area');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Real Data States
  const [areas, setAreas] = useState<any[]>([]);
  const [messes, setMesses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [mealsDp, setMealsDp] = useState<any[]>([]);
  const [laundryDp, setLaundryDp] = useState<any[]>([]);
  const [laundryBag, setLaundryBag] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const baseUrl = 'http://localhost/gfs_akomodasi/backend/data_register.php?action=';
      const [
        resAreas, resMesses, resRooms, resMeals, resLaundryDp, resLaundryBag, resGuests
      ] = await Promise.all([
        fetch(baseUrl + 'get_areas').then(r => r.json()),
        fetch(baseUrl + 'get_messes').then(r => r.json()),
        fetch(baseUrl + 'get_rooms').then(r => r.json()),
        fetch(baseUrl + 'get_meals_dp').then(r => r.json()),
        fetch(baseUrl + 'get_laundry_dp').then(r => r.json()),
        fetch(baseUrl + 'get_laundry_bag').then(r => r.json()),
        fetch(baseUrl + 'get_guests').then(r => r.json()),
      ]);

      setAreas(resAreas || []);
      setMesses(resMesses || []);
      setRooms(resRooms || []);
      setMealsDp(resMeals || []);
      setLaundryDp(resLaundryDp || []);
      setLaundryBag(resLaundryBag || []);
      setGuests(resGuests || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    let type = activeTab;
    if (activeTab === 'meals') type = 'meals_dp';

    try {
      await dataRegisterAPI.create(type, formData);
      setIsSaving(false);
      setIsModalOpen(false);
      setFormData({});
      fetchData(); // Refresh data
      Swal.fire({ icon: 'success', title: 'Saved!', text: 'Data saved successfully!', timer: 2000, showConfirmButton: false });
    } catch (error) {
      console.error('Failed to save data:', error);
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Failed to save data!', timer: 2000, showConfirmButton: false });
      setIsSaving(false);
    }
  };

  const renderAddForm = () => {
    return (
      <div className="grid gap-4 py-4 text-emerald-950 max-h-[60vh] overflow-y-auto px-2">
        {activeTab === 'area' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LIVING RESIDENCE 1" onChange={(e) => setFormData({...formData, area_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area ID</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LIV.RES.01" onChange={(e) => setFormData({...formData, area_id: e.target.value})} />
            </div>
          </>
        )}

        {activeTab === 'mess' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Mess Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LANDED HOUSE-01" onChange={(e) => setFormData({...formData, mess_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Mess ID</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. CMP.MES.LH.01" onChange={(e) => setFormData({...formData, mess_id: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, area_id: e.target.value})}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Managed By</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. PT. CMP" onChange={(e) => setFormData({...formData, managed_by: e.target.value})} />
            </div>
          </>
        )}

        {activeTab === 'room' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room No</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LH.01.01" onChange={(e) => setFormData({...formData, room_no: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Mess</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, mess_id: e.target.value})}>
                <option value="">Select Mess</option>
                {messes.map(m => <option key={m.id} value={m.id}>{m.mess_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Allocation</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, room_allocation: e.target.value})}>
                <option value="">Select Allocation</option>
                <option value="REGULAR GUEST">Regular Guest</option>
                <option value="SPECIAL GUEST">Special Guest</option>
                <option value="EXECUTIVE/VIPs GUEST">Executive/VIPs Guest</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Beds</Label>
              <Input type="number" className="col-span-3 border-emerald-200" placeholder="1" onChange={(e) => setFormData({...formData, beds: e.target.value})} />
            </div>
          </>
        )}

        {activeTab === 'meals' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Delivery Point</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. SATELIT CANTEEN" onChange={(e) => setFormData({...formData, delivery_point: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, area_id: e.target.value})}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
              </select>
            </div>
          </>
        )}

        {activeTab === 'laundry_dp' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Point Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LDP SAMAENRE" onChange={(e) => setFormData({...formData, point_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, area_id: e.target.value})}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
              </select>
            </div>
          </>
        )}

        {activeTab === 'laundry_bag' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Guest Name" onChange={(e) => setFormData({...formData, nama: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, room_id: e.target.value})}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_no}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Laundry Bag</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Bag Name/ID" onChange={(e) => setFormData({...formData, laundry_bag: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Laundry Box</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Box Name" onChange={(e) => setFormData({...formData, laundry_box: e.target.value})} />
            </div>
          </>
        )}

        {activeTab === 'guest' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Guest Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, room_id: e.target.value})}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_no}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Category</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" onChange={(e) => setFormData({...formData, occupants_category: e.target.value})}>
                <option value="REGULAR GUEST">Regular Guest</option>
                <option value="SPECIAL GUEST">Special Guest</option>
                <option value="EXECUTIVE/VIPs GUEST">Executive/VIPs Guest</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Job</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. EMPLOYEE" onChange={(e) => setFormData({...formData, job: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Position</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. MANAGER" onChange={(e) => setFormData({...formData, position: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Level</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. SENIOR STAFF" onChange={(e) => setFormData({...formData, level_category: e.target.value})} />
            </div>
          </>
        )}

        <div className="grid grid-cols-4 items-center gap-4 mt-2">
          <Label className="text-right font-medium">Remarks</Label>
          <Input className="col-span-3 border-emerald-200" placeholder="Optional remarks..." onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-700 mt-1">Sistem Informasi Layanan Akomodasi GFS Ceria</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full">
              <Plus size={18} /> Add New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-emerald-950 text-xl uppercase">Add New {activeTab.replace('_', ' ')}</DialogTitle>
            </DialogHeader>
            {renderAddForm()}
            <DialogFooter>
              <Button onClick={() => setIsModalOpen(false)} variant="outline" className="border-emerald-200 text-emerald-800" disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-950 text-stone-50 hover:bg-emerald-900" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
        <CardHeader className="bg-white border-b border-emerald-100 pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-lg text-emerald-950 uppercase">Master Data Registration</CardTitle>

          </div>
        </CardHeader>
        
        <CardContent className="p-0 bg-stone-50/30">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="p-4 overflow-x-auto border-b border-emerald-100 bg-white">
              <TabsList className="bg-stone-100 p-1.5 rounded-2xl border border-stone-200 inline-flex w-max">
                <TabsTrigger value="area" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <MapPin size={16} /> Area
                </TabsTrigger>
                <TabsTrigger value="mess" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <Home size={16} /> Mess
                </TabsTrigger>
                <TabsTrigger value="room" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <BedDouble size={16} /> Room
                </TabsTrigger>
                <TabsTrigger value="meals" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <Utensils size={16} /> Meals Drop Point
                </TabsTrigger>
                <TabsTrigger value="laundry_dp" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <Shirt size={16} /> Laundry Drop & Delivery Point 
                </TabsTrigger>
                <TabsTrigger value="laundry_bag" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <Package size={16} /> Laundry Bag & Box
                </TabsTrigger>
                <TabsTrigger value="guest" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <Users size={16} /> Guest
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* TAB A: AREA */}
              <TabsContent value="area" className="m-0 animate-fade-in">
                <div className="bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">NO</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">AREA ID</th>
                        <th className="px-6 py-4">REGISTERED BY</th>
                        <th className="px-6 py-4">LAST REGISTRATION</th>
                        <th className="px-6 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {areas.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 text-center font-medium text-emerald-950">{idx + 1}</td>
                          <td className="px-6 py-3 text-emerald-800 font-medium">{row.area_name}</td>
                          <td className="px-6 py-3 text-emerald-700">{row.area_id}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.registered_by}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.last_registration}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB B: MESS */}
              <TabsContent value="mess" className="m-0 animate-fade-in">
                <div className="bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center">NO</th>
                        <th className="px-4 py-4">MESS</th>
                        <th className="px-4 py-4">MESS ID</th>
                        <th className="px-4 py-4">AREA</th>
                        <th className="px-4 py-4 text-center">ROOMS</th>
                        <th className="px-4 py-4">MESS STATUS</th>
                        <th className="px-4 py-4">MANAGED BY</th>
                        <th className="px-4 py-4">REGISTERED BY</th>
                        <th className="px-4 py-4">LAST REGISTRATION</th>
                        <th className="px-4 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {messes.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{idx + 1}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium">{row.mess_name}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.mess_id}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.area_name}</td>
                          <td className="px-4 py-3 text-center text-emerald-900 font-medium">{row.rooms_count}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.mess_status}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.managed_by}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.registered_by}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.last_registration}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB C: ROOM */}
              <TabsContent value="room" className="m-0 animate-fade-in">
                <div className="bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center">NO</th>
                        <th className="px-4 py-4">ROOM NO</th>
                        <th className="px-4 py-4">MESS</th>
                        <th className="px-4 py-4">MESS ID</th>
                        <th className="px-4 py-4">ROOM ALLOCATION</th>
                        <th className="px-4 py-4 text-center">BEDS</th>
                        <th className="px-4 py-4">ROOM STATUS</th>
                        <th className="px-4 py-4">REGISTERED BY</th>
                        <th className="px-4 py-4">LAST REG.</th>
                        <th className="px-4 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {rooms.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{idx + 1}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium">{row.room_no}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.mess_name}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.mess_id_str}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.room_allocation}</td>
                          <td className="px-4 py-3 text-center text-emerald-900 font-medium">{row.beds}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-900">{row.room_status}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.registered_by}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.last_registration}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB D: MEALS DELIVERY POINT */}
              <TabsContent value="meals" className="m-0 animate-fade-in">
                <div className="bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">NO</th>
                        <th className="px-6 py-4">DELIVERY POINT</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">CANTEEN STATUS</th>
                        <th className="px-6 py-4">REGISTERED BY</th>
                        <th className="px-6 py-4">LAST REGISTRATION</th>
                        <th className="px-6 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {mealsDp.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 text-center font-medium text-emerald-950">{idx + 1}</td>
                          <td className="px-6 py-3 text-emerald-800 font-medium">{row.delivery_point}</td>
                          <td className="px-6 py-3 text-emerald-700">{row.area_name}</td>
                          <td className="px-6 py-3 font-semibold text-emerald-900">{row.canteen_status}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.registered_by}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.last_registration}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB E: LAUNDRY DELIVERY POINT */}
              <TabsContent value="laundry_dp" className="m-0 animate-fade-in">
                <div className="bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">NO</th>
                        <th className="px-6 py-4">POINT</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">DP STATUS</th>
                        <th className="px-6 py-4">REGISTERED BY</th>
                        <th className="px-6 py-4">LAST REGISTRATION</th>
                        <th className="px-6 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {laundryDp.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 text-center font-medium text-emerald-950">{idx + 1}</td>
                          <td className="px-6 py-3 text-emerald-800 font-medium">{row.point_name}</td>
                          <td className="px-6 py-3 text-emerald-700">{row.area_name}</td>
                          <td className="px-6 py-3 font-semibold text-emerald-900">{row.dp_status}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.registered_by}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.last_registration}</td>
                          <td className="px-6 py-3 text-emerald-600">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB F: LAUNDRY BAG & BOX */}
              <TabsContent value="laundry_bag" className="m-0 animate-fade-in">
                <div className="bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center">NO</th>
                        <th className="px-4 py-4">NAMA</th>
                        <th className="px-4 py-4">ROOM</th>
                        <th className="px-4 py-4">LAUNDRY BAG</th>
                        <th className="px-4 py-4">LAUNDRY BOX</th>
                        <th className="px-4 py-4">REGISTERED BY</th>
                        <th className="px-4 py-4">LAST REGISTRATION</th>
                        <th className="px-4 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {laundryBag.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{idx + 1}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium">{row.nama}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.room_no}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.laundry_bag}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.laundry_box}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.registered_by}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.last_registration}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB G: GUEST */}
              <TabsContent value="guest" className="m-0 animate-fade-in">
                <div className="bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center">NO</th>
                        <th className="px-4 py-4">ROOM NO</th>
                        <th className="px-4 py-4">MESS</th>
                        <th className="px-4 py-4">NAME</th>
                        <th className="px-4 py-4">PERSONAL IDENTIFICATION</th>
                        <th className="px-4 py-4">REG. ID CARD</th>
                        <th className="px-4 py-4">JOB</th>
                        <th className="px-4 py-4">POSITION</th>
                        <th className="px-4 py-4">LEVEL CATEGORY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {guests.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{idx + 1}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium">{row.room_no}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.mess_name}</td>
                          <td className="px-4 py-3 text-emerald-900 font-bold">{row.name}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.personal_identification}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.reg_id_card}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.job}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.position}</td>
                          <td className="px-4 py-3 text-emerald-900 font-semibold">{row.level_category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
