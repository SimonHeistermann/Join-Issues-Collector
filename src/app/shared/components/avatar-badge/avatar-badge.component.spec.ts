import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarBadgeComponent } from './avatar-badge.component';

describe('AvatarBadgeComponent', () => {
  let component: AvatarBadgeComponent;
  let fixture: ComponentFixture<AvatarBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size of 32', () => {
    expect(component.size).toBe(32);
  });

  it('should have empty name by default', () => {
    expect(component.name).toBe('');
  });

  it('should calculate fontSize based on size', () => {
    component.size = 40;
    expect(component.fontSize()).toBe(15);
  });

  it('should render avatar-badge element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.avatar-badge');
    expect(badge).toBeTruthy();
  });

  it('should apply size styles', () => {
    component.size = 48;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.avatar-badge');
    expect(badge.style.width).toBe('48px');
    expect(badge.style.height).toBe('48px');
  });
});
