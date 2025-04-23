import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback, useMemo, SetStateAction } from 'react';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define constants for grid layout (can be adjusted)
const NUM_COLUMNS = 4; // Revert to 4 or adjust as needed
const GRID_PADDING = 15; // Adjust padding
const GRID_GAP = 15;     // Gap between items (used for row margin)

interface Drawing {
  uri: string;
  id: string;
  timestamp: number;
}

// Define a type for the list items, including the placeholder
type GridItemType = Drawing | { id: 'new-drawing-item'; uri: ''; timestamp: number };

// Placeholder for the "New Drawing" button
const newDrawingPlaceholder: GridItemType = { id: 'new-drawing-item', uri: '', timestamp: -1 };

export default function DrawingPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [savedDrawings, setSavedDrawings] = useState<Drawing[]>([]);
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [containerWidth, setContainerWidth] = useState(0); // State for measured width
  const [isSelectionMode, setIsSelectionMode] = useState(false); // State for selection mode
  const [selectedDrawings, setSelectedDrawings] = useState<Set<string>>(new Set()); // State for selected drawing IDs

  useEffect(() => {
    loadSavedDrawings();
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant media library access to save drawings.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const loadSavedDrawings = async () => {
    try {
      const drawingsDir = `${FileSystem.documentDirectory}drawings/`;
      const dirInfo = await FileSystem.getInfoAsync(drawingsDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(drawingsDir, { intermediates: true });
      }

      const files = await FileSystem.readDirectoryAsync(drawingsDir);
      const drawings = files
        .filter(file => file.endsWith('.png'))
        .map(file => ({
          uri: `${drawingsDir}${file}`,
          id: file,
          timestamp: parseInt(file.split('.')[0])
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setSavedDrawings(drawings);
    } catch (error) {
      console.error('Error loading drawings:', error);
    }
  };

  const handleNewDrawing = () => {
    if (isSelectionMode) return;

    console.log('Attempting navigation...');
    console.log('Router object:', router);

    // Add a check to see if the router object exists and has the push method
    if (router && typeof router.push === 'function') {
        console.log('Router seems valid, pushing to /drawingCanvas/index');
        router.push('/drawingCanvas/index');
    } else {
        console.error('Router object is invalid or not ready!', router);
        Alert.alert('Navigation Error', 'Could not navigate. Router is not available.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDrawings.size === 0) {
      setIsSelectionMode(false);
      return;
    }

    Alert.alert(
        'Confirm Deletion',
        `Are you sure you want to delete ${selectedDrawings.size} drawing(s)?`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const drawingsToDelete = savedDrawings.filter(d => selectedDrawings.has(d.id));
                        for (const drawing of drawingsToDelete) {
                            await FileSystem.deleteAsync(drawing.uri);
                        }
                        setSavedDrawings(prev => prev.filter(d => !selectedDrawings.has(d.id)));
                        setSelectedDrawings(new Set());
                        setIsSelectionMode(false);
                    } catch (error) {
                        console.error('Error deleting selected drawings:', error);
                        Alert.alert('Error', 'Could not delete selected drawings.');
                        setSelectedDrawings(new Set());
                        setIsSelectionMode(false);
                    }
                },
            },
        ]
    );
};

  const toggleSelectionMode = () => {
    if (savedDrawings.length === 0) return;
    setIsSelectionMode(true);
    setSelectedDrawings(new Set());
  };

  const handleCancelSelection = () => {
    setSelectedDrawings(new Set());
    setIsSelectionMode(false);
  };

  const toggleDrawingSelection = (drawingId: string) => {
    setSelectedDrawings(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(drawingId)) {
        newSelected.delete(drawingId);
      } else {
        newSelected.add(drawingId);
      }
      return newSelected;
    });
  };

  const itemDimensions = useMemo(() => {
    if (containerWidth <= 0) {
      return { itemWidth: 0, itemHeight: 0 };
    }
    const availableWidth = containerWidth - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1);
    const itemWidth = Math.floor(availableWidth / NUM_COLUMNS);
    const itemHeight = Math.max(1, itemWidth * (9 / 16));
    return { itemWidth, itemHeight };
  }, [containerWidth, NUM_COLUMNS, GRID_PADDING, GRID_GAP]);

  const renderGridItem = useCallback(({ item }: { item: GridItemType }) => {
    if (item.id === 'new-drawing-item') {
      const isDisabled = isSelectionMode;
      return (
        <TouchableOpacity
          style={[
            styles.gridItem,
            styles.newDrawingButton,
            { width: itemDimensions.itemWidth, height: itemDimensions.itemHeight },
            isDisabled && styles.disabledButton,
            { marginRight: GRID_GAP }
          ]}
          onPress={handleNewDrawing}
          disabled={isDisabled}
        >
          <MaterialIcons name="add" size={Math.min(40, itemDimensions.itemWidth * 0.4)} color={isDisabled ? '#A0A0A0' : '#007AFF'} />
          <Text style={[styles.newDrawingText, isDisabled ? styles.disabledText : {color: '#007AFF'}, { fontSize: Math.min(16, itemDimensions.itemWidth * 0.15)}]}>New Drawing</Text>
        </TouchableOpacity>
      );
    }

    const isSelected = selectedDrawings.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => isSelectionMode && toggleDrawingSelection(item.id)}
        activeOpacity={isSelectionMode ? 0.7 : 1.0}
        style={[
          styles.gridItem,
          { width: itemDimensions.itemWidth, height: itemDimensions.itemHeight },
          { marginRight: GRID_GAP }
        ]}
      >
        <View style={[styles.imageContainer, isSelected && styles.selectedItem]}>
            <Image
              source={{ uri: item.uri }}
              style={styles.drawingImage}
            />
            {/* Conditional rendering for selection indicator */}
            {isSelectionMode && (
                <View style={[
                    { width: 24, height: 24, borderRadius: 12 },
                    styles.selectableItemOverlay,
                    // Apply different background color based on selection state
                    { backgroundColor: isSelected ? '#007AFF' : '#B0B0B0' }
                ]}>
                    {/* Show checkmark only when selected */}
                    {isSelected && (
                        <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    )}
                </View>
            )}
        </View>
      </TouchableOpacity>
    );
  }, [isSelectionMode, selectedDrawings, itemDimensions, handleNewDrawing, toggleDrawingSelection]);

  return (
    <View
      style={styles.container}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.topBar}>
        <View style={styles.topBarTitleContainer}>
          <Text style={styles.topBarTitle}>Drawing Pad</Text>
        </View>
        {isSelectionMode ? (
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={handleCancelSelection} style={styles.topBarButton}>
              <Text style={styles.topBarButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
               onPress={handleDeleteSelected}
               style={styles.topBarButton}
               disabled={selectedDrawings.size === 0}
            >
              <Text style={[
                  styles.topBarButtonText,
                  styles.deleteButtonText,
                  selectedDrawings.size === 0 && styles.disabledText
              ]}>
                  Delete ({selectedDrawings.size})
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedDrawings.length > 0 && (
            <TouchableOpacity style={styles.topBarButton} onPress={toggleSelectionMode}>
              <MaterialIcons name="delete" size={24} color="#000000" />
            </TouchableOpacity>
          )
        )}
      </View>
      {containerWidth > 0 && itemDimensions.itemWidth > 0 ? (
        <FlatList
          data={[newDrawingPlaceholder, ...savedDrawings]}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          style={{ flex: 1 }}
          extraData={{ isSelectionMode, selectedDrawingsSize: selectedDrawings.size, savedDrawingsLength: savedDrawings.length }}
        />
      ) : (
           <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
           </View>
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  topBarTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 50,
  },
  topBarTitle: {
    color: 'black',
    fontSize: 18,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  topBarButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  topBarButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  disabledText: {
    color: '#C7C7CD',
  },
  gridContainer: {
    paddingHorizontal: GRID_PADDING,
    paddingVertical: GRID_PADDING,
  },
  gridItem: {
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: GRID_GAP,
      overflow: 'hidden',
      position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  newDrawingButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#f4f4f4',
    borderColor: '#C7C7CD',
    borderStyle: 'dotted',
    opacity: 0.7,
  },
  newDrawingText: {
    color: '#007AFF',
    marginTop: 5,
    fontWeight: '500',
  },
  drawingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedItem: {
    borderColor: '#007AFF',
    borderWidth: 3,
    borderRadius: 20,
  },
  selectableItemOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
}); 