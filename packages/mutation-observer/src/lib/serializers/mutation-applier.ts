import { JSDOM } from 'jsdom';

import { MutationAppliersByType, IMutationRecord, NodeType, IMutationApplier } from '../dto';
import { IStyleSheet } from '../utils/stylesheets';

export class MutationApplier implements IMutationApplier {
  private dom: JSDOM;
  private sheets: IStyleSheet[];
  private appliersByMutationType: MutationAppliersByType = {
    childList: this.applyChildListMutation,
    attributes: this.applyAttributesMutation,
    characterData: this.applyCharacterDataMutation,
  };

  constructor(initialDom: string, styleSheets?: IStyleSheet[]) {
    this.dom = new JSDOM(initialDom);
    this.sheets = styleSheets || [];
  }

  get DOM(): string {
    return this.dom.serialize();
  }

  set DOM(currentDom: string) {
    this.dom = new JSDOM(currentDom);
  }

  get styleSheets(): IStyleSheet[] {
    return this.sheets;
  }

  set styleSheets(styleSheets: IStyleSheet[]) {
    this.sheets = styleSheets;
  }



  private getNodeByXPath(xpath: string): (Node | null) {
    const document = this.dom.window.document;
    let node: (Node | null);
    try {
      node = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    } catch (error) {
      node = null;
    }

    return node;
  }

  private getTargetInDomFromMutation(mutation: IMutationRecord): (Node | never | null) {
    const target = mutation.target;
    if (!target) {
      throw new Error('Mutation is missing target element');
    }

    const targetXPath = target.xpath;
    if (!target.xpath) {
      throw new Error('Mutation target is missing an XPath value');
    }

    const targetInDom = this.getNodeByXPath(targetXPath);
    if (!targetInDom) {
      return null;
    }

    return targetInDom;
  }

  private applyChildListMutation(mutation: IMutationRecord): void {
    const targetInDom = this.getTargetInDomFromMutation(mutation) as HTMLElement;
    if (!targetInDom) {
      return;
    }

    let previousSiblingInDom: HTMLElement | null;
    if (mutation.previousSibling?.xpath) {
      previousSiblingInDom = this.getNodeByXPath(mutation.previousSibling.xpath) as HTMLElement;
    }

    let nextSiblingInDom: HTMLElement | null;
    if (mutation.nextSibling?.xpath) {
      nextSiblingInDom = this.getNodeByXPath(mutation.nextSibling.xpath) as HTMLElement;
    }

    mutation.removedNodes.forEach((removedNode) => {
      if (removedNode?.sheet) {
        this.sheets = this.sheets.filter(sheet => {
          return JSON.stringify(sheet) !== JSON.stringify(removedNode?.sheet);
        });
      }

      let removedNodeInDom;
      if (removedNode?.xpath) {
        removedNodeInDom = this.getNodeByXPath(removedNode.xpath) as HTMLElement;
        if (removedNodeInDom) {
          removedNodeInDom.remove();
          return;
        }
      }

      let childInDomToRemove;
      if (previousSiblingInDom) {
        childInDomToRemove = previousSiblingInDom.nextSibling;
      } else if (nextSiblingInDom) {
        childInDomToRemove = nextSiblingInDom.previousSibling;
      } else {
        childInDomToRemove = targetInDom.firstChild;
      }

      if (!childInDomToRemove && !removedNode?.xpath?.startsWith('/html')) {
        removedNodeInDom = this.getNodeByXPath((mutation.target?.xpath || '') + (removedNode?.xpath || ''));
        if (removedNodeInDom) {
          (removedNodeInDom as HTMLElement).remove();
          return;
        }
      }

      if (!childInDomToRemove) {
        return;
      }

      targetInDom.removeChild(childInDomToRemove);
    });

    mutation.addedNodes.forEach((addedNode) => {
      const addedNodeAlreadyInDom = this.getNodeByXPath(addedNode?.xpath || '') as HTMLElement;

      const document = this.dom.window.document;

      let newNodeInDom: Node;
      if (addedNode?.tagName) {
        if (['svg', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect'].includes(addedNode?.tagName?.toLowerCase())) {
          newNodeInDom = document.createElementNS('http://www.w3.org/2000/svg', addedNode?.tagName);
        } else {
          newNodeInDom = document.createElement(addedNode?.tagName);
        }
      } else if (addedNode?.type === NodeType.TEXT_NODE) {
        newNodeInDom = document.createTextNode(addedNode?.value || '');
      } else if (addedNode?.type === NodeType.COMMENT_NODE) {
        newNodeInDom = document.createComment(addedNode?.value || '');
      } else {
        throw new Error(`Could not add node (with XPath ${addedNode?.xpath}) because it is of unrecognizable type`);
      }

      const addedNodeAttributes = addedNode?.attributes;
      Object.keys(addedNodeAttributes || []).forEach((attributeName) => {
        if (!Object.keys(addedNodeAttributes).includes(attributeName)) {
          return;
        }

        const attributeValue = addedNodeAttributes[attributeName];
        (newNodeInDom as HTMLElement).setAttribute(attributeName, attributeValue);
      });

      (newNodeInDom as HTMLElement).innerHTML = addedNode?.innerHTML || '';
      if (addedNode.sheet) {
        this.sheets.push(addedNode.sheet);
      }

      if (previousSiblingInDom) {
        targetInDom.insertBefore(newNodeInDom, previousSiblingInDom.nextSibling);
      } else if (nextSiblingInDom) {
        targetInDom.insertBefore(newNodeInDom, nextSiblingInDom);
      } else {
        const indexFromXPathObject = /\[([0-9])\]$/.exec(addedNode?.xpath || '');
        if (indexFromXPathObject) {
          const indexFromXPath = parseInt(indexFromXPathObject[1]);
          if ([NodeType.TEXT_NODE, NodeType.COMMENT_NODE].includes(addedNode?.type)) {
            const textOrCommentChildNodes = Array.from(targetInDom.childNodes)
              .filter(node => node?.nodeType === addedNode?.type);

            if (textOrCommentChildNodes.length > indexFromXPath) {
              targetInDom.insertBefore(newNodeInDom, textOrCommentChildNodes[indexFromXPath]);
            } else {
              targetInDom.appendChild(newNodeInDom);
            }
          } else {
            const elementChildNodes = Array.from(targetInDom.children)
              .filter((node) => node?.tagName?.toLowerCase() === addedNode?.tagName?.toLowerCase());

            if (elementChildNodes.length > indexFromXPath) {
              targetInDom.insertBefore(newNodeInDom, elementChildNodes[indexFromXPath]);
            } else {
              targetInDom.appendChild(newNodeInDom);
            }
          }
        } else {
          targetInDom.appendChild(newNodeInDom);
        }
      }

      if (
        addedNodeAlreadyInDom && (
          addedNodeAlreadyInDom.isEqualNode(newNodeInDom) ||
          addedNode?.tagName?.toLowerCase() === 'body'
        )
      ) {
        addedNodeAlreadyInDom.remove();
      }
    });
  }

  private applyAttributesMutation(mutation: IMutationRecord): (void | never) {
    const targetInDom = this.getTargetInDomFromMutation(mutation) as HTMLElement;
    if (!targetInDom) {
      return;
    }

    const targetAttributes = mutation.target?.attributes;
    if (!targetAttributes) {
      throw new Error(`Attributes of mutation target (with XPath ${mutation.target?.xpath}) are missing`);
    }

    const mutatedAttributeName = mutation.attributeName as string;
    if (!mutatedAttributeName) {
      throw new Error(`Mutated attribute name of target (with XPath ${mutation.target?.xpath}) is missing`);
    }

    if (!Object.keys(targetAttributes).includes(mutatedAttributeName)) {
      targetInDom.removeAttribute(mutatedAttributeName);
      return;
    }

    const mutatedAttributeValue = targetAttributes[mutatedAttributeName];
    targetInDom.setAttribute(mutatedAttributeName, mutatedAttributeValue);
  }

  private applyCharacterDataMutation(mutation: IMutationRecord): void {
    const targetInDom = this.getTargetInDomFromMutation(mutation) as CharacterData;
    if (!targetInDom) {
      return;
    }

    targetInDom.replaceData(0, targetInDom.data.length, mutation.target?.data || '');
  }

  private applyMutation(mutation: IMutationRecord): void {
    const applier = this.appliersByMutationType[mutation.type].bind(this);
    applier(mutation);
  }

  applyMutations(serializedMutations: IMutationRecord[]): void {
    serializedMutations.forEach(this.applyMutation.bind(this));
  }

  tearDown(): void {
    this.dom.window.close();
  }
}
