import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feature1Component } from './feature1.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    Feature1Component
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      pathMatch: 'full',
      component: Feature1Component
    }])
  ]
})
export class Feature1Module { }
