import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'feature1',
        loadChildren: () => import('./feature1/feature1.module').then(m => m.Feature1Module)
      },
      {
        path: 'feature2',
        loadChildren: () => import('./feature2/feature2.module').then(m => m.Feature2Module)
      }
    ], { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
