import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { informationAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const Information: React.FC = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-950 tracking-tight">Information Center</h1>
        <p className="text-emerald-700 mt-1">Live data reports from database</p>
      </div>

      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl border border-stone-200 inline-flex">
          <TabsTrigger value="rooms" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">INFORMATION ROOM</TabsTrigger>
          <TabsTrigger value="pob" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all px-4 py-2">INFORMATION PERSON ON BOARD</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="animate-fade-in mt-0">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
            <CardHeader className="bg-white border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-950">Room Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50">
              {roomLoading ? (
                <div className="text-center py-8">Loading Room Data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-max text-sm bg-white rounded-xl overflow-hidden shadow-sm border border-emerald-100">
                    <TableHeader className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <TableRow className="hover:bg-emerald-900">
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">NO</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">ROOM</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">MESS</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">AREA</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">NAME</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">ROOM ALLOCATION</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900" colSpan={3}>BEDS<br/>(AVAIL | OCC | VAC)</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">STATUS</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">REMARK</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-emerald-50">
                      {rooms.map((r: any, idx: number) => (
                        <TableRow key={r.id} className="hover:bg-emerald-50/50 transition-colors">
                          <TableCell className="text-center font-medium text-emerald-950">{idx + 1}</TableCell>
                          <TableCell className="text-emerald-800">{r.room}</TableCell>
                          <TableCell className="text-emerald-700">{r.mess}</TableCell>
                          <TableCell className="text-emerald-700">{r.area}</TableCell>
                          <TableCell className="font-medium text-emerald-900">{r.guest_name || '-'}</TableCell>
                          <TableCell className="text-emerald-700">{r.room_allocation}</TableCell>
                          <TableCell className="text-center font-semibold bg-emerald-50/50 text-emerald-800 border-x border-emerald-100">{r.beds_total}</TableCell>
                          <TableCell className="text-center font-semibold bg-lime-50/50 text-lime-800 border-x border-emerald-100">{r.beds_occupied}</TableCell>
                          <TableCell className="text-center font-semibold bg-stone-50 text-stone-800 border-x border-emerald-100">{r.beds_vacant}</TableCell>
                          <TableCell className="text-center font-semibold">
                            <span className="bg-lime-400 text-emerald-950 px-2 py-1 rounded-full text-xs shadow-sm">{r.status}</span>
                          </TableCell>
                          <TableCell className="text-emerald-600">{r.remark}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pob" className="animate-fade-in mt-0">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100">
            <CardHeader className="bg-white border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-950">Person On Board (POB) Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-stone-50/50">
              {pobLoading ? (
                <div className="text-center py-8">Loading POB Data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-max text-xs bg-white rounded-xl overflow-hidden shadow-sm border border-emerald-100">
                    <TableHeader className="bg-emerald-950 text-stone-50 uppercase text-xs font-semibold">
                      <TableRow className="hover:bg-emerald-900">
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">NO</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">DATE</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">ROOM NO</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">MESS</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">AREA</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">NAME</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">REG. ID</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">JOB</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">POSITION</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">LEVEL CATEGORY</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">INSTITUTION/COMPANY</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">OCCUPANTS CATEGORY</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">BOARDING STATUS</TableHead>
                        <TableHead className="text-stone-50 font-bold text-center border-emerald-900">REMARKS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-emerald-50">
                      {pobs.map((p: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-emerald-50/50 transition-colors">
                          <TableCell className="text-center font-medium text-emerald-950">{idx + 1}</TableCell>
                          <TableCell className="text-emerald-700">{formatDate(p.date)}</TableCell>
                          <TableCell className="text-emerald-800 font-medium">{p.room_no}</TableCell>
                          <TableCell className="text-emerald-700">{p.mess}</TableCell>
                          <TableCell className="text-emerald-700">{p.area}</TableCell>
                          <TableCell className="font-medium text-emerald-900">{p.name}</TableCell>
                          <TableCell className="text-emerald-600">{p.reg_id_card || '-'}</TableCell>
                          <TableCell className="text-emerald-600">{p.job || '-'}</TableCell>
                          <TableCell className="text-emerald-600">{p.position || '-'}</TableCell>
                          <TableCell className="text-emerald-600">{p.level_category || '-'}</TableCell>
                          <TableCell className="text-emerald-700">
                            <span className="bg-stone-100 text-emerald-800 px-2 py-1 rounded-md border border-stone-200">{p.institution_company || '-'}</span>
                          </TableCell>
                          <TableCell className="text-emerald-700">{p.occupants_category || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${p.boarding_status === 'ON BOARD' ? 'bg-lime-400 text-emerald-950 shadow-sm' : 'bg-stone-200 text-stone-600'}`}>{p.boarding_status}</span>
                          </TableCell>
                          <TableCell className="text-emerald-600">{p.remarks || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
