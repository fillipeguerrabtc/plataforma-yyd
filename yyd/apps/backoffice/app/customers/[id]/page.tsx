import { prisma } from '@/lib/prisma';
import CustomerTimeline from './CustomerTimeline';
import { notFound } from 'next/navigation';

async function getCustomerData(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          product: true,
          guide: true,
          payments: true,
          selectedAddons: { include: { addon: true } },
        },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!customer) return null;

  const messages = await prisma.message.findMany({
    where: {
      customerId: customer.id,
    },
    orderBy: { sentAt: 'desc' },
    take: 100,
  });

  return { customer, messages };
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const data = await getCustomerData(params.id);

  if (!data) {
    notFound();
  }

  return <CustomerTimeline customer={data.customer} messages={data.messages} />;
}
