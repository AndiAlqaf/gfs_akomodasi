import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from '@/lib/utils';

const Meals: React.FC = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'chief_cook' | 'driver' | 'canteen_officer'>('chief_cook');

  const { data: mealsResp, isLoading } = useQuery({
    queryKey: ['meals-today'],
    queryFn: mealsAPI.getToday,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => mealsAPI.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals-today'] })
  });

  const stats = mealsResp?.data?.stats || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
  const accommodatedMeals = mealsResp?.data?.accommodatedData || [];
  const visitorMeals = mealsResp?.data?.visitorData || [];

  const filteredAccommodated = accommodatedMeals;
  const filteredVisitor = visitorMeals;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PREPARING': return <Badge variant="destructive">Preparing</Badge>;
      case 'IN TRANSIT': return <Badge variant="warning">In Transit</Badge>;
      case 'DELIVERED': return <Badge variant="success">Delivered</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const renderAction = (meal: any) => (
    <TableCell className="text-right whitespace-nowrap">
      {role === 'chief_cook' && meal.status === 'PREPARING' && (
        <Button size="sm" variant="outline" className="gap-2" onClick={() => updateStatusMutation.mutate({id: meal.id, status: 'IN TRANSIT'})}>
          <Truck size={16} /> Ready
        </Button>
      )}
      {role === 'driver' && meal.status === 'IN TRANSIT' && (
        <Button size="sm" variant="outline" className="gap-2" onClick={() => updateStatusMutation.mutate({id: meal.id, status: 'DELIVERED'})}>
          <CheckCircle size={16} /> Delivered
        </Button>
      )}
      {role === 'canteen_officer' && (
        <span className="text-xs text-gray-500 italic">View Only</span>
      )}
    </TableCell>
  );

  // Generate Summary Data
  const generateSummary = () => {
    const summary: any[] = [];
    const allMeals = [...accommodatedMeals.map((m: any) => ({...m, accStatus: 'ACCOMMODATED'})), ...visitorMeals.map((m: any) => ({...m, accStatus: 'VISITOR'}))];
    
    // Group by delivery point and meal package
    const grouped = allMeals.reduce((acc: any, meal: any) => {
      const key = `${meal.delivery_point}_${meal.meals_package}_${meal.accStatus}`;
      if (!acc[key]) {
        acc[key] = {
          delivery_point: meal.delivery_point,
          meals_package: meal.meals_package,
          accStatus: meal.accStatus,
          breakfast_packs: 0,
          lunch_packs: 0,
          dinner_packs: 0,
        };
      }
      if (meal.breakfast) acc[key].breakfast_packs += parseInt(meal.breakfast_packs) || 0;
      if (meal.lunch) acc[key].lunch_packs += parseInt(meal.lunch_packs) || 0;
      if (meal.dinner) acc[key].dinner_packs += parseInt(meal.dinner_packs) || 0;
      return acc;
    }, {});

    Object.values(grouped).forEach((g: any, index: number) => {
      if (g.breakfast_packs > 0) summary.push({ ...g, meal_time: 'Breakfast', packs: g.breakfast_packs, id: `${index}_b` });
      if (g.lunch_packs > 0) summary.push({ ...g, meal_time: 'Lunch', packs: g.lunch_packs, id: `${index}_l` });
      if (g.dinner_packs > 0) summary.push({ ...g, meal_time: 'Dinner', packs: g.dinner_packs, id: `${index}_d` });
    });

    return summary;
  };

  const summaryData = generateSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-700 mt-1">Daily Meal Production & Delivery</p>
        </div>
      </div>

      <div className="glass p-4 rounded-xl flex items-center gap-4 animate-fade-in border-emerald-100">
        <span className="font-semibold text-emerald-800">Simulate Role:</span>
        <div className="flex gap-2">
          {['chief_cook', 'driver', 'canteen_officer'].map(r => (
            <Button 
              key={r} 
              variant={role === r ? 'default' : 'outline'}
              className={role === r ? 'bg-emerald-950 text-stone-50 hover:bg-emerald-900' : 'text-emerald-800 border-emerald-200'}
              onClick={() => setRole(r as any)}
            >
              {r.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden animate-fade-in border-emerald-100" style={{ animationDelay: '200ms' }}>
        <CardHeader className="bg-white border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-emerald-950 uppercase">Meals Services Tables</CardTitle>

          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="accommodated" className="w-full">
            <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <TabsTrigger value="accommodated" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all">Accommodation Provided</TabsTrigger>
              <TabsTrigger value="visitor" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all">Visitor (No Accommodation)</TabsTrigger>
              <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-950 transition-all">Meals Services Info</TabsTrigger>
            </TabsList>

            <TabsContent value="accommodated">
              {isLoading ? <p>Loading Meals...</p> : (
                <div className="overflow-x-auto">
                  <Table className="min-w-max">
                    <TableHeader className="bg-blue-50">
                      <TableRow>
                        <TableHead className="w-12">NO</TableHead>
                        <TableHead>DATE</TableHead>
                        <TableHead>ROOM</TableHead>
                        <TableHead>MESS</TableHead>
                        <TableHead>NAME</TableHead>
                        <TableHead>MEALS PACKAGES</TableHead>
                        <TableHead className="text-center" colSpan={3}>DELIVERY POINT</TableHead>
                        <TableHead className="text-center" colSpan={3}>NO OF PACK</TableHead>
                        <TableHead>REMARK / STATUS</TableHead>
                        <TableHead className="text-right">ACTION</TableHead>
                      </TableRow>
                      <TableRow className="bg-blue-100 text-xs">
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead className="text-center font-semibold">BREAKFAST</TableHead>
                        <TableHead className="text-center font-semibold">LUNCH</TableHead>
                        <TableHead className="text-center font-semibold">DINNER</TableHead>
                        <TableHead className="text-center font-semibold">BREAKFAST</TableHead>
                        <TableHead className="text-center font-semibold">LUNCH</TableHead>
                        <TableHead className="text-center font-semibold">DINNER</TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccommodated?.map((meal: any, i: number) => (
                        <TableRow key={meal.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{meal.date}</TableCell>
                          <TableCell>{meal.roomNo}</TableCell>
                          <TableCell>{meal.mess}</TableCell>
                          <TableCell className="font-medium">{meal.guestName}</TableCell>
                          <TableCell>
                            <Badge variant={meal.meals_package === 'ROOM DELIVERY' ? 'default' : 'secondary'}>
                              {meal.meals_package}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs">{meal.breakfast ? meal.delivery_point : '-'}</TableCell>
                          <TableCell className="text-center text-xs">{meal.lunch ? meal.delivery_point : '-'}</TableCell>
                          <TableCell className="text-center text-xs">{meal.dinner ? meal.delivery_point : '-'}</TableCell>
                          <TableCell className="text-center font-mono">{meal.breakfast ? meal.breakfast_packs : 0}</TableCell>
                          <TableCell className="text-center font-mono">{meal.lunch ? meal.lunch_packs : 0}</TableCell>
                          <TableCell className="text-center font-mono">{meal.dinner ? meal.dinner_packs : 0}</TableCell>
                          <TableCell>{getStatusBadge(meal.status)}</TableCell>
                          {renderAction(meal)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="visitor">
              {isLoading ? <p>Loading Meals...</p> : (
                <div className="overflow-x-auto">
                  <Table className="min-w-max">
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead className="w-12">NO</TableHead>
                        <TableHead>DATE</TableHead>
                        <TableHead>GUESTS</TableHead>
                        <TableHead>REQUEST BY</TableHead>
                        <TableHead>APPROVED BY</TableHead>
                        <TableHead>MEALS PACKAGES</TableHead>
                        <TableHead className="text-center" colSpan={3}>DELIVERY POINT</TableHead>
                        <TableHead className="text-center" colSpan={3}>NO OF PACK</TableHead>
                        <TableHead>REMARK / STATUS</TableHead>
                        <TableHead className="text-right">ACTION</TableHead>
                      </TableRow>
                      <TableRow className="bg-green-100 text-xs">
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead className="text-center font-semibold">BREAKFAST</TableHead>
                        <TableHead className="text-center font-semibold">LUNCH</TableHead>
                        <TableHead className="text-center font-semibold">DINNER</TableHead>
                        <TableHead className="text-center font-semibold">BREAKFAST</TableHead>
                        <TableHead className="text-center font-semibold">LUNCH</TableHead>
                        <TableHead className="text-center font-semibold">DINNER</TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitor?.map((meal: any, i: number) => (
                        <TableRow key={meal.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{meal.date}</TableCell>
                          <TableCell className="font-medium">{meal.visitor_name}</TableCell>
                          <TableCell>{meal.request_by}</TableCell>
                          <TableCell>{meal.approved_by}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{meal.meals_package}</Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs">{meal.breakfast ? meal.delivery_point : '-'}</TableCell>
                          <TableCell className="text-center text-xs">{meal.lunch ? meal.delivery_point : '-'}</TableCell>
                          <TableCell className="text-center text-xs">{meal.dinner ? meal.delivery_point : '-'}</TableCell>
                          <TableCell className="text-center font-mono">{meal.breakfast ? meal.breakfast_packs : 0}</TableCell>
                          <TableCell className="text-center font-mono">{meal.lunch ? meal.lunch_packs : 0}</TableCell>
                          <TableCell className="text-center font-mono">{meal.dinner ? meal.dinner_packs : 0}</TableCell>
                          <TableCell>{getStatusBadge(meal.status)}</TableCell>
                          {renderAction(meal)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="summary">
              <div className="overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader className="bg-cyan-50">
                    <TableRow>
                      <TableHead className="w-12">NO</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>MEALS PACKAGES</TableHead>
                      <TableHead>MEALS DELIVERY POINT</TableHead>
                      <TableHead>AREA</TableHead>
                      <TableHead>MEAL TIME</TableHead>
                      <TableHead className="text-center">NO OF PACKS</TableHead>
                      <TableHead>ACCOMODATION STATUS</TableHead>
                      <TableHead>REMARK</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">No meals found for today.</TableCell>
                      </TableRow>
                    ) : (
                      summaryData.map((row: any, i: number) => (
                        <TableRow key={row.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{new Date().toISOString().split('T')[0]}</TableCell>
                          <TableCell>{row.meals_package}</TableCell>
                          <TableCell>{row.delivery_point}</TableCell>
                          <TableCell className="text-gray-400 italic">Auto-resolved</TableCell>
                          <TableCell>{row.meal_time}</TableCell>
                          <TableCell className="text-center font-bold text-lg">{row.packs}</TableCell>
                          <TableCell>{row.accStatus}</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Meals;
