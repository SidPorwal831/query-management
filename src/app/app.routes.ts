import { Routes } from '@angular/router';
import { QueryManagerComponent } from './components/query-manager/query-manager.component';
import { QueryResultsComponent } from './components/query-results/query-results.component';

export const routes: Routes = [
    { path: 'manage', component: QueryManagerComponent },
    { path: 'results', component: QueryResultsComponent },
    { path: '', redirectTo: 'manage', pathMatch: 'full' },
  ];
