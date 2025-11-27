import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  currentUser: any = null;
  role: string | null = null;

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUser = user;

        const ref = doc(this.firestore, 'users', user.uid);
        const snap = await getDoc(ref);

        this.role = snap.exists() ? snap.data()['role'] : null;
      } else {
        this.currentUser = null;
        this.role = null;
      }
    });
  }

  isTeacher(): boolean {
    return this.role === 'teacher';
  }

  isStudent(): boolean {
    return this.role === 'student';
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}
