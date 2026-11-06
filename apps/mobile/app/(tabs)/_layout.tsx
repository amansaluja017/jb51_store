import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname, Redirect, type Href } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useAppDataContext } from '../../src/context/AppDataContext';
import LoadingScreen from '../../src/screens/LoadingScreen';
import AppHeader from '../../src/components/AppHeader';
import NavigationTabBar, { TabType } from '../../src/components/NavigationTabBar';
import { TAB_ROUTE_MAP, getTabFromPathname } from '../../src/utils/navigation';

export default function TabLayout() {
  const auth = useAuth();
  const data = useAppDataContext();
  const router = useRouter();
  const pathname = usePathname();

  // Route protection: If checking credentials or hydrating session, show loader
  if (auth.isCheckingAuth) {
    return <LoadingScreen message={auth.authLoadingMessage || 'Restoring boutique session...'} />;
  }

  // Route protection: If unauthenticated, redirect to the login page
  if (!auth.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Derive current tab directly from pathname as single source of truth
  const currentTab = useMemo<TabType>(() => {
    return getTabFromPathname(pathname);
  }, [pathname]);

  const handleTabChange = (newTab: TabType) => {
    const targetRoute = TAB_ROUTE_MAP[newTab] || '/';
    router.replace(targetRoute as Href);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        activeTab={currentTab}
        onOpenMenu={() => data.setDrawerMenuOpen(true)}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => (
          <NavigationTabBar
            activeTab={currentTab}
            setActiveTab={handleTabChange}
            tabValues={data.tabValues}
          />
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="products-catalog"
          options={{
            title: 'Catalog',
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: 'Stock',
          }}
        />
        <Tabs.Screen
          name="invoices"
          options={{
            title: 'Invoices',
          }}
        />
        <Tabs.Screen
          name="reviews"
          options={{
            title: 'Reviews',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

