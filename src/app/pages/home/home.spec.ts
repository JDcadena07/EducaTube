import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Home } from './home';

describe('Home component', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the Home component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title EducaTube', () => {
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.title');
    expect(title).toBeTruthy();
    expect(title!.textContent).toContain('EducaTube');
  });
  
});