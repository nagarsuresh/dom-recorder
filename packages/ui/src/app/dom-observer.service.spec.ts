import { TestBed } from '@angular/core/testing';

import { DomObserverService } from './dom-observer.service';

describe('DomObserverService', () => {
  let service: DomObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
