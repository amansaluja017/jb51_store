import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import AppHeader from './src/components/AppHeader';
import ScreenRouter from './src/components/ScreenRouter';
import NavigationTabBar from './src/components/NavigationTabBar';
import ProductFormModal from './src/components/ProductFormModal';
import ProductDetailsModal from './src/components/ProductDetailsModal';
import CategoryManagerModal from './src/components/CategoryManagerModal';
import AccountSettingsModal from './src/components/AccountSettingsModal';
import InquiriesModal from './src/components/InquiriesModal';
import DrawerMenuModal from './src/components/DrawerMenuModal';
import CustomerManagerModal from './src/components/CustomerManagerModal';
import CreditManagerModal from './src/components/CreditManagerModal';
import CustomAlert from './src/components/CustomAlert';

import { useAppData } from './src/hooks/useAppData';
import { configureNotifications } from './src/services/notifications';
import styles from './src/styles/App.styles';

// Initialize Notifications configuration
configureNotifications();

export default function App() {
  const data = useAppData();

  if (!data.isAuthenticated) {
    return (
      <SafeAreaProvider>
        <LoginScreen
          email={data.email}
          setEmail={data.setEmail}
          username={data.username}
          setUsername={data.setUsername}
          password={data.password}
          setPassword={data.setPassword}
          apiHost={data.apiHost}
          setApiHost={data.setApiHost}
          showConfig={data.showConfig}
          setShowConfig={data.setShowConfig}
          isSyncing={data.isSyncing}
          syncMessage={data.syncMessage}
          isLoggingIn={data.isLoggingIn}
          onLogin={data.handleLogin}
          onManualSync={data.handleManualSync}
        />
        <CustomAlert
          config={data.alertConfig}
          onClose={() => data.setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.appContainer}>
        <StatusBar style="dark" />

        {/* Application Header */}
        <AppHeader
          activeTab={data.activeTab}
          onOpenMenu={() => data.setDrawerMenuOpen(true)}
        />

        {/* Screen View Router */}
        <ScreenRouter
          activeTab={data.activeTab}
          setActiveTab={data.setActiveTab}
          stats={data.stats}
          analyticsMetrics={data.analyticsMetrics}
          activeAnalyticsProduct={data.activeAnalyticsProduct}
          selectedAnalyticsSlug={data.selectedAnalyticsSlug}
          setSelectedAnalyticsSlug={data.setSelectedAnalyticsSlug}
          showAnalyticsSelector={data.showAnalyticsSelector}
          setShowAnalyticsSelector={data.setShowAnalyticsSelector}
          products={data.products}
          categories={data.categories}
          searchQuery={data.searchQuery}
          setSearchQuery={data.setSearchQuery}
          isLoading={data.isLoading}
          refreshing={data.refreshing}
          onRefresh={data.handleRefresh}
          onAddProduct={data.triggerAddProduct}
          onManageCategories={() => data.setCategoryModalOpen(true)}
          onToggleStock={data.handleToggleStock}
          onUpdateVisibility={data.handleUpdateVisibility}
          onEditProduct={data.triggerEditProduct}
          onDeleteProduct={data.handleDeleteProduct}
          onViewProductDetails={(prod) => data.setSelectedProductDetails(prod)}
          onUpdateInventory={data.handleUpdateInventory}
          onRecordTransaction={data.handleRecordTransaction}
          transactions={data.transactions}
          isLoadingTransactions={data.isLoadingTransactions}
          onFetchTransactions={data.handleFetchTransactions}
          showAlert={data.showAlert}
          customers={data.customers}
          invoices={data.invoices}
          orders={data.orders}
          isLoadingInvoices={data.isLoadingInvoices}
          isLoadingOrders={data.isLoadingOrders}
          isLoadingCustomers={data.isLoadingCustomers}
          onFetchCustomers={data.handleFetchCustomers}
          onFetchPaginatedCustomers={data.handleFetchPaginatedCustomers}
          onCreateCustomer={data.handleCreateCustomer}
          onFetchInvoices={data.handleFetchInvoices}
          onFetchOrders={data.handleFetchOrders}
          onCreateOrder={data.handleCreateOrder}
          onDeleteInvoice={data.handleDeleteInvoice}
          onFetchCredits={() => data.handleFetchCredits(true)}
          onFetchProducts={data.handleFetchProducts}
          onFetchPaginatedProducts={data.handleFetchPaginatedProducts}
          onFetchPaginatedStock={data.handleFetchPaginatedStock}
          isLoadingProducts={data.isLoading}
          reviews={data.reviews}
          isLoadingReviews={data.isLoadingReviews}
          onFetchReviews={data.handleFetchReviews}
          onAddReview={data.handleAddReview}
          onDeleteReview={data.handleDeleteReview}
          onToggleReviewApproval={data.handleToggleReviewApproval}
          token={data.token}
          apiHost={data.apiHost}
        />

        {/* Tabs Menu Footer */}
        <NavigationTabBar
          activeTab={data.activeTab}
          setActiveTab={data.setActiveTab}
          tabValues={data.tabValues}
        />

        {/* Product Details Overview Modal */}
        <ProductDetailsModal
          visible={!!data.activeDetailsProduct}
          product={data.activeDetailsProduct}
          onClose={() => data.setSelectedProductDetails(null)}
          onEdit={(prod) => {
            data.setSelectedProductDetails(null);
            data.triggerEditProduct(prod);
          }}
          onToggleStock={data.handleToggleStock}
          onUpdateVisibility={data.handleUpdateVisibility}
        />

        {/* Create / Edit Product Form Modal */}
        <ProductFormModal
          visible={data.formModalOpen}
          isEditing={data.isEditing}
          editingSlug={data.editingSlug}
          initialProduct={data.isEditing && data.editingSlug ? data.products.find(p => p.slug === data.editingSlug) || null : null}
          categories={data.categories}
          onClose={() => data.setFormModalOpen(false)}
          onSave={data.handleSaveProduct}
          onReorderImages={data.handleReorderProductImages}
          onAddNewCategory={data.handleAddCategory}
          onDeleteCategory={data.handleDeleteCategory}
          showAlert={data.showAlert}
          apiHost={data.apiHost}
          token={data.token}
        />

        {/* Dedicated Category Manager Modal */}
        <CategoryManagerModal
          visible={data.categoryModalOpen}
          categories={data.categories}
          products={data.products}
          onClose={() => data.setCategoryModalOpen(false)}
          onAddCategory={data.handleAddCategory}
          onDeleteCategory={data.handleDeleteCategory}
          showAlert={data.showAlert}
        />

        {/* Dedicated Account & Security Settings Modal */}
        <AccountSettingsModal
          visible={data.accountModalOpen}
          user={data.currentUser}
          onClose={() => data.setAccountModalOpen(false)}
          onChangeUsername={data.handleChangeUsername}
          onChangeEmail={data.handleChangeEmail}
          onChangePassword={data.handleChangePassword}
          showAlert={data.showAlert}
        />

        {/* Dedicated Customer Inquiries Modal */}
        <InquiriesModal
          visible={data.inquiriesModalOpen}
          onClose={() => data.setInquiriesModalOpen(false)}
          inquiries={data.inquiries}
          onResolveInquiry={data.handleResolveInquiry}
        />

        {/* Slide-out Hamburger Drawer Navigation Menu */}
        <DrawerMenuModal
          visible={data.drawerMenuOpen}
          activeTab={data.activeTab}
          onClose={() => data.setDrawerMenuOpen(false)}
          onOpenCustomers={() => {
            if (data.customers.length === 0) {
              data.handleFetchCustomers();
            }
            data.setCustomerModalOpen(true);
          }}
          onOpenCredits={() => {
            if (data.credits.length === 0) {
              data.handleFetchCredits();
            }
            data.setCreditModalOpen(true);
          }}
          onOpenCategories={() => data.setCategoryModalOpen(true)}
          onOpenInquiries={() => data.setInquiriesModalOpen(true)}
          onOpenAccount={() => data.setAccountModalOpen(true)}
          onSelectTab={(tab) => data.setActiveTab(tab)}
          onLogout={data.handleLogout}
          customersCount={data.customers.length}
          creditsDueCount={data.creditMetrics?.pendingCount}
          pendingInquiriesCount={data.pendingInquiriesCount}
          currentUser={data.currentUser}
        />

        {/* Customer Directory Management Modal (CRUD & On-Demand Order History) */}
        <CustomerManagerModal
          visible={data.customerModalOpen}
          customers={data.customers}
          isLoading={data.isLoadingCustomers}
          onClose={() => data.setCustomerModalOpen(false)}
          onRefresh={data.handleFetchCustomers}
          onFetchCustomerHistory={data.handleFetchCustomerOrderHistory}
          onCreateCustomer={data.handleCreateCustomer}
          onUpdateCustomer={data.handleUpdateCustomer}
          onDeleteCustomer={data.handleDeleteCustomer}
          showAlert={data.showAlert}
        />

        {/* Customer Credit / Udhar Ledger Management Modal */}
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
          showAlert={data.showAlert}
        />

        {/* Global Toast Alert */}
        <CustomAlert
          config={data.alertConfig}
          onClose={() => data.setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
