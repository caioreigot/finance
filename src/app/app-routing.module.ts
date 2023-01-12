import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatementComponent } from './views/statement/statement.component';
import { TableComponent } from './views/table/table.component';
import { PlanningComponent } from './views/planning/planning.component';
import { PageNotFoundComponent } from './views/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    component: TableComponent
  },
  {
    path: 'statement',
    component: StatementComponent
  },
  {
    path: 'planning',
    component: PlanningComponent
  },
  { 
    path: '**',
    pathMatch: 'full', 
    component: PageNotFoundComponent 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}