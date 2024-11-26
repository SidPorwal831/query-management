import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryService } from '../../services/query.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-query-results',
  templateUrl: './query-results.component.html',
  styleUrls: ['./query-results.component.scss'],
  imports: [CommonModule],
})
export class QueryResultsComponent implements OnInit, OnDestroy {
  queryResults: any[] = [];
  queries: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  private querySubscription?: Subscription;
  private resultsSubscription?: Subscription;

  constructor(private queryService: QueryService) {}

  ngOnInit() {
    this.setupSubscriptions();
  }

  ngOnDestroy() {                                 
    this.querySubscription?.unsubscribe();              // Clean up subscriptions to prevent memory leaks
    this.resultsSubscription?.unsubscribe();
  }

  private setupSubscriptions() {
    this.loading = true;
    this.queryService.loadQueriesFromServer()
    this.querySubscription = this.queryService.getQueries().subscribe({     
      next: (queries) => {
        this.queries = queries;
        this.initializeQueryResults();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching queries:', err);
        this.errorMessage = 'Failed to fetch queries.';
        this.loading = false;
      },
    });

    this.resultsSubscription = this.queryService.getQueryResults().subscribe({    
      next: (results) => {
        results.forEach((result) => {
          const queryIndex = this.queryResults.findIndex(
            (q) => q.name === result.name
          );
          
          if (queryIndex !== -1) {
            const query = this.queries.find((q) => q.name === result.name);      
            if (query) {
              this.queryResults[queryIndex] = {
                ...this.queryResults[queryIndex],
                results: result.results.map(
                  (item: any) => item[query.responseAttribute] || 'N/A'
                ),
              };
            }
          }
        });
      },
      error: (err) => {
        console.error('Error receiving query results:', err);
        this.errorMessage = 'Error receiving real-time updates.';
      },
    });
  }

  private initializeQueryResults() {                      // Initialize the results array with empty results for each query
    this.queryResults = this.queries.map((query) => ({
      name: query.name,
      interval: query.interval,
      responseAttribute: query.responseAttribute,
      results: [],
    }));
  }
}
