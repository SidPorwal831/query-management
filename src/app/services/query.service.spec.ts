import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QueryService } from './query.service';

describe('QueryService', () => {
  let service: QueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QueryService],
    });

    service = TestBed.inject(QueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    const queryRequest = httpMock.match('http://localhost:3000/queries');
    queryRequest.forEach(req => req.flush([]));
    
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    const req = httpMock.expectOne('http://localhost:3000/queries');    // Handle the automatic queries request
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch available APIs', fakeAsync(() => {
    const queryReq = httpMock.expectOne('http://localhost:3000/queries');
    queryReq.flush([]);

    const mockApis = [
      { id: '1', name: 'Popular Books', queryParameters: ['Author', 'Genre'], mockData: [] },
    ];

    let result: any;
    service.getAvailableApis().subscribe((apis) => {
      result = apis;
    });

    const req = httpMock.expectOne('http://localhost:3000/apis');
    expect(req.request.method).toBe('GET');
    req.flush(mockApis);

    tick();

    expect(result).toEqual(mockApis);
  }));

  it('should remove a query', fakeAsync(() => {
    const queryReq = httpMock.expectOne('http://localhost:3000/queries');
    queryReq.flush([]);

    const queryId = '1';

    let result: any;
    service.removeQuery(queryId).subscribe((success) => {
      result = success;
    });

    const req = httpMock.expectOne(`http://localhost:3000/queries/${queryId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    tick();

    expect(result).toBeTrue();
  }));
});