import { Component } from '@angular/core';

import { DomObserverService } from './dom-observer.service';

@Component({
  selector: 'dom-recorder-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ui';

  constructor(private domObserver: DomObserverService) {
  }
}
