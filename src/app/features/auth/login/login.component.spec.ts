import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'login',
      'isLoggedIn',
      'isValidEmail'
    ]);
    authServiceMock.isLoggedIn.and.returnValue(false);
    authServiceMock.isValidEmail.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty email and password initially', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should toggle password visibility', () => {
    component.password = 'test';
    expect(component.showPassword()).toBeFalse();
    component.togglePassword();
    expect(component.showPassword()).toBeTrue();
    component.togglePassword();
    expect(component.showPassword()).toBeFalse();
  });

  it('should not toggle password visibility when password is empty', () => {
    component.password = '';
    component.togglePassword();
    expect(component.showPassword()).toBeFalse();
  });

  it('should clear errors', () => {
    component.emailError.set('Some error');
    component.passwordError.set('Another error');
    component.clearErrors();
    expect(component.emailError()).toBe('');
    expect(component.passwordError()).toBe('');
  });

  it('should set email error when email is empty on submit', async () => {
    component.email = '';
    await component.onSubmit();
    expect(component.emailError()).toBe('Email is required');
  });

  it('should set email error when email is invalid', async () => {
    component.email = 'invalid-email';
    authServiceMock.isValidEmail.and.returnValue(false);
    await component.onSubmit();
    expect(component.emailError()).toBe('Please enter a valid email');
  });

  it('should set password error when password is empty', async () => {
    component.email = 'test@example.com';
    component.password = '';
    await component.onSubmit();
    expect(component.passwordError()).toBe('Password is required');
  });

  it('should call authService.login on valid submit', async () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    authServiceMock.login.and.returnValue(Promise.resolve({ success: true }));

    await component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should set password error on failed login', async () => {
    component.email = 'test@example.com';
    component.password = 'wrongpassword';
    authServiceMock.login.and.returnValue(
      Promise.resolve({ success: false, error: 'Invalid credentials' })
    );

    await component.onSubmit();

    expect(component.passwordError()).toBe('Invalid credentials');
  });

  it('should call guestLogin with guest credentials', async () => {
    authServiceMock.login.and.returnValue(Promise.resolve({ success: true }));

    await component.guestLogin();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'guest',
      password: 'guest123'
    });
  });
});
