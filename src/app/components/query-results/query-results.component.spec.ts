import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { QueryResultsComponent } from './query-results.component';
import { QueryService } from '../../services/query.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('QueryResultsComponent', () => {
  let component: QueryResultsComponent;
  let fixture: ComponentFixture<QueryResultsComponent>;
  let queryService: QueryService;

  const mockQueries = [
    {
      name: 'Books by Author',
      interval: 10,
      api: 'Books API',
      params: { Author: 'John Doe' },
      responseAttribute: 'Title',
    },
    {
      name: 'Books by Genre',
      interval: 20,
      api: 'Genre API',
      params: { Genre: 'Fantasy' },
      responseAttribute: 'Author',
    },
  ];

  const mockResults = [
    { Title: 'Book A', Author: 'Author X' },
    { Title: 'Book B', Author: 'Author Y' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryResultsComponent, HttpClientTestingModule], // Standalone component
      providers: [QueryService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryResultsComponent);
    component = fixture.componentInstance;
    queryService = TestBed.inject(QueryService);

    spyOn(queryService, 'getQueries').and.returnValue(of(mockQueries));
    spyOn(queryService, 'executeQuery').and.returnValue(of(mockResults));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading indicator while fetching results', fakeAsync(() => {
    component.loading = true;
    fixture.detectChanges();

    const loadingElement = fixture.nativeElement.querySelector('.spinner-border');
    expect(loadingElement).toBeTruthy();

    component.loading = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.spinner-border')).toBeNull();
  }));

  it('should display error message when there is an error', fakeAsync(() => {
    component.errorMessage = 'Error fetching results';
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Error fetching results');
  }));

  it('should display no results message when no queries are executed', fakeAsync(() => {
    component.queryResults = [];
    fixture.detectChanges();

    const noResultsElement = fixture.nativeElement.querySelector('.alert-info');
    expect(noResultsElement).toBeTruthy();
    expect(noResultsElement.textContent).toContain('No queries have been executed yet.');
  }));
});
