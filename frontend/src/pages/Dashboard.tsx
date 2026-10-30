import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BedDouble, Users, UtensilsCrossed, Shirt, Building2, Filter } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';

const DEFAULT_COMPANIES = ['PT. CNI', 'PT. CMP'];

const Dashboard: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [appliedCompany, setAppliedCompany] = useState<string>('All');

  const { data: statsResp, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats', appliedCompany],
    queryFn: () => dashboardAPI.getStats(appliedCompany),
  });

  if (isLoading && !statsResp) {
    return <div className="flex items-center justify-center h-full text-emerald-800">Loading Reporting Data...</div>;
  }

  const data = statsResp?.data?.data || {};
  const companyOptions: string[] = Array.from(
    new Set([
      ...DEFAULT_COMPANIES,
      ...(Array.isArray(data.companies) ? data.companies : []),
    ])
  )
    .filter((c) => Boolean(c && c.trim()))
    .sort((a, b) => a.localeCompare(b));

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    setAppliedCompany(value);
  };

  const handleFilterClick = () => {
    setAppliedCompany(selectedCompany);
    refetch();
  };

  const statsCards = [
    {
      title: 'Occupied Rooms',
      value: data.occupiedRooms || 0,
      sub: `out of ${data.totalRooms || 0} Total`,
      icon: BedDouble,
      color: 'bg-emerald-600',
    },
    {
      title: 'Guests On-Site',
      value: data.onSiteGuests || 0,
      sub: appliedCompany !== 'All' ? `Currently Checked In (${appliedCompany})` : `Currently Checked In`,
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      title: 'Meals Today',
      value: data.mealsToday || 0,
      sub: `Monthly: ${data.mealsMonthly || 0}`,
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
    },
    {
      title: 'Laundry Weight (Today)',
      value: `${data.laundryTodayWeight || 0} kg`,
      sub: `Monthly: ${data.laundryMonthlyWeight || 0} kg`,
      icon: Shirt,
      color: 'bg-purple-500',
    },
  ];

  const occupancyData = [
    { name: 'Available', value: data.availableRooms || 0 },
    { name: 'Occupied', value: data.occupiedRooms || 0 },
    { name: 'Under Maintenance', value: data.underRepair || 0 },
  ];

  const COLORS = ['#A3E635', '#022C22', '#F59E0B'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-emerald-800 mt-1">
            Real-time Operations Dashboard
            {appliedCompany !== 'All' && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {appliedCompany}
              </span>
            )}
          </p>
        </div>

        {/* Institution / Company Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Building2 className="absolute left-3 h-4 w-4 text-emerald-600 pointer-events-none" />
            <select
              aria-label="Filter Institution / Company"
              value={selectedCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="pl-9 pr-8 h-10 w-64 bg-white border border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-sm text-emerald-950 font-medium shadow-sm transition-colors"
            >
              <option value="All">All Institution / Company</option>
              {companyOptions.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            onClick={handleFilterClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 h-10 flex items-center gap-1.5 shadow-sm"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-lift border-0 shadow-sm overflow-hidden animate-fade-in border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 uppercase">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2.5 rounded-xl shadow-inner text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-950">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs font-medium mt-2 text-emerald-700">
                  <span className="font-semibold">{stat.sub}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Occupancy Chart */}
        <Card className="hover-lift border-0 shadow-sm border-emerald-100">
          <CardHeader className="border-b border-emerald-100 bg-white">
            <CardTitle className="text-lg text-emerald-950 uppercase">Room Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="40%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
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

        {/* Meals Consumption Chart */}
        <Card className="hover-lift border-0 shadow-sm border-emerald-100">
          <CardHeader className="border-b border-emerald-100 bg-white">
            <CardTitle className="text-lg text-emerald-950 uppercase">Meals Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.mealsChart || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Scheduled" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Requests" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Laundry Production Chart */}
        <Card className="hover-lift border-0 shadow-sm border-emerald-100">
          <CardHeader className="border-b border-emerald-100 bg-white">
            <CardTitle className="text-lg text-emerald-950 uppercase">Laundry Production</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.laundryChart || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="Weight (kg)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="Pieces" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;
