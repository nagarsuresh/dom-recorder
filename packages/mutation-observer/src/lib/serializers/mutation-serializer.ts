import { IMutationRecord, IMutationSerializer, INode, INodeInfoIncludeKey } from '../dto';
import { getAttributes, getXPath, getCSSStyleSheet, IStyleSheet } from '../utils';

export class MutationSerializer implements IMutationSerializer {

  public serializeStyleSheets(styleSheets: StyleSheetList): IStyleSheet[] {
    return Array.from(styleSheets).map((sheet) => {
      return {
        cssRules: Array.from(sheet.cssRules).map((cssRule) => {
          return {
            cssText: cssRule.cssText,
          };
        }),
      };
    });
  }

  public serializeMutations(mutations: MutationRecord[]): IMutationRecord[] {
    return mutations.map((mutation: MutationRecord) => {
      return {
        type: mutation.type,
        target: this.serializeNode(mutation.target),
        addedNodes: Array.from(mutation.addedNodes).map(node => {
          return this.serializeNode(node, { innerHTML: true });
        }),
        removedNodes: Array.from(mutation.removedNodes).map(node => this.serializeNode(node)),
        previousSibling: this.serializeNode(mutation.previousSibling),
        nextSibling: this.serializeNode(mutation.nextSibling),
        attributeName: mutation.attributeName,
        attributeNamespace: mutation.attributeNamespace,
      };
    });
  }


  private serializeNode(
    node: Node | null,
    include?: Record<INodeInfoIncludeKey, boolean>
  ): (INode | null) {
    if (!node) {
      return null;
    }

    const info: INode = {
      type: node.nodeType,
      name: node.nodeName,
      tagName: (node as HTMLElement).tagName,
      value: node.nodeValue,
      attributes: getAttributes(node as HTMLElement),
      xpath: getXPath(node),
      data: (node as CharacterData).data,
    };

    if (include?.innerHTML) {
      info.innerHTML = (node as HTMLElement).innerHTML;
    }

    if ((node as (HTMLStyleElement | HTMLLinkElement)).sheet) {
      info.sheet = getCSSStyleSheet(node as (HTMLStyleElement | HTMLLinkElement));
    }

    return info;
  }



}



