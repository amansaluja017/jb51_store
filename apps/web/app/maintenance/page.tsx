import { Metadata } from 'next';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { getCachedSiteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Under Scheduled Enhancement | JB51 Clothing House',
  description: 'Our online boutique is currently undergoing scheduled enhancements. We shall reopen shortly.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MaintenancePage() {
  const siteConfig = await getCachedSiteConfig();
  return (
    <MaintenanceScreen 
      config={siteConfig.maintenanceMode} 
      contactInfo={siteConfig.contactInfo} 
    />
  );
}
