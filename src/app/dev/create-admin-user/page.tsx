
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore as db } from '@/firebase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function DevCreateAdminUserPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setLoading(true);

    const email = 'bisweswarsahu834@gmail.com';
    const password = '123456';
    const name = 'Admin User';
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await updateProfile(user, { displayName: name });

      const userData = {
        uid: user.uid,
        name,
        email,
        role: 'admin',
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      toast({
        title: "Admin User Created!",
        description: `Successfully created admin user: ${email}`,
      });
      
    } catch (err: any) {
       if (err.code === 'auth/email-already-in-use') {
           toast({
            variant: 'default',
            title: 'User Already Exists',
            description: 'This admin user account has already been created. You can log in.',
          });
       } else {
           toast({
            variant: 'destructive',
            title: 'Creation Failed',
            description: err.message,
          });
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-muted">
        <div className="w-full max-w-md rounded-lg bg-background p-8 shadow-lg">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Developer Tool</h1>
                <p className="mt-2 text-muted-foreground">Click the button to create the default admin user account.</p>
            </div>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Email:</span> bisweswarsahu834@gmail.com</p>
                <p><span className="font-semibold text-foreground">Password:</span> 123456</p>
                <p><span className="font-semibold text-foreground">Role:</span> admin</p>
            </div>
            <Button onClick={handleCreateAdmin} disabled={loading} className="mt-6 w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Admin User
            </Button>
        </div>
    </div>
  );
}
