import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, MapPin, Home, BedDouble, Utensils, Shirt, Package, Users, ChevronLeft, ChevronRight, Search, Edit, Trash2 } from 'lucide-react';
import { HighlightText } from '@/components/ui/HighlightText';
import Swal from 'sweetalert2';

import { dataRegisterAPI } from '@/services/api';
import { useAppStore } from '@/stores/useAppStore';
import { ROLE_PERMISSIONS, hasPermission } from '@/config/roles';

export default function DataRegister() {
  const { user } = useAppStore();
  const canInsert = hasPermission(user?.role, ROLE_PERMISSIONS.dataRegister.insert);

  const [activeTab, setActiveTab] = useState('area');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
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
  const itemsPerPage = 20;

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
      const [
        resAreas, resMesses, resRooms, resMeals, resLaundryDp, resLaundryBag, resGuests, resMeetingRooms
      ] = await Promise.all([
        dataRegisterAPI.getAreas(),
        dataRegisterAPI.getMesses(),
        dataRegisterAPI.getRooms(),
        dataRegisterAPI.getMealsDp(),
        dataRegisterAPI.getLaundryDp(),
        dataRegisterAPI.getLaundryBag(),
        dataRegisterAPI.getGuests(),
        dataRegisterAPI.getMeetingRooms(),
      ]);

      setAreas(resAreas.data?.data || []);
      setMesses(resMesses.data?.data || []);
      setRooms(resRooms.data?.data || []);
      setMealsDp(resMeals.data?.data || []);
      setLaundryDp(resLaundryDp.data?.data || []);
      setLaundryBag(resLaundryBag.data?.data || []);
      setGuests(resGuests.data?.data || []);
      setMeetingRooms(resMeetingRooms.data?.data || []);
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
      if (editingId) {
        await dataRegisterAPI.update(type, editingId, formData);
      } else {
        await dataRegisterAPI.create(type, formData);
      }
      setIsSaving(false);
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({});
      fetchData(); // Refresh data
      Swal.fire({ icon: 'success', title: 'Saved!', text: 'Data saved successfully!', timer: 2000, showConfirmButton: false });
    } catch (error) {
      console.error('Failed to save data:', error);
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Failed to save data!', timer: 2000, showConfirmButton: false });
      setIsSaving(false);
    }
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    const data = { ...row };
    if (activeTab === 'meeting_room') {
      data.meeting_room = row.room;
      data.room_id = 'MR-' + row.id?.toString().padStart(3, '0');
      data.room_status = row.status;
    }
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this entry?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#065f46',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      let type = activeTab;
      if (activeTab === 'meals') type = 'meals_dp';
      try {
        await dataRegisterAPI.delete(type, row.id);
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Entry has been deleted.', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete entry.', timer: 1500, showConfirmButton: false });
      }
    }
  };

  const renderAddForm = () => {
    return (
      <div className="grid gap-4 py-4 text-emerald-950 max-h-[60vh] overflow-y-auto px-2">
        {activeTab === 'area' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LIVING RESIDENCE 1" value={formData.area_name ?? ''} onChange={(e) => setFormData({ ...formData, area_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area ID</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LIV.RES.01" value={formData.area_id ?? ''} onChange={(e) => setFormData({ ...formData, area_id: e.target.value })} />
            </div>
          </>
        )}

        {activeTab === 'mess' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Mess Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LANDED HOUSE-01" value={formData.mess_name ?? ''} onChange={(e) => setFormData({ ...formData, mess_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Mess ID</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. CMP.MES.LH.01" value={formData.mess_id ?? ''} onChange={(e) => setFormData({ ...formData, mess_id: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.area_id ?? ''} onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Managed By</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. PT. CMP" value={formData.managed_by ?? ''} onChange={(e) => setFormData({ ...formData, managed_by: e.target.value })} />
            </div>
          </>
        )}

        {activeTab === 'room' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room No</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LH.01.01" value={formData.room_no ?? ''} onChange={(e) => setFormData({ ...formData, room_no: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Mess</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.mess_id ?? ''} onChange={(e) => setFormData({ ...formData, mess_id: e.target.value })}>
                <option value="">Select Mess</option>
                {messes.map(m => <option key={m.id} value={m.id}>{m.mess_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Allocation</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.room_allocation ?? ''} onChange={(e) => setFormData({ ...formData, room_allocation: e.target.value })}>
                <option value="">Select Allocation</option>
                <option value="REGULAR GUEST">REGULAR GUEST</option>
                <option value="SPECIAL GUEST">SPECIAL GUEST</option>
                <option value="EXECUTIVE/VIPs GUEST">EXECUTIVE/VIPs GUEST</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Beds</Label>
              <Input type="number" className="col-span-3 border-emerald-200" placeholder="1" value={formData.beds ?? ''} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Status</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.room_status ?? 'READY'} onChange={(e) => setFormData({ ...formData, room_status: e.target.value })}>
                <option value="READY">READY</option>
                <option value="UNDER REPAIRED">UNDER REPAIRED</option>
                <option value="OUT OF ORDER">OUT OF ORDER</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'meeting_room' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Meeting Room</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. TAMBORASI" value={formData.meeting_room ?? ''} onChange={(e) => setFormData({ ...formData, meeting_room: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room ID</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. CMP-MR-01" value={formData.room_id ?? ''} onChange={(e) => setFormData({ ...formData, room_id: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Building</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. OFFICE U" value={formData.building ?? ''} onChange={(e) => setFormData({ ...formData, building: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Capacity</Label>
              <Input type="number" className="col-span-3 border-emerald-200" placeholder="10" value={formData.capacity ?? ''} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room Status</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.room_status ?? ''} onChange={(e) => setFormData({ ...formData, room_status: e.target.value })}>
                <option value="">Select Status</option>
                <option value="Ready">Ready</option>
                <option value="Under Repaired">Under Repaired</option>
                <option value="Out of Order">Out of Order</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Remarks</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Optional remarks..." value={formData.remarks ?? ''} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
            </div>
          </>
        )}

        {activeTab === 'meals' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Delivery Point</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. SATELIT CANTEEN" value={formData.delivery_point ?? ''} onChange={(e) => setFormData({ ...formData, delivery_point: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.area_id ?? ''} onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Canteen Status</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.canteen_status ?? ''} onChange={(e) => setFormData({ ...formData, canteen_status: e.target.value })}>
                <option value="">Select Status</option>
                <option value="Ready">Ready</option>
                <option value="Under Repaired">Under Repaired</option>
                <option value="Out of Order">Out of Order</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'laundry_dp' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Point Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. LDP SAMAENRE" value={formData.point_name ?? ''} onChange={(e) => setFormData({ ...formData, point_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Area</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.area_id ?? ''} onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium leading-tight">Drop & Delivery Point Status</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.dp_status ?? ''} onChange={(e) => setFormData({ ...formData, dp_status: e.target.value })}>
                <option value="">Select Status</option>
                <option value="Ready">Ready</option>
                <option value="Under Repaired">Under Repaired</option>
                <option value="Out of Order">Out of Order</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'laundry_bag' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Guest Name" value={formData.nama ?? ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.room_id ?? ''} onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_no}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Laundry Bag</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Bag Name/ID" value={formData.laundry_bag ?? ''} onChange={(e) => setFormData({ ...formData, laundry_bag: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Laundry Box</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Box Name" value={formData.laundry_box ?? ''} onChange={(e) => setFormData({ ...formData, laundry_box: e.target.value })} />
            </div>
          </>
        )}

        {activeTab === 'guest' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Inst/Company</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. PT. CMP" value={formData.institution_company ?? ''} onChange={(e) => setFormData({ ...formData, institution_company: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Name</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="Guest Name" value={formData.name ?? ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Personal ID</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.personal_identification ?? ''} onChange={(e) => setFormData({ ...formData, personal_identification: e.target.value })}>
                <option value="">Select ID Type</option>
                <option value="RESIDENCE CARD (NIK)">RESIDENCE CARD (NIK)</option>
                <option value="DRIVING LICENSE">DRIVING LICENSE</option>
                <option value="EMPLOYEE BADGE">EMPLOYEE BADGE</option>
                <option value="PASSPORT">PASSPORT</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Room</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.room_id ?? ''} onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_no}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Category</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.occupants_category ?? ''} onChange={(e) => setFormData({ ...formData, occupants_category: e.target.value })}>
                <option value="REGULAR GUEST">REGULAR GUEST</option>
                <option value="SPECIAL GUEST">SPECIAL GUEST</option>
                <option value="EXECUTIVE/VIPs GUEST">EXECUTIVE/VIPs GUEST</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Job</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.job ?? ''} onChange={(e) => setFormData({ ...formData, job: e.target.value })}>
                <option value="">Select Job</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
                <option value="GOVERNMENT OFFICER">GOVERNMENT OFFICER</option>
                <option value="CONSULTANT">CONSULTANT</option>
                <option value="CONTRACTOR">CONTRACTOR</option>
                <option value="OTHERS">OTHERS</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Position</Label>
              <Input className="col-span-3 border-emerald-200" placeholder="e.g. MANAGER" value={formData.position ?? ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Level</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.level_category ?? ''} onChange={(e) => setFormData({ ...formData, level_category: e.target.value })}>
                <option value="">Select Level</option>
                <option value="NON STAFF">NON STAFF</option>
                <option value="STAFF">STAFF</option>
                <option value="SENIOR STAFF">SENIOR STAFF</option>
                <option value="BOD">BOD</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Meals Pkg</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.meals_packages ?? ''} onChange={(e) => setFormData({ ...formData, meals_packages: e.target.value })}>
                <option value="">Select Meals Pkg</option>
                <option value="Standard Buffet">Standard Buffet</option>
                <option value="Room Delivery">Room Delivery</option>
                <option value="VIP Buffet">VIP Buffet</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Breakfast DP</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.breakfast_dp ?? ''} onChange={(e) => setFormData({ ...formData, breakfast_dp: e.target.value })}>
                <option value="">Select Breakfast DP</option>
                {mealsDp.map(m => <option key={`bf-${m.id}`} value={m.delivery_point}>{m.delivery_point}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Lunch DP</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.lunch_dp ?? ''} onChange={(e) => setFormData({ ...formData, lunch_dp: e.target.value })}>
                <option value="">Select Lunch DP</option>
                {mealsDp.map(m => <option key={`lu-${m.id}`} value={m.delivery_point}>{m.delivery_point}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Dinner DP</Label>
              <select className="col-span-3 border border-emerald-200 rounded-md p-2 text-sm" value={formData.dinner_dp ?? ''} onChange={(e) => setFormData({ ...formData, dinner_dp: e.target.value })}>
                <option value="">Select Dinner DP</option>
                {mealsDp.map(m => <option key={`dn-${m.id}`} value={m.delivery_point}>{m.delivery_point}</option>)}
              </select>
            </div>
          </>
        )}

        {activeTab !== 'room' && activeTab !== 'meeting_room' && (
          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <Label className="text-right font-medium">Remarks</Label>
            <Input className="col-span-3 border-emerald-200" placeholder="Optional remarks..." value={formData.remarks ?? ''} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-full min-w-0 overflow-hidden">
      <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
          <div className="p-4 overflow-x-auto border-b border-emerald-100 bg-white shrink-0">
            <TabsList className="bg-stone-100 p-1.5 rounded-2xl border border-stone-200 inline-flex w-max">
              <TabsTrigger value="area" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <MapPin size={16} /> AREA
              </TabsTrigger>
              <TabsTrigger value="mess" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <Home size={16} /> MESS
              </TabsTrigger>
              <TabsTrigger value="room" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <BedDouble size={16} /> BEDROOM
              </TabsTrigger>
              <TabsTrigger value="guest" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <Users size={16} /> GUEST
              </TabsTrigger>
              <TabsTrigger value="meeting_room" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <Users size={16} /> MEETING ROOM
              </TabsTrigger>
              <TabsTrigger value="meals" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <Utensils size={16} /> MEALS DROP POINT
              </TabsTrigger>
              <TabsTrigger value="laundry_dp" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <Shirt size={16} /> LAUNDRY DROP & DELIVERY POINT
              </TabsTrigger>
              <TabsTrigger value="laundry_bag" className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 font-medium transition-all flex items-center gap-2">
                <Package size={16} /> LAUNDRY BAG & BOX
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white border-b border-emerald-100 py-1.5 px-4 shrink-0 flex flex-col md:flex-row  md:items-center justify-between gap-4">
            <CardTitle className="text-lg text-emerald-950 uppercase font-bold">{getCardTitle()}</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input placeholder="Search..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg" />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => setCurrentPage(1)}>Search</Button>
              </div>
              {canInsert && (
                <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingId(null); }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingId(null); setFormData({}); }} className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full">
                      <Plus size={18} /> Add New Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-emerald-950 text-xl uppercase">{editingId ? 'Edit' : 'Add New'} {activeTab.replace('_', ' ')}</DialogTitle>
                    </DialogHeader>
                    {renderAddForm()}
                    <DialogFooter>
                      <Button onClick={() => { setIsModalOpen(false); setEditingId(null); }} variant="outline" className="border-emerald-200 text-emerald-800" disabled={isSaving}>Cancel</Button>
                      <Button onClick={handleSave} className="bg-emerald-950 text-stone-50 hover:bg-emerald-900" disabled={isSaving}>
                        {isSaving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <CardContent className="flex flex-col flex-1 p-0 bg-stone-50/30 min-h-0">
            <div className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden ">
              {/* TAB A: AREA */}
              <TabsContent value="area" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">NO</th>
                        <th className="px-3 py-3">AREA</th>
                        <th className="px-3 py-3">AREA ID</th>
                        <th className="px-3 py-3">REGISTERED BY</th>
                        <th className="px-3 py-3">LAST REGISTERED</th>
                        <th className="px-3 py-3">REMARKS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.area_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.area_id} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.registered_by} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.last_registration} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.remarks} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB B: MESS */}
              <TabsContent value="mess" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">NO</th>
                        <th className="px-3 py-3">MESS</th>
                        <th className="px-3 py-3">MESS ID</th>
                        <th className="px-3 py-3">AREA</th>
                        <th className="px-3 py-3 text-center">ROOMS</th>
                        <th className="px-3 py-3">MESS STATUS</th>
                        <th className="px-3 py-3">MANAGED BY</th>
                        <th className="px-3 py-3">REGISTERED BY</th>
                        <th className="px-3 py-3">LAST REGISTERED</th>
                        <th className="px-3 py-3">REMARKS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.mess_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.mess_id} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.area_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center text-emerald-900 font-medium"><HighlightText text={row.rooms_count} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.mess_status} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.managed_by} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.registered_by} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.last_registration} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.remarks} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB C: ROOM */}
              <TabsContent value="room" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">NO</th>
                        <th className="px-3 py-3">ROOM NO</th>
                        <th className="px-3 py-3">MESS</th>
                        <th className="px-3 py-3">ROOM ALLOCATION</th>
                        <th className="px-3 py-3 text-center">BEDS</th>
                        <th className="px-3 py-3">ROOM STATUS</th>
                        <th className="px-3 py-3">REGISTERED BY</th>
                        <th className="px-3 py-3">LAST REGISTERED</th>
                        <th className="px-3 py-3">REMARKS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.room_no} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.mess_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.room_allocation} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center text-emerald-900 font-medium"><HighlightText text={row.beds} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 font-semibold text-emerald-900"><HighlightText text={row.room_status} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.registered_by} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.last_registration} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.remarks} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB H: MEETING ROOM */}
              <TabsContent value="meeting_room" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">NO</th>
                        <th className="px-3 py-3">MEETING ROOM</th>
                        <th className="px-3 py-3">ROOM ID</th>
                        <th className="px-3 py-3">BUILDING</th>
                        <th className="px-3 py-3 text-center">CAPACITY</th>
                        <th className="px-3 py-3">ROOM STATUS</th>
                        <th className="px-3 py-3">REGISTERED BY</th>
                        <th className="px-3 py-3">LAST REGISTERED</th>
                        <th className="px-3 py-3">REMARKS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.room} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={"MR-" + row.id?.toString().padStart(3, "0")} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.building} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center text-emerald-900 font-medium"><HighlightText text={row.capacity} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 font-semibold text-emerald-900"><HighlightText text={row.status || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.reserved_by || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.created_at ? row.created_at.split(" ")[0] : "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.remarks || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr><td colSpan={10} className="text-center py-8 text-gray-500">No meeting rooms found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB D: MEALS DELIVERY POINT */}
              <TabsContent value="meals" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">NO</th>
                        <th className="px-3 py-3">DELIVERY POINT</th>
                        <th className="px-3 py-3">AREA</th>
                        <th className="px-3 py-3">CANTEEN STATUS</th>
                        <th className="px-3 py-3">REGISTERED BY</th>
                        <th className="px-3 py-3">LAST REGISTERED</th>
                        <th className="px-3 py-3">REMARKS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.delivery_point} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.area_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 font-semibold text-emerald-900"><HighlightText text={row.canteen_status} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.registered_by} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.last_registration} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.remarks} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB E: LAUNDRY DELIVERY POINT */}
              <TabsContent value="laundry_dp" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">NO</th>
                        <th className="px-3 py-3">POINT</th>
                        <th className="px-3 py-3">AREA</th>
                        <th className="px-3 py-3">DP STATUS</th>
                        <th className="px-3 py-3">REGISTERED BY</th>
                        <th className="px-3 py-3">LAST REGISTERED</th>
                        <th className="px-3 py-3">REMARKS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.point_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.area_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 font-semibold text-emerald-900"><HighlightText text={row.dp_status} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.registered_by} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.last_registration} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.remarks} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB F: LAUNDRY BAG & BOX */}
              <TabsContent value="laundry_bag" className="m-0 animate-fade-in data-[state=active]:flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-center">NO</th>
                        <th className="px-3 py-3">NAMA</th>
                        <th className="px-3 py-3">ROOM</th>
                        <th className="px-3 py-3">LAUNDRY BAG</th>
                        <th className="px-3 py-3">LAUNDRY BOX</th>
                        <th className="px-3 py-3">REGISTERED BY</th>
                        <th className="px-3 py-3">LAST REGISTERED</th>
                        <th className="px-3 py-3">REMARKS</th>
                        <th className="px-3 py-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.nama} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.room_no} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.laundry_bag} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.laundry_box} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.registered_by} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.last_registration} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.remarks} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB G: GUEST */}
              <TabsContent value="guest" className="m-0 animate-fade-in w-full max-w-full data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="w-full bg-white max-w-full rounded-xl border border-emerald-100 flex-1 overflow-auto max-h-full min-h-0 shadow-sm relative">
                  <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-1 py-1 text-center border-b border-emerald-900" rowSpan={2}>NO</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>ROOM NO</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>MESS</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>NAME</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>PERSONAL ID</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>REG. ID CARD</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>JOB</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>POSITION</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>LEVEL CATEGORY</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>INSTITUTION/<br />COMPANY</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>GUEST CATEGORY</th>
                        <th className="px-1 py-1 border-b border-emerald-900" rowSpan={2}>MEALS PACKAGES</th>
                        <th className="px-4 py-2 text-center border-b border-emerald-900 border-l border-emerald-800" colSpan={3}>MEALS DELIVERY POINT</th>
                        <th className="px-1 py-1 border-b border-emerald-900 border-l border-emerald-800" rowSpan={2}>REGISTERED BY</th>
                        <th className="px-1 py-1 border-b border-emerald-900 border-l border-emerald-800" rowSpan={2}>LAST REGISTERED</th>
                        <th className="px-1 py-1 border-b border-emerald-900 border-l border-emerald-800" rowSpan={2}>REMARKS</th>
                        <th className="px-1 py-1 text-center border-b border-emerald-900 border-l border-emerald-800" rowSpan={2}>ACTION</th>
                      </tr>
                      <tr className="bg-emerald-900/50">
                        <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">BREAKFAST</th>
                        <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">LUNCH</th>
                        <th className="px-4 py-2 text-center text-xs tracking-wider border-l border-emerald-800">DINNER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-1 text-center font-medium text-emerald-950">{getRowIndex(idx)}</td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.room_no} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-700"><HighlightText text={row.mess_name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-900 font-bold"><HighlightText text={row.name} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.personal_identification || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600"><HighlightText text={row.reg_id_card || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.job || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.position || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-900 font-semibold"><HighlightText text={row.level_category || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.institution_company || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800 font-medium"><HighlightText text={row.occupants_category || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800"><HighlightText text={row.meals_packages || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800 text-center border-l border-emerald-50"><HighlightText text={row.breakfast_dp || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800 text-center border-l border-emerald-50"><HighlightText text={row.lunch_dp || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-800 text-center border-l border-emerald-50"><HighlightText text={row.dinner_dp || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600 border-l border-emerald-50"><HighlightText text={row.registered_by || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600 border-l border-emerald-50"><HighlightText text={row.last_registration ? new Date(row.last_registration).toLocaleDateString() : "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-emerald-600 border-l border-emerald-50"><HighlightText text={row.remarks || "-"} highlight={searchTerm} /></td>
                          <td className="px-1 py-1 text-center border-l border-emerald-50">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(row)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-2 border-t border-emerald-100 bg-white flex items-center justify-between rounded-b-xl shrink-0">
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
        </Tabs>
      </Card>
    </div>
  );
}
