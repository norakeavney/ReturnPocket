import { TestBed } from '@angular/core/testing';

import { ReceiptscanserviceService } from './receiptscanservice.service';

describe('ReceiptscanserviceService', () => {
  let service: ReceiptscanserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptscanserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
