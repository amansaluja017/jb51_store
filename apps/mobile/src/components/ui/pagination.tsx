import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  startRecord?: number;
  endRecord?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  style?: StyleProp<ViewStyle>;
  hideIfSinglePage?: boolean;
  activeColor?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  startRecord,
  endRecord,
  itemLabel,
  onPageChange,
  style,
  hideIfSinglePage = true,
  activeColor = '#FF5E36',
}: PaginationProps) {
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));

  // Generate page numbers array: e.g. [1, 2, 3, 4] or [1, '...', 4, 5, '...', 10]
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (safePage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (safePage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  if (hideIfSinglePage && totalPages <= 1) {
    return null;
  }

  // Label text calculation
  const defaultLabel = totalCount === 1 ? 'item' : 'items';
  const label = itemLabel || defaultLabel;

  let infoText = `Page ${safePage} of ${totalPages}`;
  if (startRecord !== undefined && endRecord !== undefined && totalCount !== undefined) {
    infoText = `${startRecord}–${endRecord} of ${totalCount} ${label}`;
  } else if (totalCount !== undefined) {
    infoText = `Page ${safePage} of ${totalPages} (${totalCount} total ${label})`;
  }

  return (
    <View style={[styles.paginationSection, style]}>
      <View style={styles.paginationNumbersRow}>
        {/* Previous Page Button */}
        <TouchableOpacity
          style={[styles.pageButton, safePage <= 1 && styles.pageButtonDisabled]}
          onPress={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          activeOpacity={0.7}
          accessibilityLabel="Previous page"
          accessibilityRole="button"
        >
          <ChevronLeft size={16} color={safePage <= 1 ? '#d4d4d8' : '#18181b'} />
        </TouchableOpacity>

        {/* Numbered Page Buttons */}
        {pageNumbers.map((pNum, idx) => {
          if (pNum === '...') {
            return (
              <View key={`ellipsis-${idx}`} style={styles.pageEllipsis}>
                <Text style={styles.pageEllipsisText}>...</Text>
              </View>
            );
          }

          const isCurrent = pNum === safePage;
          return (
            <TouchableOpacity
              key={`page-${pNum}`}
              style={[
                styles.pageNumberBtn,
                isCurrent && {
                  backgroundColor: activeColor,
                  borderColor: activeColor,
                  shadowColor: activeColor,
                },
              ]}
              onPress={() => onPageChange(pNum as number)}
              activeOpacity={0.7}
              accessibilityLabel={`Page ${pNum}`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.pageNumberBtnText,
                  isCurrent && styles.pageNumberBtnTextActive,
                ]}
              >
                {pNum}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Next Page Button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            safePage >= totalPages && styles.pageButtonDisabled,
          ]}
          onPress={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          activeOpacity={0.7}
          accessibilityLabel="Next page"
          accessibilityRole="button"
        >
          <ChevronRight
            size={16}
            color={safePage >= totalPages ? '#d4d4d8' : '#18181b'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.paginationInfoText}>{infoText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#f4f4f5',
    gap: 10,
  },
  paginationNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageButtonDisabled: {
    opacity: 0.35,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
    elevation: 0,
  },
  pageNumberBtn: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageNumberBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#09090b',
  },
  pageNumberBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  pageEllipsis: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageEllipsisText: {
    fontSize: 13,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  paginationInfoText: {
    fontSize: 11.5,
    color: '#71717a',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Pagination;
