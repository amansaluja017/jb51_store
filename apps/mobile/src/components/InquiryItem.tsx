import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { MessageCircle, Camera, CheckCircle2, Phone, Mail, Check } from 'lucide-react-native';
import { Inquiry } from '../types';

interface InquiryItemProps {
  inquiry: Inquiry;
  onResolve: (id: string, name: string) => void;
}

export default function InquiryItem({ inquiry, onResolve }: InquiryItemProps) {
  const handleCall = () => {
    if (inquiry.phone) {
      Linking.openURL(`tel:${inquiry.phone}`).catch(() => {
        // Fallback if dialing not supported on device
      });
    }
  };

  const handleEmail = () => {
    if (inquiry.email) {
      const subject = `Regarding your inquiry for ${inquiry.productName}`;
      Linking.openURL(`mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}`).catch(() => {
        // Fallback
      });
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={[styles.channelBox, inquiry.channel === 'WhatsApp' ? styles.waBox : styles.igBox]}>
            {inquiry.channel === 'WhatsApp' ? (
              <MessageCircle size={14} color="#10b981" />
            ) : (
              <Camera size={14} color="#a855f7" />
            )}
          </View>
          <View style={styles.clientMeta}>
            <Text style={styles.clientName}>{inquiry.customerName}</Text>
            <Text style={styles.timeText}>{inquiry.timestamp} via {inquiry.channel}</Text>
          </View>
        </View>
        
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          inquiry.status === 'Resolved' ? styles.statusResolved : 
          inquiry.status === 'Responded' ? styles.statusResponded : styles.statusPending
        ]}>
          <Text style={[
            styles.statusText,
            inquiry.status === 'Resolved' ? styles.statusTextResolved : 
            inquiry.status === 'Responded' ? styles.statusTextResponded : styles.statusTextPending
          ]}>
            {inquiry.status}
          </Text>
        </View>
      </View>

      {/* Product requested details block */}
      <View style={styles.productBlock}>
        <Text style={styles.productLabel}>Requested Outfit</Text>
        <Text style={styles.productValue}>
          {inquiry.productName} <Text style={styles.productSpec}>({inquiry.color} / {inquiry.size})</Text>
        </Text>
      </View>

      {/* Query message block */}
      {inquiry.query && (
        <View style={styles.queryBlock}>
          <Text style={styles.queryText}>"{inquiry.query}"</Text>
        </View>
      )}

      {/* Contact info labels */}
      <View style={styles.contactRow}>
        {inquiry.phone && (
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>{inquiry.phone}</Text>
          </View>
        )}
        {inquiry.email && (
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue} numberOfLines={1}>{inquiry.email}</Text>
          </View>
        )}
      </View>

      {/* Action buttons footer */}
      <View style={styles.actionsFooter}>
        <View style={styles.contactActions}>
          {inquiry.phone && (
            <TouchableOpacity onPress={handleCall} style={styles.iconActionBtn} activeOpacity={0.7}>
              <Phone size={12} color="#09090b" />
              <Text style={styles.iconActionText}>Call</Text>
            </TouchableOpacity>
          )}
          {inquiry.email && (
            <TouchableOpacity onPress={handleEmail} style={styles.iconActionBtn} activeOpacity={0.7}>
              <Mail size={12} color="#09090b" />
              <Text style={styles.iconActionText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {inquiry.status !== 'Resolved' ? (
          <TouchableOpacity 
            onPress={() => onResolve(inquiry.id, inquiry.customerName)}
            style={styles.resolveBtn}
            activeOpacity={0.8}
          >
            <CheckCircle2 size={12} color="#ffffff" />
            <Text style={styles.resolveBtnText}>Resolve</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resolvedConfirmedBadge}>
            <Check size={11} color="#10b981" />
            <Text style={styles.resolvedConfirmedText}>Resolved</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waBox: {
    backgroundColor: '#ecfdf5',
  },
  igBox: {
    backgroundColor: '#faf5ff',
  },
  clientMeta: {
    marginLeft: 10,
    flex: 1,
  },
  clientName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#09090b',
  },
  timeText: {
    fontSize: 9,
    color: '#a1a1aa',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPending: {
    backgroundColor: '#fff7f5',
  },
  statusResponded: {
    backgroundColor: '#eff6ff',
  },
  statusResolved: {
    backgroundColor: '#f4f4f5',
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTextPending: {
    color: '#FF5E36',
  },
  statusTextResponded: {
    color: '#3b82f6',
  },
  statusTextResolved: {
    color: '#71717a',
  },
  productBlock: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    marginBottom: 12,
  },
  productLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  productSpec: {
    fontWeight: 'normal',
    color: '#71717a',
  },
  queryBlock: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF5E36',
    paddingLeft: 10,
    marginBottom: 12,
  },
  queryText: {
    fontSize: 11,
    color: '#52525b',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 16,
  },
  contactItem: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 11,
    color: '#3f3f46',
    fontWeight: '500',
  },
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#f4f4f5',
    paddingTop: 12,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  iconActionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#09090b',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF5E36',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resolveBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resolvedConfirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  resolvedConfirmedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
