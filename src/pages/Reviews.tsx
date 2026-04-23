import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review } from '@/types';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trash, MessageSquare, Quote, Hospital as HospitalIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      } as Review));
      setReviews(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Flag this review as inappropriate and remove it?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      toast.success('Review removed');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 leading-none mb-2">Hospital Sentiment</h2>
        <p className="text-sm font-medium text-zinc-500 italic serif">Monitor and moderate patient feedback across the network</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-48 rounded-xl bg-zinc-100 animate-pulse" />
           ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-zinc-400 bg-white rounded-2xl border-2 border-dashed border-zinc-100">
           <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
           <p className="font-medium italic serif">No sentiment data recorded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <Card key={review.id} className="border-zinc-200 hover:shadow-lg hover:shadow-zinc-200/50 transition-all group overflow-hidden">
               <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                           <Star 
                              key={i} 
                              className={cn(
                                 "w-3 h-3 h-3 items-center",
                                 i < review.rating ? "fill-primary text-primary" : "text-zinc-200"
                              )} 
                           />
                        ))}
                     </div>
                     <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
                        {review.createdAt ? format(review.createdAt, 'MMM dd, yyyy') : 'N/A'}
                     </span>
                  </div>

                  <div className="relative mb-6">
                     <Quote className="absolute -top-2 -left-2 w-8 h-8 text-zinc-50 -z-10" />
                     <p className="text-sm text-zinc-600 leading-relaxed font-medium italic serif">
                        "{review.comment}"
                     </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50">
                     <div className="flex items-center gap-2">
                        <HospitalIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-900 leading-none">
                           {review.hospitalName || 'Health Center'}
                        </span>
                     </div>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(review.id)}
                     >
                        <Trash className="w-4 h-4" />
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { cn } from '@/lib/utils';
