import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['register', 'isValidEmail']);
    authServiceMock.isValidEmail.and.returnValue(true);
    authServiceMock.register.and.returnValue(Promise.resolve({ success: true }));

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form fields', () => {
    expect(component.name).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.confirmPassword).toBe('');
    expect(component.acceptPrivacy).toBe(false);
  });

  it('should initialize with default UI state', () => {
    expect(component.showPassword()).toBe(false);
    expect(component.showConfirmPassword()).toBe(false);
    expect(component.isLoading()).toBe(false);
    expect(component.showSuccess()).toBe(false);
  });

  it('should initialize with empty error messages', () => {
    expect(component.nameError()).toBe('');
    expect(component.emailError()).toBe('');
    expect(component.passwordError()).toBe('');
    expect(component.confirmPasswordError()).toBe('');
    expect(component.privacyError()).toBe('');
  });

  describe('togglePassword', () => {
    it('should toggle password visibility when password has value', () => {
      component.password = 'test123';
      expect(component.showPassword()).toBe(false);
      component.togglePassword();
      expect(component.showPassword()).toBe(true);
      component.togglePassword();
      expect(component.showPassword()).toBe(false);
    });

    it('should not toggle password visibility when password is empty', () => {
      component.password = '';
      component.togglePassword();
      expect(component.showPassword()).toBe(false);
    });
  });

  describe('toggleConfirmPassword', () => {
    it('should toggle confirm password visibility when confirmPassword has value', () => {
      component.confirmPassword = 'test123';
      expect(component.showConfirmPassword()).toBe(false);
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword()).toBe(true);
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword()).toBe(false);
    });

    it('should not toggle confirm password visibility when confirmPassword is empty', () => {
      component.confirmPassword = '';
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword()).toBe(false);
    });
  });

  describe('clearError', () => {
    beforeEach(() => {
      component.nameError.set('Name error');
      component.emailError.set('Email error');
      component.passwordError.set('Password error');
      component.confirmPasswordError.set('Confirm password error');
      component.privacyError.set('Privacy error');
    });

    it('should clear name error', () => {
      component.clearError('name');
      expect(component.nameError()).toBe('');
    });

    it('should clear email error', () => {
      component.clearError('email');
      expect(component.emailError()).toBe('');
    });

    it('should clear password error', () => {
      component.clearError('password');
      expect(component.passwordError()).toBe('');
    });

    it('should clear confirmPassword error', () => {
      component.clearError('confirmPassword');
      expect(component.confirmPasswordError()).toBe('');
    });

    it('should clear privacy error', () => {
      component.clearError('privacy');
      expect(component.privacyError()).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should set name error when name is empty', async () => {
      component.name = '';
      await component.onSubmit();
      expect(component.nameError()).toBe('Name is required');
    });

    it('should set email error when email is empty', async () => {
      component.name = 'Test User';
      component.email = '';
      await component.onSubmit();
      expect(component.emailError()).toBe('Email is required');
    });

    it('should set email error when email is invalid', async () => {
      authServiceMock.isValidEmail.and.returnValue(false);
      component.name = 'Test User';
      component.email = 'invalid-email';
      await component.onSubmit();
      expect(component.emailError()).toBe('Please enter a valid email');
    });

    it('should set password error when password is empty', async () => {
      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '';
      await component.onSubmit();
      expect(component.passwordError()).toBe('Password is required');
    });

    it('should set password error when password is too short', async () => {
      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '12345';
      await component.onSubmit();
      expect(component.passwordError()).toBe('Password must be at least 6 characters');
    });

    it('should set confirmPassword error when confirmPassword is empty', async () => {
      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '';
      await component.onSubmit();
      expect(component.confirmPasswordError()).toBe('Please confirm your password');
    });

    it('should set confirmPassword error when passwords do not match', async () => {
      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '654321';
      await component.onSubmit();
      expect(component.confirmPasswordError()).toBe('Passwords do not match');
    });

    it('should set privacy error when privacy policy is not accepted', async () => {
      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      component.acceptPrivacy = false;
      await component.onSubmit();
      expect(component.privacyError()).toBe('Please accept the privacy policy');
    });

    it('should call authService.register with valid form data', async () => {
      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      component.acceptPrivacy = true;

      await component.onSubmit();

      expect(authServiceMock.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
        confirmPassword: '123456',
        acceptPrivacy: true
      });
    });

    it('should show success message on successful registration', async () => {
      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      component.acceptPrivacy = true;

      await component.onSubmit();

      expect(component.showSuccess()).toBe(true);
    });

    it('should set email error on failed registration', async () => {
      authServiceMock.register.and.returnValue(Promise.resolve({
        success: false,
        error: 'Email already exists'
      }));

      component.name = 'Test User';
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      component.acceptPrivacy = true;

      await component.onSubmit();

      expect(component.emailError()).toBe('Email already exists');
    });
  });
});
