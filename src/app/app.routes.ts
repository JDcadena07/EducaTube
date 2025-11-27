import { Routes } from '@angular/router';
import { teacherGuard } from './guards/teacher.guard';
import { studentGuard } from './guards/student.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },

  // SOLO PROFESOR
  {
    path: 'upload-video',
    canActivate: [teacherGuard],
    loadComponent: () => import('./pages/upload-video/upload-video').then(m => m.UploadVideo)
  },

  // SOLO ESTUDIANTE
  {
    path: 'watch-video',
    canActivate: [studentGuard],
    loadComponent: () => import('./pages/watch-video/watch-video').then(m => m.WatchVideo)
  },

  { path: '**', redirectTo: '' }
];
