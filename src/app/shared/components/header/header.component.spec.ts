import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services';
import { signal } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: signal({ initials: 'TU', name: 'Test User' })
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu open state', () => {
    expect(component.menuOpen()).toBeFalse();
    component.toggleMenu();
    expect(component.menuOpen()).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen()).toBeFalse();
  });

  it('should close menu', () => {
    component.menuOpen.set(true);
    component.closeMenu();
    expect(component.menuOpen()).toBeFalse();
  });

  it('should call logout on authService', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should close menu when logout is called', () => {
    component.menuOpen.set(true);
    component.logout();
    expect(component.menuOpen()).toBeFalse();
  });

  it('should render header title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.header-title');
    expect(title?.textContent).toContain('Kanban Project Management Tool');
  });
});
