import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  ExampleNode,
  NodeType,
  OneAIAnalyticsStaticDataWrapperProps,
  OneAIDataNode,
} from '../common/types/components';
import { Cluster, Item, Phrase } from '../common/types/modals';
import { chunks } from '../common/utils/utils';
import { OneAiAnalytics } from '../components/OneAiAnalytics';

const PAGE_SIZE = 25;

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * One AI Analytics static data wrapper component
 */
export const OneAIAnalyticsStaticDataWrapper: FC<OneAIAnalyticsStaticDataWrapperProps> =
  ({ exampleNodes, ...rest }) => {
    const [currentNodes, setCurrentNodes] = useState(
      exampleNodes as ExampleNode[]
    );
    const [clickedNodes, setClickedNodes] = useState([] as ExampleNode[]);
    const [currentPage, setCurrentPage] = useState(0);
    const currentPages = useMemo(
      () => chunks(currentNodes, PAGE_SIZE),
      [currentNodes]
    );

    useEffect(() => {
      setCurrentNodes(exampleNodes);
    }, [exampleNodes]);

    const nodeClicked = (node: { type: NodeType; id: string }) => {
      setCurrentNodes((currentClusters) => {
        const clickedNode = currentPages.at(currentPage)?.at(Number(node.id));
        if (clickedNode) {
          setClickedNodes((currentClickedCluster) => [
            ...currentClickedCluster,
            clickedNode,
          ]);
          setCurrentPage(0);
        }

        return (
          clickedNode?.children ??
          clickedNode?.items?.map((item) => {
            return { id: item, items_count: 1, text: item, type: 'Item' };
          }) ??
          currentClusters
        );
      });
    };

    const goBack = () => {
      setClickedNodes((clickedClusters) => {
        clickedClusters.pop();
        setCurrentNodes(clickedClusters.at(-1)?.children ?? exampleNodes);
        setCurrentPage(0);
        return [...clickedClusters];
      });
    };

    const currentClickedNode: OneAIDataNode | undefined = useMemo(() => {
      const currentClicked = clickedNodes.at(-1);
      if (currentClicked) {
        return {
          type: currentClicked.type,
          data: getNodeData(currentClicked, 0),
        } as OneAIDataNode;
      }

      return;
    }, [clickedNodes]);

    return (
      <OneAiAnalytics
        dataNodes={
          currentPages.at(currentPage)?.map((node, index) => {
            return { type: node.type, data: getNodeData(node, index)! };
          }) ?? []
        }
        currentNode={currentClickedNode}
        nodeClicked={nodeClicked}
        goBackClicked={goBack}
        currentPage={currentPage}
        totalPagesAmount={currentPages.length}
        nextPageClicked={() => setCurrentPage((page) => page + 1)}
        prevPageClicked={() => setCurrentPage((page) => page - 1)}
        {...rest}
      />
    );
  };

function getNodeData(
  node: ExampleNode,
  index: number
): Cluster | Phrase | Item | undefined {
  if (node.type === 'Cluster') {
    return {
      cluster_id: index,
      cluster_phrase: node.text,
      collection: '',
      items_count: node.items_count,
      phrases_count: node.children?.length ?? 0,
      metadata: null,
    } as Cluster;
  }
  if (node.type === 'Phrase') {
    return {
      phrase_id: index,
      metadata: null,
      items_count: node.items_count,
      text: node.text,
    } as Phrase;
  }
  if (node.type === 'Item') {
    return {
      id: index,
      original_text: node.text,
    } as Item;
  }

  return;
}
