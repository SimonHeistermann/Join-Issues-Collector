import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StakeholderInfoComponent } from './stakeholder-info.component';
import { RateLimitService } from '../../../core/services';

describe('StakeholderInfoComponent', () => {
  let component: StakeholderInfoComponent;
  let fixture: ComponentFixture<StakeholderInfoComponent>;
  let rateLimitServiceMock: jasmine.SpyObj<RateLimitService>;
  let router: Router;

  beforeEach(async () => {
    rateLimitServiceMock = jasmine.createSpyObj('RateLimitService', ['getTodayUsage']);
    rateLimitServiceMock.getTodayUsage.and.returnValue(Promise.resolve(0));

    await TestBed.configureTestingModule({
      imports: [StakeholderInfoComponent, RouterTestingModule],
      providers: [
        { provide: RateLimitService, useValue: rateLimitServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StakeholderInfoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load usage on init', async () => {
    rateLimitServiceMock.getTodayUsage.and.returnValue(Promise.resolve(5));

    await component.ngOnInit();

    expect(rateLimitServiceMock.getTodayUsage).toHaveBeenCalled();
    expect(component.usedRequests()).toBe(5);
  });

  it('should redirect to limit-reached when usage is at limit', async () => {
    const navigateSpy = spyOn(router, 'navigate');
    rateLimitServiceMock.getTodayUsage.and.returnValue(Promise.resolve(10));

    await component.loadUsage();

    expect(navigateSpy).toHaveBeenCalledWith(['/limit-reached']);
  });

  it('should not redirect when usage is below limit', async () => {
    const navigateSpy = spyOn(router, 'navigate');
    rateLimitServiceMock.getTodayUsage.and.returnValue(Promise.resolve(5));

    await component.loadUsage();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to welcome on goBack', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.goBack();

    expect(navigateSpy).toHaveBeenCalledWith(['/welcome']);
  });

  it('should open mailto link on createEmailRequest', () => {
    const originalHref = window.location.href;

    // Note: In a real test environment, you might want to mock window.location
    // This test verifies the method exists and can be called
    expect(() => component.createEmailRequest()).not.toThrow();
  });
});
