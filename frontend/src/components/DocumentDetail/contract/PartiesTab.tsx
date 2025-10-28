import React from 'react'
import { PartiesSection } from '@/app/(repositories)/repositories/[repositoryId]/files/[files]/_components/PartiesSection'

interface PartiesTabProps {
  data: any
}

export function PartiesTab({ data }: PartiesTabProps) {
  return (
    <div>
      <PartiesSection parties={data?.parties || []} />
    </div>
  )
}
