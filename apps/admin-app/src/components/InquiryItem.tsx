import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MessageCircle, Camera, CheckCircle2 } from 'lucide-react-native';
import { Inquiry } from '../types';

interface InquiryItemProps {
  inquiry: Inquiry;
  onResolve: (id: string, name: string) => void;
}

export default function InquiryItem({ inquiry, onResolve }: InquiryItemProps) {
  return (
    <View style={styles.inquiryItem}>
      <View style={styles.inqDetails}>
        <View style={[styles.inqChannelBox, inquiry.channel === 'WhatsApp' ? styles.waBox : styles.igBox]}>
          {inquiry.channel === 'WhatsApp' ? (
            <MessageCircle size={14} color="#10b981" />
          ) : (
            <Camera size={14} color="#a855f7" />
          )}
        </View>
        <View style={styles.inqTextInfo}>
          <Text style={styles.inqClientName}>{inquiry.customerName}</Text>
          <Text style={styles.inqProductDescription}>
            Requested {inquiry.productName} ({inquiry.color} / {inquiry.size})
          </Text>
        </View>
      </View>

      <View style={styles.inqStatusColumn}>
        <Text style={styles.inqTime}>{inquiry.timestamp}</Text>
        {inquiry.status !== 'Resolved' ? (
          <TouchableOpacity 
            onPress={() => onResolve(inquiry.id, inquiry.customerName)}
            style={styles.resolveButton}
          >
            <CheckCircle2 size={10} color="#FF5E36" />
            <Text style={styles.resolveButtonText}>Resolve</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedText}>Resolved</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inquiryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
  },
  inqDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  inqChannelBox: {
    width: 28,
    height: 28,
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
  inqTextInfo: {
    marginLeft: 10,
    flex: 1,
  },
  inqClientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  inqProductDescription: {
    fontSize: 9,
    color: '#71717a',
    marginTop: 2,
  },
  inqStatusColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  inqTime: {
    fontSize: 8,
    color: '#a1a1aa',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resolveButtonText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FF5E36',
    textTransform: 'uppercase',
  },
  resolvedBadge: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resolvedText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
});
