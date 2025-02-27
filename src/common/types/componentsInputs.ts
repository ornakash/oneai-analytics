import { FC } from 'react';
import {
  Cluster,
  Item,
  MetaCluster,
  MetaData,
  Phrase,
  Properties,
  Trend,
} from './modals';
import {
  CountersConfigurations,
  CounterType,
  MetadataKeyValue,
} from './customizeBarTypes';

export interface DataNode {
  id: string;
  amount: number;
  text?: string;
  item_original_text?: string | null;
  item_translated_text?: string | null;
  metadata: MetaData;
  properties: { [key: string]: string };
  trends: Trend[];
  type: string;
}

export interface TreemapProps {
  dataNodes: DataNode[];
  width: number;
  height: number;
  nodeClicked: (node: DataNode) => void;
  bigColor?: string;
  smallColor?: string;
  countFontSize?: number;
  fontFamily?: string;
  textColor?: string;
  borderWidth?: number;
  borderColor?: string;
  labels: string[];
  counters: CounterType[];
  countersConfiguration: CountersConfigurations;
  labelClicked: (key: string, value: string) => void;
  sizeAxis: MetadataKeyValue | null;
  colorAxis: CounterType[];
  nodeActionsClicked: (node: DataNode) => void;
  translate: boolean;
  totalItems: number;
}

export interface BarChartProps {
  dataNodes: DataNode[];
  width: number;
  height: number;
  nodeClicked: (node: DataNode) => void;
  barColor?: string;
  fontFamily?: string;
  textColor?: string;
  labels: string[];
  counters: CounterType[];
  countersConfiguration: CountersConfigurations;
  labelClicked: (key: string, value: string) => void;
  sizeAxis: MetadataKeyValue | null;
  colorAxis: CounterType[];
  nodeActionsClicked: (node: DataNode) => void;
  translate: boolean;
  totalItems: number;
}

export type NodeType = 'Cluster' | 'Phrase' | 'Item' | 'Meta';
export interface OneAIDataNode {
  type: NodeType;
  data: Cluster | Phrase | Item | MetaCluster;
}

export interface OneAiAnalyticsProps {
  dataNodes: { totalItems: number; nodes: OneAIDataNode[] };
  currentNode?: OneAIDataNode;
  totalPagesAmount?: number;
  currentPage?: number;
  nodeClicked?: (node: Omit<OneAIDataNode & { id: string }, 'data'>) => void;
  goBackClicked?: (skip: number) => void;
  nextPageClicked?: () => void;
  prevPageClicked?: () => void;
  darkMode?: boolean;
  background?: string;
  treemapBigColor?: string;
  treemapSmallColor?: string;
  treemapCountFontSize?: number;
  fontFamily?: string;
  textColor?: string;
  treemapBorderWidth?: number;
  treemapBorderColor?: string;
  navbarColor?: string;
  barColor?: string;
  itemsDisplay?: FC<ItemsDisplayComponentProps>;
  loading?: boolean;
  error?: string | null;
  nodesPath?: { text: string; translated?: string | null }[];
  dateRangeChanged?: (from: Date | null, to: Date | null) => void;
  labelsFilters?: MetadataKeyValue[];
  labelClicked?: (key: string, value: string) => void;
  labelFilterDeleted?: (index: number) => void;
  trendPeriods?: number;
  trendPeriodsChanged?: (index: number) => void;
  searchSimilarClusters?: (
    text: string,
    controller: AbortController
  ) => Promise<
    { id: string; text: string; translation: string | null | undefined }[]
  >;
  splitPhrase?: (
    phraseId: string,
    controller: AbortController
  ) => Promise<{ status: 'Success' | 'error'; message: string }>;
  mergeClusters?: (
    source: string[],
    destination: string,
    controller: AbortController
  ) => Promise<{ status: 'Success' | 'error'; message: string }>;
  translationEnabled?: boolean;
  toggleHide?: (
    node: {
      type: NodeType;
      id: string;
      text: string;
      properties: Properties;
    } | null,
    hide: string
  ) => void;
  propertiesFilters?: Properties;
  setPropertiesFilters?: (properties: Properties) => void;
  metaOptions?: string[];
  currentMetaOption?: string;
  metaOptionsChanged?: (option: string) => void;
  refresh?: () => void;
}

export type OneAIAnalyticsStaticDataWrapperProps = Omit<
  OneAiAnalyticsProps & { exampleNodes: ExampleNode[]; collection?: string },
  'dataNodes' | 'totalPagesAmount' | 'currentPage'
>;

export type OneAIAnalyticsApiWrapperProps = Omit<
  OneAiAnalyticsProps & {
    domain?: string;
    apiKey?: string;
    collection?: string;
    collectionName?: string;
    refreshToken?: string;
  },
  'dataNodes' | 'totalPagesAmount' | 'currentPage'
>;

export interface ExampleNode {
  type: NodeType;
  id: string;
  text: string;
  items_count: number;
  items?: string[];
  children?: ExampleNode[];
}

export interface ItemsDisplayComponentProps {
  items: Item[];
  bgColor?: string;
  textColor?: string;
  labels: string[];
  counters: CounterType[];
  countersConfiguration: CountersConfigurations;
  labelClicked: (key: string, value: string) => void;
  translate: boolean;
  totalItems: number;
}

export interface UploadParams {
  domain?: string;
  apiKey?: string;
  collection?: string;
  darkMode?: boolean;
  steps?: string;
  input_skill?: string;
  resetAfterUpload?: boolean;
  expected_languages?: string;
  override_language_detection?: boolean;
  createCollection?: boolean;
  collectionDomain?: string;
  isPublic?: boolean;
  goToCollection?: () => void;
}
