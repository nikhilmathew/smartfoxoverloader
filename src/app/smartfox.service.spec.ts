import { TestBed } from '@angular/core/testing';

import { SmartfoxService } from './smartfox.service';

describe('SmartfoxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmartfoxService = TestBed.get(SmartfoxService);
    expect(service).toBeTruthy();
  });
});
