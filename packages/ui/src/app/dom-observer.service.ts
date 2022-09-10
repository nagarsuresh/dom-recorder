import { Injectable } from '@angular/core';
import { IMutationSerializer, MutationSerializer } from '@dom-recorder/mutation-observer';

@Injectable({
  providedIn: 'root'
})
export class DomObserverService {

  private serializer: IMutationSerializer;

  constructor() {
    this.serializer = new MutationSerializer();
  }

  public startObserving() {
    const mObserver = new MutationObserver(
      (mutations: MutationRecord[]) => {
        const transformed = this.serializer.serializeMutations(mutations);
        console.log(JSON.stringify(transformed));
      });

    mObserver.observe(document.body, {
      attributes: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });
  }

}
