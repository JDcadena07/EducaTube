import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export const studentGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  const user = auth.currentUser;
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const ref = doc(firestore, `users/${user.uid}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    router.navigate(['/login']);
    return false;
  }

  const role = (snap.data() as any).role;
  if (role === 'student') return true;

  router.navigate(['/']);
  return false;
};
