'use client';

import {
  collection,
  onSnapshot,
  query,
  where,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useFirestore } from '@/firebase/firestore/provider';

const useCollection = <T,>(path: string | null, field?: string, value?: string) => {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) {
      setLoading(false);
      return;
    }

    // A field is specified but the value is not yet available, so we wait.
    // Firestore's 'where' clause throws an error if the value is undefined.
    if (field && value === undefined) {
      setData([]);
      setLoading(true); // We are waiting for the value.
      return;
    }
    
    let q: Query<DocumentData>;
    if (field && value) {
      q = query(collection(db, path), where(field, '==', value));
    } else {
      q = query(collection(db, path));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: T[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(results);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching collection: ", error);
        setData([]);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [db, path, field, value]);

  return { data, loading };
};

export { useCollection };
