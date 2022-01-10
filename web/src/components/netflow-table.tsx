import * as React from 'react';
import { TableComposable, Tbody, Td, Tr } from '@patternfly/react-table';
import { ParsedStream } from '../api/loki';
import { NetflowTableHeader } from './netflow-table-header';
import NetflowTableRow from './netflow-table-row';
import * as _ from 'lodash';

import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner,
  Title
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Column } from '../utils/columns';

const NetflowTable: React.FC<{
  flows: ParsedStream[];
  columns: Column[];
  clearFilters: () => void;
  loading?: boolean;
  error?: string;
}> = ({ flows, columns, error, loading, clearFilters }) => {
  const { t } = useTranslation('plugin__network-observability-plugin');

  // index of the currently active column
  const [activeSortIndex, setActiveSortIndex] = React.useState<number>(-1);

  // sort direction of the currently active column
  const [activeSortDirection, setActiveSortDirection] = React.useState<string>('asc');

  // sort function
  const getSortedFlows = () => {
    if (activeSortIndex < 0 || activeSortIndex >= columns.length) {
      return flows;
    } else {
      return flows.sort((a: ParsedStream, b: ParsedStream) =>
        columns[activeSortIndex].sort(a, b, activeSortDirection === 'desc')
      );
    }
  };

  // sort handler
  const onSort = (event: React.MouseEvent, index: number, direction: string) => {
    setActiveSortIndex(index);
    setActiveSortDirection(direction);
  };

  let bodyContent;
  if (error) {
    bodyContent = (
      <Tr>
        <Td colSpan={columns.length}>
          <EmptyState data-test="error-state" variant={EmptyStateVariant.small}>
            <Title headingLevel="h2" size="lg">
              {t('Unable to get flows')}
            </Title>
            <EmptyStateBody>{error}</EmptyStateBody>
          </EmptyState>
        </Td>
      </Tr>
    );
  } else if (_.isEmpty(flows)) {
    if (loading) {
      bodyContent = (
        <Tr>
          <Td colSpan={columns.length}>
            <Bullseye data-test="loading-contents">
              <Spinner size="xl" />
            </Bullseye>
          </Td>
        </Tr>
      );
    } else {
      bodyContent = (
        <Tr>
          <Td colSpan={columns.length}>
            <Bullseye data-test="no-results-found">
              <EmptyState variant={EmptyStateVariant.small}>
                <EmptyStateIcon icon={SearchIcon} />
                <Title headingLevel="h2" size="lg">
                  {t('No results found')}
                </Title>
                <EmptyStateBody>{t('Clear all filters and try again.')}</EmptyStateBody>
                <Button data-test="clear-all-filters" variant="link" onClick={clearFilters}>
                  {t('Clear all filters')}
                </Button>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      );
    }
  } else {
    bodyContent = getSortedFlows().map((f, i) => <NetflowTableRow key={i} flow={f} columns={columns} />);
  }

  return (
    <TableComposable aria-label="Misc table" variant="compact">
      <NetflowTableHeader
        onSort={onSort}
        sortDirection={activeSortDirection}
        sortIndex={activeSortIndex}
        columns={columns}
      />
      <Tbody>{bodyContent}</Tbody>
    </TableComposable>
  );
};

export default NetflowTable;
