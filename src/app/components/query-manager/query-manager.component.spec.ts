import { TestBed } from '@angular/core/testing';
import { QueryManagerComponent } from './query-manager.component';
import { QueryService } from '../../services/query.service';
import { of } from 'rxjs';

describe('QueryManagerComponent', () => {
  let component: QueryManagerComponent;
  let queryService: jasmine.SpyObj<QueryService>;

  beforeEach(() => {
    const queryServiceMock = jasmine.createSpyObj('QueryService', [
      'getAvailableApis',
      'getQueries',
      'addQuery',
      'removeQuery',
    ]);

    TestBed.configureTestingModule({
      imports: [QueryManagerComponent],                           // Import the standalone component
      providers: [{ provide: QueryService, useValue: queryServiceMock }],
    });

    queryService = TestBed.inject(QueryService) as jasmine.SpyObj<QueryService>;   // Initialize component and mock service
    component = TestBed.createComponent(QueryManagerComponent).componentInstance;

    // Mock responses for the QueryService
    queryService.getAvailableApis.and.returnValue(
      of([{ name: 'TestAPI', queryParameters: ['param1', 'param2'], responseAttributes: ['attr1', 'attr2'] }])
    );

    queryService.getQueries.and.returnValue(
      of([{ id: '1', name: 'TestQuery', interval: 30, api: 'TestAPI', params: {}, responseAttribute: 'attr1' }])
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load available APIs and queries on init', () => {
    component.ngOnInit();                                           // Call the lifecycle hook manually
    expect(queryService.getAvailableApis).toHaveBeenCalled();
    expect(queryService.getQueries).toHaveBeenCalled();
    expect(component.availableApis.length).toBe(1);
    expect(component.queries.length).toBe(1);
  });

  it('should toggle the add query form', () => {
    expect(component.showAddQueryForm).toBe(false);
    component.toggleAddQueryForm();
    expect(component.showAddQueryForm).toBe(true);
    component.toggleAddQueryForm();
    expect(component.showAddQueryForm).toBe(false);
  });

  it('should add a query parameter when selected', () => {
    component.newQuery.api = 'TestAPI';
    component.updateAvailableParameters();

    component.newQuery.selectedQueryParam = 'param1';
    component.addQueryParameter();

    expect(component.newQuery.params['param1']).toBe('');
  });

  it('should reset the form and close it after adding a query', () => {
    const newQuery = {
      name: 'NewQuery',
      interval: 60,
      api: 'TestAPI',
      params: { param1: 'value1' },
      selectedQueryParam: '',
      responseAttribute: 'attr1',
    };

    queryService.addQuery.and.returnValue(of(newQuery));
    component.newQuery = newQuery;

    component.addQuery();

    expect(component.newQuery).toEqual({
      name: '',
      interval: 0,
      api: null,
      params: {},
      selectedQueryParam: '',
      responseAttribute: '',
    });
    expect(component.showAddQueryForm).toBe(false);
  });

  it('should call removeQuery from the service and remove the query from the list', () => {
    component.queries = [
      { id: '1', name: 'TestQuery', interval: 30, api: 'TestAPI', params: {}, responseAttribute: 'attr1' },
    ];

    queryService.removeQuery.and.returnValue(of(true));
    component.removeQuery('1');

    expect(queryService.removeQuery).toHaveBeenCalledWith('1');
    expect(component.queries.length).toBe(0);
  });
});
