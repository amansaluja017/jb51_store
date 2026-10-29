import { trpcRequest } from './api';
import type { MobileSiteConfigData } from '../types';

export const fetchSiteConfig = async (
  apiHost: string,
  token: string | null
): Promise<MobileSiteConfigData> => {
  const res = await trpcRequest('siteConfig.get', {
    method: 'GET',
    apiHost,
    token,
  });
  return res as MobileSiteConfigData;
};

export const saveSiteConfig = async (
  apiHost: string,
  token: string | null,
  data: Partial<MobileSiteConfigData>
): Promise<{ success: boolean; data: MobileSiteConfigData; revalidated: boolean }> => {
  const res = await trpcRequest('siteConfig.update', {
    method: 'POST',
    body: data,
    apiHost,
    token,
  });
  return res as { success: boolean; data: MobileSiteConfigData; revalidated: boolean };
};

export const revalidateSiteConfig = async (
  apiHost: string,
  token: string | null
): Promise<{ success: boolean; tag: string }> => {
  const res = await trpcRequest('siteConfig.revalidate', {
    method: 'POST',
    body: { tag: 'site-config' },
    apiHost,
    token,
  });
  return res as { success: boolean; tag: string };
};
