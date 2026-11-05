import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, usePathname, type Href } from 'expo-router';
import { TabType } from '../src/components/NavigationTabBar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AppDataProvider, useAppDataContext } from '../src/context/AppDataContext';
import LoadingScreen from '../src/screens/LoadingScreen';
import LoginScreen from '../src/screens/LoginScreen';
import ProductFormModal from '../src/components/ProductFormModal';
import ProductDetailsModal from '../src/components/ProductDetailsModal';
import CategoryManagerModal from '../src/components/CategoryManagerModal';
import AccountSettingsModal from '../src/components/AccountSettingsModal';
import InquiriesModal from '../src/components/InquiriesModal';
import DrawerMenuModal from '../src/components/DrawerMenuModal';
import CustomerManagerModal from '../src/components/CustomerManagerModal';
import CreditManagerModal from '../src/components/CreditManagerModal';
import { DeveloperSectionModal } from '../src/components/DeveloperSectionModal';
import CustomAlert from '../src/components/CustomAlert';
import { configureNotifications } from '../src/services/notifications';
import styles from '../src/styles/App.styles';

function RootLayoutContent() {
  const auth = useAuth();
  const data = useAppDataContext();
  const router = useRouter();
  const pathname = usePathname();
  const [developerModalOpen, setDeveloperModalOpen] = React.useState(false);

  const currentTab = React.useMemo<TabType>(() => {
    const routeMap: Record<string, TabType> = {
      '/': 'dashboard',
      '/products-catalog': 'catalogue',
      '/stock': 'inventory',
      '/invoices': 'invoices',
      '/reviews': 'reviews',
    };
    return routeMap[pathname] || data.activeTab || 'dashboard';
  }, [pathname, data.activeTab]);

  // 1. If checking secure storage or restoring session, show loading page
  if (auth.isCheckingAuth) {
    return <LoadingScreen message={auth.authLoadingMessage || 'Restoring boutique session...'} />;
  }

  // 2. If unauthenticated, show login screen
  if (!auth.isAuthenticated) {
    return (
      <View style={{ flex: 1 }}>
        <LoginScreen
          email={auth.email}
          setEmail={auth.setEmail}
          username={auth.username}
          setUsername={auth.setUsername}
          password={auth.password}
          setPassword={auth.setPassword}
          apiHost={auth.apiHost}
          setApiHost={auth.setApiHost}
          showConfig={auth.showConfig}
          setShowConfig={auth.setShowConfig}
          isSyncing={data.isSyncing}
          syncMessage={data.syncMessage}
          isLoggingIn={auth.isLoggingIn}
          onLogin={auth.handleLogin}
          onManualSync={data.handleManualSync}
        />
        <CustomAlert
          config={data.alertConfig}
          onClose={() => data.setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.appContainer}>
      <StatusBar style="dark" />

      {/* Main Tab Stack */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      {/* Global Modals */}
      <ProductFormModal
        visible={data.formModalOpen}
        isEditing={data.isEditing}
        editingSlug={data.editingSlug}
        initialProduct={
          data.isEditing && data.editingSlug
            ? data.products.find((p) => p.slug === data.editingSlug) || null
            : null
        }
        categories={data.categories}
        onClose={() => data.setFormModalOpen(false)}
        onSave={data.handleSaveProduct}
        onReorderImages={data.handleReorderProductImages}
        onDeleteCategory={data.handleDeleteCategory}
        onAddNewCategory={data.handleAddCategory}
        showAlert={data.showAlert}
        apiHost={data.apiHost}
        token={data.token}
      />

      <ProductDetailsModal
        visible={!!data.selectedProductDetails}
        product={data.selectedProductDetails}
        onClose={() => data.setSelectedProductDetails(null)}
        onEdit={(prod) => {
          data.setSelectedProductDetails(null);
          data.triggerEditProduct(prod);
        }}
        onToggleStock={data.handleToggleStock}
      />

      <CategoryManagerModal
        visible={data.categoryModalOpen}
        categories={data.categories}
        products={data.products}
        onClose={() => data.setCategoryModalOpen(false)}
        onAddCategory={data.handleAddCategory}
        onDeleteCategory={data.handleDeleteCategory}
        showAlert={data.showAlert}
      />

      <AccountSettingsModal
        visible={data.accountModalOpen}
        user={data.currentUser}
        onClose={() => data.setAccountModalOpen(false)}
        onChangeUsername={data.handleChangeUsername}
        onChangeEmail={data.handleChangeEmail}
        onChangePassword={data.handleChangePassword}
        showAlert={data.showAlert}
      />

      {data.inquiriesModalOpen && (
        <InquiriesModal
          visible={data.inquiriesModalOpen}
          onClose={() => data.setInquiriesModalOpen(false)}
          inquiries={data.inquiries}
          isLoading={data.isLoadingInquiries}
          pagination={data.inquiriesPagination}
          sortBy={data.inquiriesSortBy}
          onSortChange={data.setInquiriesSortBy}
          statusFilter={data.inquiriesStatusFilter}
          onStatusFilterChange={data.setInquiriesStatusFilter}
          searchQuery={data.inquiriesSearchQuery}
          onSearchChange={data.setInquiriesSearchQuery}
          onFetchPaginatedInquiries={data.handleFetchPaginatedInquiries}
          onResolveInquiry={data.handleResolveInquiry}
          onSearchInquiries={data.handleSearchInquiries}
          onGetInquirySuggestions={data.handleGetInquirySuggestions}
        />
      )}

      <DrawerMenuModal
        visible={data.drawerMenuOpen}
        activeTab={currentTab}
        onClose={() => data.setDrawerMenuOpen(false)}
        onOpenCustomers={() => data.setCustomerModalOpen(true)}
        onOpenCredits={() => data.setCreditModalOpen(true)}
        onOpenCategories={() => data.setCategoryModalOpen(true)}
        onOpenInquiries={() => data.setInquiriesModalOpen(true)}
        onOpenAccount={() => data.setAccountModalOpen(true)}
        onSelectTab={(tab) => {
          data.setActiveTab(tab);
          const routeMap: Record<string, Href> = {
            dashboard: '/',
            analytics: '/',
            catalogue: '/products-catalog',
            inventory: '/stock',
            invoices: '/invoices',
            reviews: '/reviews',
          };
          const target = routeMap[tab] || '/';
          router.replace(target);
        }}
        onLogout={data.handleLogout}
        customersCount={data.customerTotalCount || data.customers.length}
        creditsDueCount={data.creditMetrics?.pendingCount}
        pendingInquiriesCount={data.pendingInquiriesCount}
        currentUser={data.currentUser}
        onOpenDeveloperSection={() => {
          if (data.currentUser?.role === 'superadmin') {
            setDeveloperModalOpen(true);
          } else {
            data.showAlert('Access Denied', 'Only superadmin accounts can access developer operations.', 'error');
          }
        }}
      />

      {data.customerModalOpen && (
        <CustomerManagerModal
          visible={data.customerModalOpen}
          customers={data.customers}
          isLoading={data.isLoadingCustomers}
          onClose={() => data.setCustomerModalOpen(false)}
          onRefresh={data.handleFetchCustomers}
          onFetchPaginatedCustomers={data.handleFetchPaginatedCustomers}
          onFetchCustomerHistory={data.handleFetchCustomerOrderHistory}
          onCreateCustomer={data.handleCreateCustomer}
          onUpdateCustomer={data.handleUpdateCustomer}
          onDeleteCustomer={data.handleDeleteCustomer}
          showAlert={data.showAlert}
          onSearchCustomers={data.handleSearchCustomers}
          onGetCustomerSuggestions={data.handleGetCustomerSuggestions}
        />
      )}

      {data.creditModalOpen && (
        <CreditManagerModal
          visible={data.creditModalOpen}
          credits={data.credits}
          metrics={data.creditMetrics}
          isLoading={data.isLoadingCredits}
          onClose={() => data.setCreditModalOpen(false)}
          onRefresh={() => data.handleFetchCredits(true)}
          onCreateCredit={data.handleCreateCredit}
          onUpdateCredit={data.handleUpdateCredit}
          onRecordPayment={data.handleRecordCreditPayment}
          onDeleteCredit={data.handleDeleteCredit}
          onFetchPaginatedCredits={data.handleFetchPaginatedCredits}
          showAlert={data.showAlert}
          onSearchCredits={data.handleSearchCredits}
        />
      )}

      {data.currentUser?.role === 'superadmin' && (
        <DeveloperSectionModal
          visible={developerModalOpen}
          onClose={() => setDeveloperModalOpen(false)}
          apiHost={data.apiHost}
          token={data.token}
        />
      )}

      <CustomAlert
        config={data.alertConfig}
        onClose={() => data.setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  React.useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppDataProvider>
          <RootLayoutContent />
        </AppDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
