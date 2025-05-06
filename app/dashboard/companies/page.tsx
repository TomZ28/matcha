import CompanyGrid from '@/app/ui/companies/company-grid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Companies',
};

export default async function Page() {
  return (
    <main>
      <CompanyGrid initialCompanies={[]} />
    </main>
  );
}
