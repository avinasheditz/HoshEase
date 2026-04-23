import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Customer } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Mail, Phone, MapPin, History } from 'lucide-react';
import { format } from 'date-fns';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      } as Customer));
      setCustomers(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 leading-none mb-2">Customer Base</h2>
          <p className="text-sm font-medium text-zinc-500 italic serif">Manage service users and their engagement</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Search by name, email, phone..." 
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Button className="h-10 gap-2">
             <UserPlus className="w-4 h-4" />
             Add Customer
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-100 italic serif uppercase tracking-wider text-[10px] font-bold text-zinc-400">
              <TableHead className="w-[250px]">Identity</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Primary Location</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-400">Syncing customer records...</TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-400 italic serif">No customer records found</TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map(customer => (
                <TableRow key={customer.id} className="border-zinc-100 group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold uppercase tracking-tighter text-xs">
                        {customer.name.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{customer.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">CID-{customer.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <Mail className="w-3 h-3 text-zinc-300" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <Phone className="w-3 h-3 text-zinc-300" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      {customer.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-zinc-500 italic serif">
                      {customer.createdAt ? format(customer.createdAt, 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-primary">
                          <History className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                          <Search className="w-4 h-4" />
                       </Button>
                    </div>
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
