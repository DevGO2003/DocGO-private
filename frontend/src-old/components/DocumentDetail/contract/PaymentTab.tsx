import React from 'react'
import { PaymentSection } from '@/app/(repositories)/repositories/[repositoryId]/files/[files]/_components/PaymentSection'

interface PaymentTabProps {
  data: any
}

export function PaymentTab({ data }: PaymentTabProps) {
  return (
    <div>
      <PaymentSection
        payment={data?.payment}
        totalValue={data?.totalValue}
        currency={data?.currency}
      />
    </div>
  )
}
