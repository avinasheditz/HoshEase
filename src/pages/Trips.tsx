import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trip, TripStatus } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: (doc.data().startTime as Timestamp)?.toDate(),
        endTime: (doc.data().endTime as Timestamp)?.toDate(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
      } as Trip));
      setTrips(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredTrips = trips.filter(t => 
    t.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    t.hospitalId.toLowerCase().includes(search.toLowerCase()) ||
    t.driverName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 leading-none mb-2">Trip Command Center</h2>
          <p className="text-sm font-medium text-zinc-500 italic serif">Live grid of all ambulance and transit missions</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Search active trips..." 
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-10 gap-2">
             <Filter className="w-4 h-4" />
             Filters
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-100 italic serif uppercase tracking-wider text-[10px] font-bold text-zinc-400">
              <TableHead className="w-[180px]">Status & ID</TableHead>
              <TableHead>Entities Involved</TableHead>
              <TableHead>Route Logistics</TableHead>
              <TableHead>Crew Details</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead className="text-right">Monitoring</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-400 font-medium italic serif">Capturing signal...</TableCell>
              </TableRow>
            ) : filteredTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-400 font-medium italic serif">Nerve center clear. No active trips.</TableCell>
              </TableRow>
            ) : (
              filteredTrips.map(trip => (
                <TableRow key={trip.id} className="border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                  <TableCell>
                    <div className="space-y-2">
                       <StatusBadge status={trip.status} />
                       <p className="text-[10px] font-mono font-bold text-zinc-400">#{trip.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-bold text-zinc-900 leading-tight">Hosp: {trip.hospitalId}</span>
                       </div>
                       <div className="flex items-center gap-2 ml-4">
                          <User className="w-3 h-3 text-zinc-400" />
                          <span className="text-xs text-zinc-500 font-medium">Patient: {trip.patientName || 'Anonymous'}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 max-w-[200px]">
                       <div className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-zinc-300" />
                          <span className="text-[11px] text-zinc-500 truncate italic serif">{trip.pickupLocation}</span>
                       </div>
                       <div className="w-px h-2 bg-zinc-200 ml-1.5" />
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-zinc-300" />
                          <span className="text-[11px] text-zinc-700 font-bold truncate">{trip.dropLocation}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {trip.driverName ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-800">{trip.driverName}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                           <Phone className="w-3 h-3 text-zinc-300" />
                           {trip.driverPhone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 italic serif">Awaiting Assignment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-tighter text-zinc-400">
                          <Clock className="w-3 h-3 text-zinc-300" />
                          Started: {trip.startTime ? format(trip.startTime, 'HH:mm') : '--:--'}
                       </div>
                       {trip.endTime && (
                         <div className="text-[10px] uppercase font-bold tracking-tighter text-green-600">
                           Ended: {format(trip.endTime, 'HH:mm')}
                         </div>
                       )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
                       <Navigation className="w-3.5 h-3.5" />
                       Track Live
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TripStatus }) {
  const config = {
    [TripStatus.REQUESTED]: { label: 'Requested', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    [TripStatus.ACCEPTED]: { label: 'Accepted', className: 'bg-blue-50 text-blue-700 border-blue-100' },
    [TripStatus.EN_ROUTE]: { label: 'En Route', className: 'bg-orange-50 text-orange-700 border-orange-100' },
    [TripStatus.COMPLETED]: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-100' },
  };

  const { label, className } = config[status];

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
      className
    )}>
      {label}
    </span>
  );
}
