import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Register } from './register';

describe('Register component', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Register component', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should accept valid values', () => {
    component.form.setValue({
      name: 'Juan Perez',
      email: 'juan@example.com',
      password: '123456',
      role: 'student'
    });
    expect(component.form.valid).toBeTruthy();
  });
});