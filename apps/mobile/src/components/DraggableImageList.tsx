import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  PanResponder,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  X,
  GripHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react-native';

const ITEM_WIDTH = 126;
const ITEM_HEIGHT = 168;
const ITEM_MARGIN = 12;
const SLOT_SIZE = ITEM_WIDTH + ITEM_MARGIN;

interface DraggableItemProps {
  img: string;
  idx: number;
  total: number;
  isUploading?: boolean;
  isDeleting?: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
  onDragEnd: (fromIdx: number, toIdx: number) => void;
}

function DraggableItem({
  img,
  idx,
  total,
  isUploading = false,
  isDeleting = false,
  onMoveLeft,
  onMoveRight,
  onRemove,
  onDragEnd,
}: DraggableItemProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isDraggingState, setIsDraggingState] = useState(false);

  const isBusy = isUploading || isDeleting;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isBusy) return false;
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        if (isBusy) return;
        setIsDraggingState(true);
        Animated.spring(scale, {
          toValue: 1.08,
          friction: 6,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (isBusy) return;
        setIsDraggingState(false);
        const offsetSlots = Math.round(gestureState.dx / SLOT_SIZE);
        const targetIdx = Math.max(0, Math.min(total - 1, idx + offsetSlots));

        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();

        if (targetIdx !== idx) {
          onDragEnd(idx, targetIdx);
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingState(false);
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  const isCover = idx === 0;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.cardContainer,
        isCover ? styles.coverCardBorder : styles.standardCardBorder,
        {
          transform: [{ translateX: pan.x }, { scale }],
          zIndex: isDraggingState ? 999 : 1,
          elevation: isDraggingState ? 10 : 2,
        },
      ]}
    >
      <Image source={{ uri: img }} style={styles.imageContent} resizeMode="cover" />

      {/* Top Left: Order / Cover Badge */}
      <View style={[styles.orderBadge, isCover ? styles.coverBadge : styles.numberBadge]}>
        {isCover && <Star size={10} color="#ffffff" fill="#ffffff" style={{ marginRight: 3 }} />}
        <Text style={styles.orderBadgeText}>{isCover ? 'COVER' : `#${idx + 1}`}</Text>
      </View>

      {/* Top Right: Delete Button (Hidden while busy) */}
      {!isBusy && (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.deleteBadge}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={12} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Top Center: Drag Handle indicator (Hidden while busy) */}
      {!isBusy && (
        <View style={styles.dragHandleIndicator}>
          <GripHorizontal size={14} color="rgba(255,255,255,0.85)" />
        </View>
      )}

      {/* Bottom Action Controls: Position & Move Arrows (Hidden while busy) */}
      {!isBusy && (
        <View style={styles.bottomControlsBar}>
          {idx > 0 ? (
            <TouchableOpacity
              onPress={onMoveLeft}
              style={styles.navArrowBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <ChevronLeft size={14} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 22 }} />
          )}

          <Text style={styles.positionText}>{idx + 1} of {total}</Text>

          {idx < total - 1 ? (
            <TouchableOpacity
              onPress={onMoveRight}
              style={styles.navArrowBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <ChevronRight size={14} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 22 }} />
          )}
        </View>
      )}

      {/* Loading overlay with ONLY the spinner */}
      {isBusy && (
        <View style={styles.spinnerOnlyOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </Animated.View>
  );
}

export interface DraggableImageListProps {
  images: string[];
  onReorder: (newImages: string[]) => void;
  onRemove: (idx: number) => void;
  onAddPress: () => void;
  uploadingUris?: string[];
  deletingUris?: string[];
  isUploading?: boolean;
}

export default function DraggableImageList({
  images,
  onReorder,
  onRemove,
  onAddPress,
  uploadingUris = [],
  deletingUris = [],
  isUploading = false,
}: DraggableImageListProps) {
  const handleDragEnd = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const updated = [...images];
    const [movedItem] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, movedItem);
    onReorder(updated);
  };

  const handleMoveLeft = (idx: number) => {
    if (idx <= 0) return;
    handleDragEnd(idx, idx - 1);
  };

  const handleMoveRight = (idx: number) => {
    if (idx >= images.length - 1) return;
    handleDragEnd(idx, idx + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.instructionsRow}>
        <Text style={styles.instructionsText}>
          Drag photos horizontally to define display order. First photo is the{' '}
          <Text style={{ fontWeight: 'bold', color: '#FF5E36' }}>Cover</Text>.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Prominent Large Add Photo Tile */}
        <TouchableOpacity
          onPress={onAddPress}
          style={styles.addPhotoCard}
          activeOpacity={0.7}
        >
          <View style={styles.addPhotoIconCircle}>
            <Camera size={22} color="#FF5E36" />
          </View>
          <Text style={styles.addPhotoTitle}>+ Add Photo</Text>
          <Text style={styles.addPhotoSubtitle}>Gallery or Camera</Text>
        </TouchableOpacity>

        {/* Draggable Big Image Tiles */}
        {images.map((img: string, idx: number) => {
          const isItemUploading =
            uploadingUris.includes(img) ||
            ((img.startsWith('file:') || img.startsWith('content:') || img.startsWith('blob:')) && isUploading);
          const isItemDeleting = deletingUris.includes(img);

          return (
            <DraggableItem
              key={`${img}-${idx}`}
              img={img}
              idx={idx}
              total={images.length}
              isUploading={isItemUploading}
              isDeleting={isItemDeleting}
              onMoveLeft={() => handleMoveLeft(idx)}
              onMoveRight={() => handleMoveRight(idx)}
              onRemove={() => onRemove(idx)}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  instructionsRow: {
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 11,
    color: '#71717a',
    lineHeight: 15,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 16,
  },
  addPhotoCard: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#FF5E36',
    backgroundColor: '#fff7f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ITEM_MARGIN,
    padding: 10,
  },
  addPhotoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addPhotoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5E36',
    textAlign: 'center',
  },
  addPhotoSubtitle: {
    fontSize: 9,
    color: '#a1a1aa',
    marginTop: 2,
    textAlign: 'center',
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    marginRight: ITEM_MARGIN,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f4f4f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  coverCardBorder: {
    borderWidth: 2.5,
    borderColor: '#FF5E36',
  },
  standardCardBorder: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  imageContent: {
    width: '100%',
    height: '100%',
  },
  spinnerOnlyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  orderBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    zIndex: 15,
  },
  coverBadge: {
    backgroundColor: '#FF5E36',
  },
  numberBadge: {
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
  },
  orderBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  deleteBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  dragHandleIndicator: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 15,
  },
  bottomControlsBar: {
    position: 'absolute',
    bottom: 6,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    zIndex: 15,
  },
  navArrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
