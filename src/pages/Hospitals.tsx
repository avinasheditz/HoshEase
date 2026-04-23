import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Hospital, HospitalStatus, SubscriptionTier } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreVertical, Edit, Trash, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'hospitals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        subscriptionExpiry: (doc.data().subscriptionExpiry as Timestamp)?.toDate(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
      } as Hospital));
      setHospitals(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;
    try {
      await deleteDoc(doc(db, 'hospitals', id));
      toast.success('Hospital deleted successfully');
    } catch (error) {
      toast.error('Failed to delete hospital');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 leading-none mb-2">Hospital Network</h2>
          <p className="text-sm font-medium text-zinc-500 italic serif">Manage healthcare providers and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Search hospitals..." 
                className="pl-9 h-10 border-zinc-200 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 gap-2 font-medium">
                  <Plus className="w-4 h-4" />
                  Register Hospital
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Register New Hospital</DialogTitle>
                </DialogHeader>
                <HospitalForm onSuccess={() => setIsAddOpen(false)} />
              </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-100 italic serif uppercase tracking-wider text-[10px] font-bold text-zinc-400">
              <TableHead className="w-[300px]">Hospital Details</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-400 font-medium">Loading network data...</TableCell>
              </TableRow>
            ) : filteredHospitals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-400 font-medium italic serif">No hospitals found matching your search</TableCell>
              </TableRow>
            ) : (
              filteredHospitals.map(hospital => (
                <TableRow key={hospital.id} className="border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{hospital.name}</span>
                      <span className="text-xs text-zinc-500 font-medium">{hospital.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-700">{hospital.city}</span>
                      <span className="text-xs text-zinc-400">{hospital.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       <Badge variant="outline" className={cn(
                          "w-fit font-bold uppercase tracking-tight",
                          hospital.subscriptionTier === SubscriptionTier.ENTERPRISE ? "bg-purple-50 text-purple-700 border-purple-100" :
                          hospital.subscriptionTier === SubscriptionTier.PREMIUM ? "bg-blue-50 text-blue-700 border-blue-100" :
                          "bg-zinc-50 text-zinc-700 border-zinc-200"
                       )}>
                        {hospital.subscriptionTier}
                       </Badge>
                       {hospital.subscriptionExpiry && (
                         <span className="text-[10px] font-mono text-zinc-400 italic serif">
                           Exp: {format(hospital.subscriptionExpiry, 'MMM dd, yyyy')}
                         </span>
                       )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-bold uppercase tracking-widest text-[9px] rounded-sm h-5",
                      hospital.status === HospitalStatus.ACTIVE ? "bg-green-500 hover:bg-green-600" : "bg-zinc-400 hover:bg-zinc-500"
                    )}>
                      {hospital.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min(100, (hospital.totalTrips || 0) / 2)}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-900">{hospital.totalTrips || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <ExternalLink className="w-4 h-4" /> View Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600" onClick={() => handleDelete(hospital.id)}>
                          <Trash className="w-4 h-4" /> Remove Hospital
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

function HospitalForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    contactNumber: '',
    subscriptionTier: SubscriptionTier.BASIC,
    status: HospitalStatus.ACTIVE
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      await addDoc(collection(db, 'hospitals'), {
        ...formData,
        subscriptionExpiry: Timestamp.fromDate(expiryDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        totalTrips: 0,
        averageRating: 0,
      });
      toast.success('Hospital registered successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to register hospital');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-serif italic">Hospital Name</Label>
          <Input 
            id="name" 
            required 
            placeholder="e.g. St. Mary's General"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-serif italic">Contact Email</Label>
          <Input 
            id="email" 
            type="email" 
            required 
            placeholder="admin@hospital.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-serif italic">Address</Label>
        <Input 
          id="address" 
          placeholder="Street address, building, etc."
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-serif italic">City</Label>
          <Input 
            id="city" 
            required
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-serif italic">State</Label>
          <Input 
            id="state" 
            required
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tier" className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-serif italic">Subscription Plan</Label>
          <Select 
            value={formData.subscriptionTier} 
            onValueChange={(v: SubscriptionTier) => setFormData(prev => ({ ...prev, subscriptionTier: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SubscriptionTier.BASIC}>Basic Plan</SelectItem>
              <SelectItem value={SubscriptionTier.PREMIUM}>Premium Plan</SelectItem>
              <SelectItem value={SubscriptionTier.ENTERPRISE}>Enterprise Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact" className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-serif italic">Contact Number</Label>
          <Input 
            id="contact" 
            value={formData.contactNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
          />
        </div>
      </div>
      <DialogFooter className="pt-4">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Complete Registration'}
        </Button>
      </DialogFooter>
    </form>
  );
}

import { cn } from '@/lib/utils';
