import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private zone = inject(NgZone);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['student', [Validators.required]]
  });

  loading = false;
  error: string | null = null;

  get f() {
    return this.form.controls;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { name, email, password, role } = this.form.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email!,
        password!
      );

      const user = userCredential.user;

      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });

      // Asegura navegación estable
      this.zone.run(() => {
        this.router.navigate(['/login']);
      });

    } catch (err: any) {
      this.error = err?.message || 'Error al registrar el usuario';
    } finally {
      this.loading = false;
    }
  }
}
