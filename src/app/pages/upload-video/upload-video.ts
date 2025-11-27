import { Component, inject, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-video.html',
  styleUrls: ['./upload-video.scss']
})
export class UploadVideo implements OnDestroy {
  
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private zone = inject(NgZone);

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: ['', Validators.required]
  });

  get f() { return this.form.controls; }

  formOpen = false;
  loading = false;
  loadingList = true;
  error: string | null = null;

  thumbnailPreview: string | null = null;
  thumbnailFile: File | null = null;

  selectedVideoFile: File | null = null;
  videoPreviewUrl: string | null = null;

  videos: any[] = [];
  private currentUser: User | null = null;
  private unsubAuth: (() => void) | null = null;
  private unsubVideos: (() => void) | null = null;

  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.uploadPreset;

  constructor() {
    this.unsubAuth = onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.listenVideos();
    });
  }

  //---------------------------------------------------------------
  // CARGA REACTIVA (FIX)
  //---------------------------------------------------------------
  listenVideos() {
    if (this.unsubVideos) this.unsubVideos();
    this.videos = [];

    if (!this.currentUser) return;

    this.loadingList = true;

    const col = collection(this.firestore, 'videos');
    const q = query(col, where('ownerUid', '==', this.currentUser.uid));

    this.unsubVideos = onSnapshot(q, (snap) => {
      const temp: any[] = [];

      snap.forEach(d => temp.push({ id: d.id, ...(d.data() as any) }));

      // Ordenar sin romper si createdAt todavía no existe
      temp.sort((a, b) => {
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });

      this.zone.run(() => {
        this.videos = temp;
        this.loadingList = false;
      });
    });
  }

  //---------------------------------------------------------------
  // FORMULARIO
  //---------------------------------------------------------------
  openForm() {
    this.resetForm();
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
  }

  resetForm() {
    this.form.reset({ title: '', description: '', category: '' });

    this.thumbnailPreview = null;
    this.thumbnailFile = null;

    if (this.videoPreviewUrl) URL.revokeObjectURL(this.videoPreviewUrl);
    this.videoPreviewUrl = null;
    this.selectedVideoFile = null;

    this.error = null;
  }

  //---------------------------------------------------------------
  // MINIATURA
  //---------------------------------------------------------------
  onThumbnailChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.thumbnailFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => this.thumbnailPreview = reader.result as string;
    reader.readAsDataURL(this.thumbnailFile);
  }

  //---------------------------------------------------------------
  // VIDEO
  //---------------------------------------------------------------
  onVideoFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedVideoFile = input.files[0];

    if (this.videoPreviewUrl) URL.revokeObjectURL(this.videoPreviewUrl);
    this.videoPreviewUrl = URL.createObjectURL(this.selectedVideoFile);
  }

  //---------------------------------------------------------------
  // SUBIDA CLOUDINARY
  //---------------------------------------------------------------
  private async uploadToCloudinary(file: File, type: 'image' | 'video'): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${type}/upload`;

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', this.uploadPreset);

    const res = await fetch(url, {
      method: 'POST',
      body: data
    });

    if (!res.ok) throw new Error('Error subiendo archivo a Cloudinary');
    const json = await res.json();
    return json.secure_url;
  }

  //---------------------------------------------------------------
  // PUBLICAR VIDEO
  //---------------------------------------------------------------
  async onSubmit() {
    if (this.form.invalid) return this.form.markAllAsTouched();

    if (!this.currentUser) {
      this.error = 'Usuario no autenticado.';
      return;
    }

    if (!this.thumbnailFile || !this.selectedVideoFile) {
      this.error = 'Debes subir miniatura y video.';
      return;
    }

    this.loading = true;
    this.error = null;

    const { title, description, category } = this.form.value;

    try {
      // Subir archivos en paralelo
      const [thumbUrl, videoUrl] = await Promise.all([
        this.uploadToCloudinary(this.thumbnailFile, 'image'),
        this.uploadToCloudinary(this.selectedVideoFile, 'video')
      ]);

      const colRef = collection(this.firestore, 'videos');

      await addDoc(colRef, {
        title,
        description,
        category,
        thumbnailUrl: thumbUrl,
        videoUrl,
        ownerUid: this.currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Cerrar formulario
      this.zone.run(() => this.formOpen = false);
      this.resetForm();

    } catch (err) {
      console.error(err);
      this.error = 'No se pudo publicar el video.';
    }

    this.loading = false;
  }

  //---------------------------------------------------------------
  // DESTROY
  //---------------------------------------------------------------
  ngOnDestroy() {
    if (this.unsubAuth) this.unsubAuth();
    if (this.unsubVideos) this.unsubVideos();
  }
}
