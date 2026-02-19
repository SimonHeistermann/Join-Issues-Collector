import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriorityIconComponent } from './priority-icon.component';

describe('PriorityIconComponent', () => {
  let component: PriorityIconComponent;
  let fixture: ComponentFixture<PriorityIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityIconComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PriorityIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty priority by default', () => {
    expect(component.priority).toBe('');
  });

  it('should return low icon path for priority 1', () => {
    component.priority = 1;
    expect(component.iconPath()).toBe('assets/icons/low_icon_green.png');
  });

  it('should return medium icon path for priority 2', () => {
    component.priority = 2;
    expect(component.iconPath()).toBe('assets/icons/medium_icon_orange.png');
  });

  it('should return urgent icon path for priority 3', () => {
    component.priority = 3;
    expect(component.iconPath()).toBe('assets/icons/urgent_icon_red.png');
  });

  it('should return empty string for invalid priority', () => {
    component.priority = '' as any;
    expect(component.iconPath()).toBe('');
  });

  it('should not render when priority is empty', () => {
    component.priority = '';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.priority-icon');
    expect(icon).toBeFalsy();
  });

  it('should render when priority is set', () => {
    component.priority = 2;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.priority-icon');
    expect(icon).toBeTruthy();
  });
});
