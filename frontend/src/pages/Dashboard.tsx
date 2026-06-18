import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Users, UtensilsCrossed, Shirt, TrendingUp } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    // Mock data for demo
    initialData: {
      data: {
        totalRooms: 150,
        occupiedRooms: 98,
        availableRooms: 45,
        underRepair: 7,
        totalGuests: 98,
        onSiteGuests: 85,
        mealsToday: 255,
        laundryInProcess: 32,
      }
    } as any
  });

  const statsCards = [
    {
      title: 'Total Rooms',
      value: stats?.data.totalRooms || 0,
      icon: BedDouble,
      color: 'bg-blue-500',
      trend: '+5.2%',
    },
    {
      title: 'Occupied Rooms',
      value: stats?.data.occupiedRooms || 0,
      icon: Users,
      color: 'bg-green-500',
      trend: '+12.5%',
    },
    {
      title: 'Meals Today',
      value: stats?.data.mealsToday || 0,
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
      trend: '+8.1%',
    },
    {
      title: 'Laundry in Process',
      value: stats?.data.laundryInProcess || 0,
      icon: Shirt,
      color: 'bg-purple-500',
      trend: '-3.2%',
    },
  ];

  const occupancyData = [
    { name: 'Available', value: stats?.data.availableRooms || 0 },
    { name: 'Occupied', value: stats?.data.occupiedRooms || 0 },
    { name: 'Under Repair', value: stats?.data.underRepair || 0 },
  ];

  const COLORS = ['#A3E635', '#022C22', '#F59E0B']; // Lime-400, Emerald-950, Orange

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-950 tracking-tight">Dashboard</h1>
        <p className="text-emerald-800 mt-1">Welcome to GFS Ceria Accommodation System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-lift border-0 shadow-sm overflow-hidden animate-fade-in border-emerald-100" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2.5 rounded-xl shadow-inner text-white border border-white/20`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-950">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs font-medium mt-2">
                  <TrendingUp className="w-4 h-4 text-lime-500" />
                  <span className="text-lime-600 font-bold">{stat.trend}</span>
                  <span className="text-emerald-700">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy Chart */}
        <Card className="hover-lift border-0 shadow-sm animate-fade-in border-emerald-100" style={{ animationDelay: '400ms' }}>
          <CardHeader className="border-b border-emerald-100 bg-white">
            <CardTitle className="text-emerald-950">Room Occupancy Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {occupancyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="hover-lift border-0 shadow-sm animate-fade-in border-emerald-100" style={{ animationDelay: '500ms' }}>
          <CardHeader className="border-b border-emerald-100 bg-white">
            <CardTitle className="text-emerald-950">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-lime-400 rounded-full mt-1.5 shadow-sm shadow-lime-400/50" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-950">New Check-in</p>
                  <p className="text-xs text-emerald-700">Mr. Zheng Bu Dong checked in to LH.02.01</p>
                  <p className="text-[10px] text-emerald-600 mt-1 uppercase tracking-wider font-medium">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1.5 shadow-sm shadow-emerald-500/50" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-950">Laundry Completed</p>
                  <p className="text-xs text-emerald-700">Laundry bag LH.01.01 has been completed</p>
                  <p className="text-[10px] text-emerald-600 mt-1 uppercase tracking-wider font-medium">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mt-1.5 shadow-sm shadow-yellow-500/50" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-950">Meals Request</p>
                  <p className="text-xs text-emerald-700">15 additional meals requested for dinner</p>
                  <p className="text-[10px] text-emerald-600 mt-1 uppercase tracking-wider font-medium">5 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
