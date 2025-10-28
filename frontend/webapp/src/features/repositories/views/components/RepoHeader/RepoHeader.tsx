import React from 'react';
import { Stack, Flex, Heading, Breadcrumbs } from '@shared/components';

interface Crumb {
  label: string;
  href?: string;
  current?: boolean;
}

export const RepoHeader: React.FC<{ title: string; breadcrumbs?: Crumb[]; right?: React.ReactNode }>
  = ({ title, breadcrumbs = [], right }) => {
  return (
    <Stack gap="2">
      <Flex align="center" justify="between">
        <Heading level={1} size="xl" fontWeight="semibold" color="gray900">{title}</Heading>
        {right}
      </Flex>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs size="sm" color="gray500" items={breadcrumbs.map(c => ({...c, href: c.href, label: c.label, isCurrent: c.current}))}/>
      )}
    </Stack>
  );
};
