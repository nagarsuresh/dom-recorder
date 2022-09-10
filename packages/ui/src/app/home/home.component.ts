import { Component } from '@angular/core';
import { DomObserverService } from '../dom-observer.service';

@Component({
  selector: 'dom-recorder-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private domService: DomObserverService) {

  }

  startRecording() {
    this.domService.startObserving();
  }

}
