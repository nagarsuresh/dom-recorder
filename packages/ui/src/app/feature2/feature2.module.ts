import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feature2Component } from './feature2.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    Feature2Component
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      pathMatch: 'full',
      component: Feature2Component
    }])
  ]
})
export class Feature2Module { }
