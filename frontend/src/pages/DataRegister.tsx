import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, MapPin, Home, BedDouble, Utensils, Shirt, Package, Users, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Swal from 'sweetalert2';

import { dataRegisterAPI, API_BASE_URL } from '@/services/api';

export default function DataRegister() {
  const [activeTab, setActiveTab] = useState('area');
  const [searchTerm, setSearchTerm] = useState('');
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
  const [meetingRooms, setMeetingRooms] = useState<any[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
  }, [activeTab]);

  const getCurrentData = () => {
    let data: any[] = [];
    switch (activeTab) {
      case 'area': data = areas; break;
      case 'mess': data = messes; break;
      case 'room': data = rooms; break;
      case 'meeting_room': data = meetingRooms; break;
      case 'meals': data = mealsDp; break;
      case 'laundry_dp': data = laundryDp; break;
      case 'laundry_bag': data = laundryBag; break;
      case 'guest': data = guests; break;
      default: data = []; break;
    }
    
    if (searchTerm) {
      return data.filter((item: any) => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    return data;
  };

  const getCardTitle = () => {
    switch (activeTab) {
      case 'area': return 'AREA';
      case 'mess': return 'MESS';
      case 'room': return 'BEDROOM';
      case 'meeting_room': return 'MEETING ROOM';
      case 'meals': return 'MEALS DROP POINT';
      case 'laundry_dp': return 'LAUNDRY DROP & DELIVERY POINT';
      case 'laundry_bag': return 'LAUNDRY BAG & BOX';
      case 'guest': return 'GUEST REGISTER';
      default: return 'DATA REGISTER';
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage) || 1;
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRowIndex = (idx: number) => (currentPage - 1) * itemsPerPage + idx + 1;

  const fetchData = async () => {
    try {
      const baseUrl = `${API_BASE_URL}/data_register.php?action=`;
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

        {activeTab === 'meeting_room' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Meeting Room</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. TAMBORASI" onChange={(e) => setFormData({...formData, meeting_room: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room ID</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. CMP-MR-01" onChange={(e) => setFormData({...formData, room_id: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Building</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. OFFICE U" onChange={(e) => setFormData({...formData, building: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Capacity</Label>
              <Input type="number" className="col-span-3 border-emerald-200" placeholder="10" onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
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
              <Label className="text-right font-medium">Inst/Company</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. PT. CMP" onChange={(e) => setFormData({...formData, institution_company: e.target.value})} />
            </div>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Meals Pkg</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. STANDARD BUFFET" onChange={(e) => setFormData({...formData, meals_packages: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Breakfast DP</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. SATELIT CANTEEN" onChange={(e) => setFormData({...formData, breakfast_dp: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Lunch DP</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. OFFICE U SMELTER CANTEEN" onChange={(e) => setFormData({...formData, lunch_dp: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Dinner DP</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. SATELIT CANTEEN" onChange={(e) => setFormData({...formData, dinner_dp: e.target.value})} />
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
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
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
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full">
        <CardHeader className="bg-white border-b border-emerald-100 pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-lg text-emerald-950 uppercase">{getCardTitle()}</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
              <Input placeholder="Search..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
            </div>
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
                  <BedDouble size={16} /> Bedroom
                </TabsTrigger>
                <TabsTrigger value="meeting_room" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                  <Users size={16} /> Meeting Room
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
                <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">NO</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">AREA ID</th>
                        <th className="px-6 py-4">REGISTERED BY</th>
                        <th className="px-6 py-4">LAST REGISTERED</th>
                        <th className="px-6 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
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
                <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
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
                        <th className="px-4 py-4">LAST REGISTERED</th>
                        <th className="px-4 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
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
                <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center">NO</th>
                        <th className="px-4 py-4">ROOM NO</th>
                        <th className="px-4 py-4">MESS</th>
                        <th className="px-4 py-4">ROOM ALLOCATION</th>
                        <th className="px-4 py-4 text-center">BEDS</th>
                        <th className="px-4 py-4">ROOM STATUS</th>
                        <th className="px-4 py-4">REGISTERED BY</th>
                        <th className="px-4 py-4">LAST REGISTERED</th>
                        <th className="px-4 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium">{row.room_no}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.mess_name}</td>
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

              {/* TAB H: MEETING ROOM */}
              <TabsContent value="meeting_room" className="m-0 animate-fade-in">
                <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center">NO</th>
                        <th className="px-4 py-4">MEETING ROOM</th>
                        <th className="px-4 py-4">ROOM ID</th>
                        <th className="px-4 py-4">BUILDING</th>
                        <th className="px-4 py-4 text-center">CAPACITY</th>
                        <th className="px-4 py-4">ROOM STATUS</th>
                        <th className="px-4 py-4">REGISTERED BY</th>
                        <th className="px-4 py-4">LAST REGISTERED</th>
                        <th className="px-4 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium">{row.meeting_room}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.room_id}</td>
                          <td className="px-4 py-3 text-emerald-800">{row.building}</td>
                          <td className="px-4 py-3 text-center text-emerald-900 font-medium">{row.capacity}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-900">{row.room_status || 'READY'}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.registered_by || 'Admin'}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.last_registration || new Date().toISOString().split('T')[0]}</td>
                          <td className="px-4 py-3 text-emerald-600">{row.remarks}</td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr><td colSpan={9} className="text-center py-8 text-gray-500">No meeting rooms found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB D: MEALS DELIVERY POINT */}
              <TabsContent value="meals" className="m-0 animate-fade-in">
                <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">NO</th>
                        <th className="px-6 py-4">DELIVERY POINT</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">CANTEEN STATUS</th>
                        <th className="px-6 py-4">REGISTERED BY</th>
                        <th className="px-6 py-4">LAST REGISTERED</th>
                        <th className="px-6 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
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
                <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-center">NO</th>
                        <th className="px-6 py-4">POINT</th>
                        <th className="px-6 py-4">AREA</th>
                        <th className="px-6 py-4">DP STATUS</th>
                        <th className="px-6 py-4">REGISTERED BY</th>
                        <th className="px-6 py-4">LAST REGISTERED</th>
                        <th className="px-6 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-3 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
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
                <div className="w-full bg-white rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center">NO</th>
                        <th className="px-4 py-4">NAMA</th>
                        <th className="px-4 py-4">ROOM</th>
                        <th className="px-4 py-4">LAUNDRY BAG</th>
                        <th className="px-4 py-4">LAUNDRY BOX</th>
                        <th className="px-4 py-4">REGISTERED BY</th>
                        <th className="px-4 py-4">LAST REGISTERED</th>
                        <th className="px-4 py-4">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
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
              <TabsContent value="guest" className="m-0 animate-fade-in w-full max-w-full overflow-hidden">
                <div className="w-full bg-white max-w-full rounded-xl border border-emerald-100 overflow-x-auto shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-4 text-center border border-emerald-900" rowSpan={2}>NO</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>ROOM NO</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>MESS</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>NAME</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>PERSONAL ID</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>REG. ID CARD</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>JOB</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>POSITION</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>LEVEL CATEGORY</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>INSTITUTION/<br/>COMPANY</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>GUEST CATEGORY</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>MEALS PACKAGES</th>
                        <th className="px-4 py-2 text-center border border-emerald-900" colSpan={3}>MEALS DELIVERY POINT</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>REGISTERED BY</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>LAST REGISTERED</th>
                        <th className="px-4 py-4 border border-emerald-900" rowSpan={2}>REMARKS</th>
                      </tr>
                      <tr>
                        <th className="px-4 py-2 text-center border border-emerald-900">BREAKFAST</th>
                        <th className="px-4 py-2 text-center border border-emerald-900">LUNCH</th>
                        <th className="px-4 py-2 text-center border border-emerald-900">DINNER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-emerald-950 border border-emerald-100">{getRowIndex(idx)}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium border border-emerald-100">{row.room_no}</td>
                          <td className="px-4 py-3 text-emerald-700 border border-emerald-100">{row.mess_name}</td>
                          <td className="px-4 py-3 text-emerald-900 font-bold border border-emerald-100">{row.name}</td>
                          <td className="px-4 py-3 text-emerald-600 border border-emerald-100">{row.personal_identification || '-'}</td>
                          <td className="px-4 py-3 text-emerald-600 border border-emerald-100">{row.reg_id_card || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 border border-emerald-100">{row.job || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 border border-emerald-100">{row.position || '-'}</td>
                          <td className="px-4 py-3 text-emerald-900 font-semibold border border-emerald-100">{row.level_category || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium border border-emerald-100">{row.institution_company || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 font-medium border border-emerald-100">{row.occupants_category || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 border border-emerald-100">{row.meals_packages || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 border border-emerald-100">{row.breakfast_dp || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 border border-emerald-100">{row.lunch_dp || '-'}</td>
                          <td className="px-4 py-3 text-emerald-800 border border-emerald-100">{row.dinner_dp || '-'}</td>
                          <td className="px-4 py-3 text-emerald-600 border border-emerald-100">{row.registered_by || '-'}</td>
                          <td className="px-4 py-3 text-emerald-600 border border-emerald-100">{row.last_registration ? new Date(row.last_registration).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-3 text-emerald-600 border border-emerald-100">{row.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-emerald-100 bg-white flex items-center justify-between rounded-b-xl">
            <div className="text-sm text-emerald-600">
              Showing <span className="font-medium text-emerald-950">{currentData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-emerald-950">{Math.min(currentPage * itemsPerPage, currentData.length)}</span> of <span className="font-medium text-emerald-950">{currentData.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-emerald-200 text-emerald-800"
              >
                <ChevronLeft size={16} /> Previous
              </Button>
              <div className="text-sm font-medium text-emerald-950 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-emerald-200 text-emerald-800"
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
