import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchVideo } from './watch-video';

describe('WatchVideo', () => {
  let component: WatchVideo;
  let fixture: ComponentFixture<WatchVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchVideo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchVideo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
