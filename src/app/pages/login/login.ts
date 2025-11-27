import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get f() { return this.form.controls; }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;

    try {
      // 1. LOGIN
      const result = await signInWithEmailAndPassword(this.auth, email!, password!);

      const uid = result.user.uid;

      // 2. LEER EL ROL DESDE FIRESTORE
      const userRef = doc(this.firestore, `users/${uid}`);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        this.error = 'El usuario no tiene datos registrados.';
        this.loading = false;
        return;
      }

      const data: any = snap.data();
      const role = data.role;

      // 3. REDIRECCIÓN SEGÚN ROL
      if (role === 'teacher') {
        this.router.navigate(['/upload-video']);
      } else if (role === 'student') {
        this.router.navigate(['/watch-video']);
      } else {
        this.router.navigate(['/home']);
      }

    } catch (err: any) {
      console.error(err);
      this.error = err.message || 'Error iniciando sesión.';
    }

    this.loading = false;
  }
}
