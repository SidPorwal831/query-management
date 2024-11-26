import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryService } from '../../services/query.service';

@Component({
  standalone: true,
  selector: 'app-query-manager',
  templateUrl: './query-manager.component.html',
  styleUrls: ['./query-manager.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class QueryManagerComponent implements OnInit {
  queries: any[] = [];
  availableApis: any[] = [];
  newQuery: any = {
    name: '',
    interval: 0,
    api: null,
    params: {},
    selectedQueryParam: '',
    responseAttribute: '',
  };

  showAddQueryForm = false;
  availableParameters: string[] = [];
  availableResponseAttributes: string[] = [];
  isDuplicateName: boolean = false;

  objectKeys = Object.keys;

  constructor(private queryService: QueryService) {}

  ngOnInit() {
    this.queryService.getAvailableApis().subscribe((apis) => {  
      this.availableApis = apis;
    });

    this.queryService.getQueries().subscribe((queries) => {
      this.queries = queries;
    });
  }

  toggleAddQueryForm() {
    this.showAddQueryForm = !this.showAddQueryForm;
  }

  updateAvailableParameters() {
    if (this.newQuery.api) {
      const selectedApi = this.availableApis.find((api) => api.name === this.newQuery.api);
      if (selectedApi) {
        this.availableParameters = selectedApi.queryParameters;
        this.availableResponseAttributes = selectedApi.responseAttributes;
        this.newQuery.params = {};                    // Reset query parameters when a new API is called.
        this.newQuery.selectedQueryParam = ''; 
      }
    }
  }

  checkDuplicateName() {                             
    this.isDuplicateName = this.queries.some(
      (query) => query.name.trim().toLowerCase() === this.newQuery.name.trim().toLowerCase()
    );
  }

  validationErrors: { [key: string]: string } = {};

  addQueryParameter() {
    if (this.newQuery.selectedQueryParam) {
      if (!this.newQuery.params[this.newQuery.selectedQueryParam]) {
        this.newQuery.params[this.newQuery.selectedQueryParam] = '';
      }
      this.validationErrors[this.newQuery.selectedQueryParam] = '';
    }
  }
    validateParameter(param: string) {                // Validates the user input for a query parameter against the mock data of the selected API
    const value = this.newQuery.params[param]; 
  this.validationErrors[param] = ''; 

  if (value && this.newQuery.api) {
    const selectedApi = this.availableApis.find((api) => api.name === this.newQuery.api);
    if (selectedApi && selectedApi.mockData) {         // Check if the value exists in the mockData for the given parameter
      const isValid = selectedApi.mockData.some((item: any) => String(item[param]) === value);

      if (!isValid) {                         
        this.validationErrors[param] = `Invalid value "${value}" for parameter "${param}".`;
      }
    } else {
      this.validationErrors[param] = `No data available for validation in the selected API.`;
    }
  }
}

  addQuery() {
    if (!this.newQuery.api) {
      alert('Please select an API!');
      return;
    }

    this.queryService.addQuery(this.newQuery).subscribe((savedQuery) => {
      if (savedQuery) {
        this.newQuery = {
          name: '',
          interval: 0,
          api: null,
          params: {},
          selectedQueryParam: '',
          responseAttribute: '',
        };
        this.showAddQueryForm = false;
      }

    });
  }

  removeQuery(id: string) {
    this.queryService.removeQuery(id).subscribe(() => {
      this.queries = this.queries.filter((query) => query.id !== id);
    });
  }
}