import { TestBed } from '@angular/core/testing';

import { RebuilderService } from './rebuilder.service';

describe('RebuilderService', () => {
  let service: RebuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RebuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
