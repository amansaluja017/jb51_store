import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, Calendar, Check } from 'lucide-react-native';

export interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void; // Formatted 'YYYY-MM-DD'
  initialDate?: string | null;
  title?: string;
  minDate?: Date | string | null; // Dates before this are strictly disabled
  maxDate?: Date | string | null; // Dates after this are strictly disabled
  validationMessage?: string | null;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDateToIsoString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoOrDate(val?: Date | string | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const parts = val.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(val);
  return isNaN(dt.getTime()) ? null : dt;
}

export function CalendarPickerModal({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  title = 'Select Date',
  minDate,
  maxDate,
  validationMessage,
}: CalendarPickerModalProps) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const normalizedMinDate = useMemo(() => {
    const d = parseIsoOrDate(minDate);
    if (!d) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  const normalizedMaxDate = useMemo(() => {
    const d = parseIsoOrDate(maxDate);
    if (!d) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  }, [maxDate]);

  // Current viewed month and year
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const init = parseIsoOrDate(initialDate) || new Date();
    return init.getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const init = parseIsoOrDate(initialDate) || new Date();
    return init.getMonth();
  });

  // Currently selected date string (YYYY-MM-DD)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const init = parseIsoOrDate(initialDate);
    return init ? formatDateToIsoString(init) : formatDateToIsoString(new Date());
  });

  // Sync state whenever modal opens or initialDate changes
  useEffect(() => {
    if (visible) {
      const init = parseIsoOrDate(initialDate) || new Date();
      setCurrentYear(init.getFullYear());
      setCurrentMonth(init.getMonth());
      setSelectedDateStr(formatDateToIsoString(init));
    }
  }, [visible, initialDate]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Check if a specific date is disabled
  const isDateDisabled = (dayDate: Date): boolean => {
    if (normalizedMinDate && dayDate.getTime() < normalizedMinDate.getTime()) {
      return true;
    }
    if (normalizedMaxDate && dayDate.getTime() > normalizedMaxDate.getTime()) {
      return true;
    }
    return false;
  };

  // Build grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: Array<{
      dayNumber: number | null;
      fullDateStr: string | null;
      disabled: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Empty placeholder slots for days preceding the 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNumber: null,
        fullDateStr: null,
        disabled: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      d.setHours(0, 0, 0, 0);
      const isoStr = formatDateToIsoString(d);
      const disabled = isDateDisabled(d);
      const isToday = d.getTime() === today.getTime();
      const isSelected = isoStr === selectedDateStr;

      days.push({
        dayNumber: day,
        fullDateStr: isoStr,
        disabled,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedDateStr, normalizedMinDate, normalizedMaxDate, today]);

  const handleSelectDay = (fullDateStr: string | null, disabled: boolean) => {
    if (!fullDateStr || disabled) return;
    setSelectedDateStr(fullDateStr);
  };

  const handleConfirm = () => {
    if (selectedDateStr) {
      onSelectDate(selectedDateStr);
    }
    onClose();
  };

  const handleSelectToday = () => {
    if (!isDateDisabled(today)) {
      const todayStr = formatDateToIsoString(today);
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
      setSelectedDateStr(todayStr);
    }
  };

  const isTodayAllowed = !isDateDisabled(today);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Calendar size={18} color="#FF5E36" style={{ marginRight: 8 }} />
                  <Text style={styles.headerTitle}>{title}</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Close calendar"
                  accessibilityRole="button"
                >
                  <X size={18} color="#71717a" />
                </TouchableOpacity>
              </View>

              {/* Month Navigation Row */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.navArrowButton}
                  accessibilityLabel="Previous month"
                  accessibilityRole="button"
                >
                  <ChevronLeft size={20} color="#e4e4e7" />
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.navArrowButton}
                  accessibilityLabel="Next month"
                  accessibilityRole="button"
                >
                  <ChevronRight size={20} color="#e4e4e7" />
                </TouchableOpacity>
              </View>

              {/* Weekday Labels */}
              <View style={styles.weekDaysRow}>
                {WEEK_DAYS.map((wd, i) => (
                  <Text key={i} style={styles.weekDayText}>
                    {wd}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((item, index) => {
                  if (!item.dayNumber) {
                    return <View key={`empty-${index}`} style={styles.dayCell} />;
                  }

                  return (
                    <TouchableOpacity
                      key={`day-${item.dayNumber}`}
                      disabled={item.disabled}
                      onPress={() => handleSelectDay(item.fullDateStr, item.disabled)}
                      style={[
                        styles.dayCell,
                        item.isSelected && styles.dayCellSelected,
                        item.isToday && !item.isSelected && styles.dayCellToday,
                        item.disabled && styles.dayCellDisabled,
                      ]}
                      accessibilityLabel={`Day ${item.dayNumber}`}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.dayText,
                          item.isSelected && styles.dayTextSelected,
                          item.isToday && !item.isSelected && styles.dayTextToday,
                          item.disabled && styles.dayTextDisabled,
                        ]}
                      >
                        {item.dayNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Validation / Helper Hint */}
              <View style={styles.hintContainer}>
                {validationMessage ? (
                  <Text style={styles.hintText}>{validationMessage}</Text>
                ) : normalizedMinDate ? (
                  <Text style={styles.hintText}>Past dates are not allowed for this field.</Text>
                ) : normalizedMaxDate ? (
                  <Text style={styles.hintText}>Future dates are not allowed for this field.</Text>
                ) : null}
              </View>

              {/* Footer Actions */}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={handleSelectToday}
                  disabled={!isTodayAllowed}
                  style={[styles.todayButton, !isTodayAllowed && { opacity: 0.4 }]}
                  accessibilityLabel="Select today"
                  accessibilityRole="button"
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.cancelButton}
                    accessibilityLabel="Cancel selection"
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={styles.confirmButton}
                    accessibilityLabel="Apply selected date"
                    accessibilityRole="button"
                  >
                    <Check size={16} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.confirmButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#18181b', // Zinc-900 luxury dark background
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f4f4f5',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#27272a',
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  navArrowButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#27272a',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: '#c2410c', // Terracotta orange
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#FF5E36',
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e4e4e7',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: '#FF5E36',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: '#52525b',
  },
  hintContainer: {
    marginTop: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 11,
    color: '#f97316',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  todayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#27272a',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5E36',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#27272a',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#c2410c',
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
