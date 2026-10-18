import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MessageCircle, Search } from 'lucide-react-native';
import InquiryItem from './InquiryItem';
import { Inquiry } from '../types';

interface InquiriesModalProps {
  visible: boolean;
  onClose: () => void;
  inquiries: Inquiry[];
  onResolveInquiry: (id: string, name: string) => void;
}

export default function InquiriesModal({
  visible,
  onClose,
  inquiries,
  onResolveInquiry,
}: InquiriesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const pendingCount = useMemo(
    () => inquiries.filter(i => i.status !== 'Resolved').length,
    [inquiries]
  );
  const resolvedCount = useMemo(
    () => inquiries.filter(i => i.status === 'Resolved').length,
    [inquiries]
  );

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return inquiries.filter(inq => {
      const matchesSearch =
        !q ||
        inq.customerName.toLowerCase().includes(q) ||
        inq.productName.toLowerCase().includes(q) ||
        (inq.phone && inq.phone.toLowerCase().includes(q)) ||
        (inq.query && inq.query.toLowerCase().includes(q));

      const matchesStatus =
        filter === 'all' ||
        (filter === 'pending' && inq.status !== 'Resolved') ||
        (filter === 'resolved' && inq.status === 'Resolved');

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, filter]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconBox}>
              <MessageCircle size={18} color="#FF5E36" />
            </View>
            <View>
              <View style={styles.titleWithBadge}>
                <Text style={styles.headerTitle}>Atelier Inquiries</Text>
                {pendingCount > 0 && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{pendingCount} new</Text>
                  </View>
                )}
              </View>
              <Text style={styles.headerSubtitle}>Direct customer WhatsApp & concierge chats</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close inquiries modal"
            >
              <X size={18} color="#09090b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & Status Filters */}
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Search size={14} color="#a1a1aa" />
            <TextInput
              placeholder="Search by client, outfit, or phone..."
              placeholderTextColor="#a1a1aa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.statusTabsRow}>
            <TouchableOpacity
              onPress={() => setFilter('all')}
              style={[styles.statusTab, filter === 'all' && styles.statusTabActive]}
            >
              <Text style={[styles.statusTabText, filter === 'all' && styles.statusTabTextActive]}>
                All ({inquiries.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('pending')}
              style={[styles.statusTab, filter === 'pending' && styles.statusTabActive]}
            >
              <Text style={[styles.statusTabText, filter === 'pending' && styles.statusTabTextActive]}>
                Active ({pendingCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('resolved')}
              style={[styles.statusTab, filter === 'resolved' && styles.statusTabActive]}
            >
              <Text style={[styles.statusTabText, filter === 'resolved' && styles.statusTabTextActive]}>
                Resolved ({resolvedCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inquiries List */}
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredInquiries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={44} color="#d4d4d8" />
              <Text style={styles.emptyTitle}>No Inquiries Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No inquiries match your active search criteria.'
                  : 'All client requests have been resolved or no new inquiries yet.'}
              </Text>
            </View>
          ) : (
            filteredInquiries.map(inq => (
              <InquiryItem
                key={inq.id}
                inquiry={inq}
                onResolve={onResolveInquiry}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff0ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
  },
  pendingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FF5E36',
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#09090b',
    paddingVertical: 0,
  },
  statusTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
  },
  statusTabActive: {
    backgroundColor: '#09090b',
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  statusTabTextActive: {
    color: '#ffffff',
  },

  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    maxWidth: 260,
  },
});
