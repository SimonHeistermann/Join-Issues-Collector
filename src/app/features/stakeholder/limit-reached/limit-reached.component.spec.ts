import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LimitReachedComponent } from './limit-reached.component';
import { RateLimitService } from '../../../core/services';

describe('LimitReachedComponent', () => {
  let component: LimitReachedComponent;
  let fixture: ComponentFixture<LimitReachedComponent>;
  let router: Router;
  let rateLimitServiceMock: jasmine.SpyObj<RateLimitService>;

  beforeEach(async () => {
    rateLimitServiceMock = jasmine.createSpyObj('RateLimitService', ['getTimeUntilResetString']);
    rateLimitServiceMock.getTimeUntilResetString.and.returnValue('12 hours 30 minutes');

    await TestBed.configureTestingModule({
      imports: [
        LimitReachedComponent,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: RateLimitService, useValue: rateLimitServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LimitReachedComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize timeUntilReset on init', () => {
    expect(rateLimitServiceMock.getTimeUntilResetString).toHaveBeenCalled();
    expect(component.timeUntilReset()).toBe('12 hours 30 minutes');
  });

  it('should navigate to welcome page when goBack is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/welcome']);
  });

  it('should update countdown periodically', fakeAsync(() => {
    rateLimitServiceMock.getTimeUntilResetString.calls.reset();
    rateLimitServiceMock.getTimeUntilResetString.and.returnValue('12 hours 29 minutes');

    tick(60000);

    expect(rateLimitServiceMock.getTimeUntilResetString).toHaveBeenCalled();
  }));

  it('should clear interval on destroy', () => {
    const clearIntervalSpy = spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should display the limit reached message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Daily Limit Reached');
  });

  it('should display reset time information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.reset-time')?.textContent).toContain('12 hours 30 minutes');
  });

  it('should have a back button that triggers goBack', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const compiled = fixture.nativeElement as HTMLElement;
    const backBtn = compiled.querySelector('.back-btn') as HTMLButtonElement;

    backBtn.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/welcome']);
  });
});
