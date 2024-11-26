import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private apiUrl = 'http://localhost:3000/queries';
  private mockApiRepositoryUrl = 'http://localhost:3000/apis';

  private queriesSubject = new BehaviorSubject<any[]>([]);        //Manages List of queries
  private queryResultsSubject = new BehaviorSubject<any[]>([]);   //Manages the results of executed queries
  private queries: any[] = [];
  private queryTimers: { [key: string]: any } = {};

  // Initialization
  constructor(private http: HttpClient) {
    this.loadQueriesFromServer();
  }
   
  loadQueriesFromServer(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (queries) => {
        Object.keys(this.queryTimers).forEach((id) => this.stopQueryTimer(id));   
  
        this.queries = queries; 
        this.queriesSubject.next(this.queries); 
        this.queryResultsSubject.next([]); // Reset query results for a fresh start

        this.startAllQueryTimers();
      },
      error: (error) => {
        console.error('Error loading queries:', error);
      },
      complete: () => {
        console.log('Queries successfully loaded and timers started.');
      }
    });
  }

  getAvailableApis(): Observable<any[]> {
    return this.http.get<any[]>(this.mockApiRepositoryUrl);
  }

  getQueries(): Observable<any[]> {
    return this.queriesSubject.asObservable();
  }

  getQueryResults(): Observable<any[]> {
    return this.queryResultsSubject.asObservable();
  }

  // Query Management
  
  addQuery(query: any): Observable<any> {
    const isDuplicate = this.queries.some(
      (existingQuery) =>
        existingQuery.name === query.name &&
        existingQuery.api === query.api &&
        JSON.stringify(existingQuery.params) === JSON.stringify(query.params)
    );

    if (isDuplicate) {
      console.log('Duplicate query detected. Skipping save.');
      return of(null);
    }

    return this.http.post<any>(this.apiUrl, query).pipe(
      tap((savedQuery) => {
        this.queries.push(savedQuery); 
        this.queriesSubject.next(this.queries); 
        this.startQueryTimer(savedQuery); 
      })
    );
  }

  removeQuery(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.stopQueryTimer(id); 
        const removedQuery = this.queries.find((q) => q.id === id); 
        this.queries = this.queries.filter((query) => query.id !== id); 
        this.queriesSubject.next(this.queries); 

        if (removedQuery) {
          const currentResults = this.queryResultsSubject.getValue();
          const updatedResults = currentResults.filter(
            (result) => result.name !== removedQuery.name
          );
          this.queryResultsSubject.next(updatedResults);
        }
      }),
      map(() => true)
    );
  }

  // Timer Management

  private startQueryTimer(query: any): void {
    this.stopQueryTimer(query.id); 
    this.executeAndUpdateResults(query); 
    const interval = query.interval * 1000; 
    const timer = setInterval(() => {
      this.executeAndUpdateResults(query); 
    }, interval);
    this.queryTimers[query.id] = timer; 
  }

  private stopQueryTimer(id: string): void {
    const timer = this.queryTimers[id]; 
    if (timer) {
      clearInterval(timer); 
      delete this.queryTimers[id]; 
    }
  }

  private startAllQueryTimers(): void {
    Object.keys(this.queryTimers).forEach((id) => this.stopQueryTimer(id)); 
    this.queries.forEach((query) => this.startQueryTimer(query)); 
  }

  executeQuery(apiName: string, params: any): Observable<any[]> {
    return this.http.get<any[]>(this.mockApiRepositoryUrl).pipe(
      map((apis) => {
        const api = apis.find((api) => api.name === apiName);
        if (!api) {
          console.error(`API "${apiName}" not found.`);
          return [];
        }

        Object.keys(params).forEach((key) => {
          const valueExists = api.mockData.some(
            (item: any) => String(item[key]) === params[key]
          );
          if (!valueExists) {
            throw new Error(
              `Invalid value "${params[key]}" for parameter "${key}". Please check your input.`
            );
          }
        });

        return api.mockData.filter((item: { [key: string]: any }) =>
          Object.keys(params).every((key) => String(item[key]) === params[key])
        );
      })
    );
  }

  private executeAndUpdateResults(query: any): void {
    if (this.queries.find((q) => q.id === query.id)) {
      this.executeQuery(query.api, query.params).subscribe((results) => {
        console.log(`Results for query "${query.name}":`, results);
        const currentResults = this.queryResultsSubject.getValue(); 
        const updatedResults = currentResults.map((result) =>
          result.name === query.name ? { ...result, results } : result
        );

        if (!currentResults.find((r) => r.name === query.name)) {
          updatedResults.push({
            name: query.name,
            interval: query.interval,
            results,
            queryId: query.id,
          });
        }

        this.queryResultsSubject.next(updatedResults); 
      });
    }
  }
}
