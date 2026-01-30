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

import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const useCollection = <T,>(path: string | null, field?: string, value?: any) => {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) {
      setLoading(false);
      setData([]);
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
    if (field && value !== undefined) {
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
    }, async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setData([]);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [db, path, field, value]);

  return { data, loading };
};

export { useCollection };
