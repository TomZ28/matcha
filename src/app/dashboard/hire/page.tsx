import CompanyHireGrid from '@/app/ui/hire/company-hire-grid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hire - Create Job Postings',
  description: 'Create job postings for companies you are an employee of',
};

export default async function Page() {
  return (
    <main>
      <CompanyHireGrid initialCompanies={[]} />
    </main>
  );
}
