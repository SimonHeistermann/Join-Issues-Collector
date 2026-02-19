import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WelcomeComponent } from './welcome.component';
import { AuthService } from '../../../core/services';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let router: Router;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    authServiceMock.isLoggedIn.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [WelcomeComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to summary if already logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    const navigateSpy = spyOn(router, 'navigate');

    component.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith(['/summary']);
  });

  it('should not redirect if not logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    const navigateSpy = spyOn(router, 'navigate');

    component.ngOnInit();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to stakeholder page when goToStakeholder is called', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.goToStakeholder();

    expect(navigateSpy).toHaveBeenCalledWith(['/stakeholder']);
  });

  it('should navigate to login page when goToLogin is called', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.goToLogin();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
