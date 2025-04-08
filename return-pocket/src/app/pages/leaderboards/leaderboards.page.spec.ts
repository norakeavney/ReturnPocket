import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardsPage } from './leaderboards.page';

describe('LeaderboardsPage', () => {
  let component: LeaderboardsPage;
  let fixture: ComponentFixture<LeaderboardsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
