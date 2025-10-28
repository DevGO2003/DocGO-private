import React from 'react';
import { Flex, Stack, Heading, Text, Breadcrumbs } from '@shared/components';

interface Crumb {
  label: string;
  href?: string;
  current?: boolean;
}

export const DetailHeader: React.FC<{
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  right?: React.ReactNode;
}> = ({ title, subtitle, breadcrumbs = [], right }) => {
  return (
    <Stack gap="2">
      <Flex align="center" justify="between" gap="3">
        <div className="min-w-0">
          <Heading level={1} size="xl" fontWeight="semibold" color="gray900" isTruncated title={title}>
            {title}
          </Heading>
          {subtitle && <Text size="sm" color="gray600" mt="1">{subtitle}</Text>}
        </div>
        {right}
      </Flex>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs size="sm" color="gray500" items={breadcrumbs.map(c => ({...c, href: c.href, label: c.label, isCurrent: c.current}))}/>
      )}
    </Stack>
  );
}
