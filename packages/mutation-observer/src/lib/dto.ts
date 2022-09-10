import { IAttributes } from "./utils/attributes";
import { IStyleSheet } from "./utils/stylesheets";

export const NodeType = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
};

export const XPathResult = {
  ANY_TYPE: 0,
  NUMBER_TYPE: 1,
  STRING_TYPE: 2,
  BOOLEAN_TYPE: 3,
  UNORDERED_NODE_ITERATOR_TYPE: 4,
  ORDERED_NODE_ITERATOR_TYPE: 5,
  UNORDERED_NODE_SNAPSHOT_TYPE: 6,
  ORDERED_NODE_SNAPSHOT_TYPE: 7,
  ANY_UNORDERED_NODE_TYPE: 8,
  FIRST_ORDERED_NODE_TYPE: 9,
};

export type INode = {
  type: number;
  name: string | null;
  value: string | null;
  innerHTML?: string | null;
  attributes: IAttributes;
  xpath: string;
  tagName?: string;
  data?: string;
  sheet?: IStyleSheet | null
};

export type IMutationType = 'attributes' | 'characterData' | 'childList';
export type IMutationRecord = {
  type: IMutationType;
  target: INode | null;
  addedNodes: (INode | null)[];
  removedNodes: (INode | null)[];
  previousSibling: INode | null;
  nextSibling: INode | null;
  attributeName: string | null;
  attributeNamespace: string | null;
  oldValue?: string | null;
};

export type MutationApplierFn = (mutation: IMutationRecord) => void;
export type MutationAppliersByType = Record<IMutationType, MutationApplierFn>;

export type INodeInfoIncludeKey = 'innerHTML';

export interface IMutationApplier {
  DOM: string;
  styleSheets: IStyleSheet[];
  applyMutations(serializedMutations: IMutationRecord[]): void;
  tearDown(): void;
}


export interface IMutationSerializer {
  serializeStyleSheets(styleSheets: StyleSheetList): IStyleSheet[];
  serializeMutations(mutations: MutationRecord[]): IMutationRecord[];
}