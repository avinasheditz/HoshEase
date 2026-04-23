import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Hospital, 
  Users, 
  MapPin, 
  Activity, 
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const data = [
  { name: 'Jan', trips: 400, revenue: 2400 },
  { name: 'Feb', trips: 300, revenue: 1398 },
  { name: 'Mar', trips: 200, revenue: 9800 },
  { name: 'Apr', trips: 278, revenue: 3908 },
  { name: 'May', trips: 189, revenue: 4800 },
  { name: 'Jun', trips: 239, revenue: 3800 },
  { name: 'Jul', trips: 349, revenue: 4300 },
];

const hospitalStats = [
  { name: 'City Hospital', trips: 124 },
  { name: 'Metro Clinic', trips: 89 },
  { name: 'Sunrise Med', trips: 76 },
  { name: 'Global Health', trips: 65 },
  { name: 'Care Center', trips: 58 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

export function Dashboard() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">System Overview</h2>
        <p className="text-zinc-500 font-medium italic serif">Real-time platform metrics and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Hospitals" 
          value="128" 
          change="+4.5%" 
          trend="up" 
          icon={Hospital} 
        />
        <StatCard 
          title="Active Customers" 
          value="2,450" 
          change="+12.2%" 
          trend="up" 
          icon={Users} 
        />
        <StatCard 
          title="Live Trips" 
          value="24" 
          change="-2" 
          trend="down" 
          icon={Activity} 
          highlight
        />
        <StatCard 
          title="Total Revenue" 
          value="$48,250" 
          change="+8.3%" 
          trend="up" 
          icon={Wallet} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 border-zinc-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Growth Trends
              <TrendingUp className="w-4 h-4 text-zinc-400 font-serif italic" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--zinc-100))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--zinc-400))' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--zinc-400))' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="trips" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTrips)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-zinc-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Performing Hospitals</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalStats} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--zinc-500))' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="trips" radius={[0, 4, 4, 0]}>
                  {hospitalStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 border-zinc-200 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-base font-semibold">Live Trip Stream</CardTitle>
               <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live Updates</span>
               </div>
            </CardHeader>
            <CardContent className="px-0">
               <div className="space-y-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                     <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                           <MapPin className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-zinc-900 leading-none">Trip #{1034 + i}</p>
                              <span className="text-[10px] font-mono text-zinc-400">2 mins ago</span>
                           </div>
                           <p className="text-xs text-zinc-500">
                              <span className="font-medium text-zinc-700">City Hospital</span> → Patient Residence (Brooklyn)
                           </p>
                        </div>
                        <div className="text-right">
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
                              En Route
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="border-zinc-200">
            <CardHeader>
               <CardTitle className="text-base font-semibold">Service Distribution</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-6 mt-4">
                  <DistributionItem label="Emergency" value={65} color="bg-red-500" />
                  <DistributionItem label="Routine Checkout" value={24} color="bg-blue-500" />
                  <DistributionItem label="Maternity" value={11} color="bg-purple-500" />
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon,
  highlight = false
}: { 
  title: string, 
  value: string, 
  change: string, 
  trend: 'up' | 'down',
  icon: any,
  highlight?: boolean
}) {
  return (
    <Card className={cn(
      "border-zinc-200 overflow-hidden relative group",
      highlight && "border-primary/20 bg-primary/[0.02]"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg transition-transform group-hover:scale-110 duration-300",
            highlight ? "bg-primary/20" : "bg-zinc-100"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              highlight ? "text-primary" : "text-zinc-600"
            )} />
          </div>
          <div className={cn(
             "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
             trend === 'up' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500 italic serif mb-1">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
