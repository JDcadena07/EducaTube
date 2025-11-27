import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, query, orderBy } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watch-video',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './watch-video.html',
  styleUrls: ['./watch-video.scss']
})
export class WatchVideo {
  private firestore = inject(Firestore);

  videos: any[] = [];
  filtered: any[] = [];
  loading = true;
  selected: any | null = null;

  category = "";

  async ngOnInit() {
    await this.loadVideos();
  }

  async loadVideos() {
    this.loading = true;

    const col = collection(this.firestore, 'videos');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    this.videos = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    this.filtered = [...this.videos];

    this.loading = false;
  }

  filter() {
    if (!this.category) {
      this.filtered = this.videos;
    } else {
      this.filtered = this.videos.filter(v => v.category === this.category);
    }
  }

  openVideo(v: any) {
    this.selected = v;
  }

  closeVideo() {
    this.selected = null;
  }
}
