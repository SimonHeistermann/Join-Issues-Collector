import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('.nav-item');
    expect(navLinks.length).toBe(4);
  });

  it('should render footer links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footerLinks = compiled.querySelectorAll('.footer-link');
    expect(footerLinks.length).toBe(2);
  });

  it('should have logo link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoLink = compiled.querySelector('.sidebar-logo a');
    expect(logoLink).toBeTruthy();
  });
});
