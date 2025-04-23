import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, GestureResponderEvent, Alert } from 'react-native';
import { Canvas, Path, Skia, SkPath, PaintStyle, Rect, RoundedRect, SkiaDomView } from '@shopify/react-native-skia';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_BACKGROUND_COLOR = 'white';
// Define separate padding values
const CANVAS_PADDING_VERTICAL = 60; 
const CANVAS_PADDING_HORIZONTAL = 20;

// Define ratio and calculate dimensions for the VISIBLE area
const CANVAS_HEIGHT_RATIO = 0.7;
const ASPECT_RATIO = 16 / 10;
const canvasHeight = SCREEN_HEIGHT * CANVAS_HEIGHT_RATIO;
const canvasWidth = canvasHeight * ASPECT_RATIO;

// Calculate dimensions for the INTERACTION area (using separate padding)
const interactionWidth = canvasWidth + 2 * CANVAS_PADDING_HORIZONTAL;
const interactionHeight = canvasHeight + 2 * CANVAS_PADDING_VERTICAL;

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(max, value));
};

type Tool = 'brush' | 'eraser';

// Update Tool type to include background for popover
type PopoverType = 'brush' | 'eraser' | 'background';

interface PathWithColor {
  path: SkPath;
  color: string;
  strokeWidth: number;
  tool: Tool;
}

const COLORS = [
  '#000000', '#FFFFFF', '#808080', '#D3D3D3', '#A9A9A9', '#BC8F8F',
  '#FF0000', '#DC143C', '#800000', '#FA8072', '#FFC0CB', '#FFE4E1',
  '#FFA500', '#A52A2A', '#D2B48C', '#F5F5DC', '#FFDEAD',
  '#FFFF00', '#FFD700', '#FFFFE0',
  '#00FF00', '#32CD32', '#90EE90', '#006400', '#808000', '#98FB98',
  '#00FFFF', '#40E0D0', '#008080', '#AFEEEE',
  '#ADD8E6', '#87CEEB', '#0000FF', '#000080',
  '#FF00FF', '#800080', '#4B0082', '#E6E6FA', '#DDA0DD',
  '#C0C0C0'
];

const STROKE_WIDTHS = [1, 5, 10, 15, 20];
const ACTIVE_BORDER_COLOR = 'white';

interface DrawingCanvasProps {
  setSelectedMenu: (menu: string) => void;
}

export default function DrawingCanvas({ setSelectedMenu }: DrawingCanvasProps) {
  const navigation = useNavigation();
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
  const [paths, setPaths] = useState<PathWithColor[]>([]);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [history, setHistory] = useState<PathWithColor[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [previousPoint, setPreviousPoint] = useState<{x: number, y: number} | null>(null);
  const [activePopover, setActivePopover] = useState<PopoverType | null>(null);
  const [backgroundColor, setBackgroundColor] = useState(CANVAS_BACKGROUND_COLOR);
  const canvasRef = useRef<SkiaDomView>(null);
  const captureViewRef = useRef<View>(null);
  const brushButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null); 
  const eraserButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null); 
  const lastUpdateTime = useRef(0);
  const throttleInterval = 16; // ms, approx 60fps

  const onDrawingStart = useCallback((e: GestureResponderEvent) => {
    // Close the popover if it's open
    if (activePopover !== null) {
      setActivePopover(null);
    }

    // Coordinates are relative to the Interaction Canvas
    let { locationX: x, locationY: y } = e.nativeEvent;
    // Clamp based on Interaction canvas dimensions
    x = clamp(x, 0, interactionWidth);
    y = clamp(y, 0, interactionHeight);
    const path = Skia.Path.Make();
    path.moveTo(x, y); // Use coordinates directly in the larger space
    setCurrentPath(path);
    setPreviousPoint({ x, y });
  }, [activePopover]); // Added activePopover dependency

  const onDrawingActive = useCallback((e: GestureResponderEvent) => {
    // Coordinates are relative to the Interaction Canvas
    let { locationX: x, locationY: y } = e.nativeEvent;
    // Clamp based on Interaction canvas dimensions
    x = clamp(x, 0, interactionWidth);
    y = clamp(y, 0, interactionHeight);

    if (currentPath && previousPoint) {
      const prevX = previousPoint.x;
      const prevY = previousPoint.y;

      // Check if the previous point was on an edge
      const wasOnEdge = 
        prevX <= 0 || prevX >= canvasWidth || prevY <= 0 || prevY >= canvasHeight;

      if (wasOnEdge) {
        // If previous point was on edge, use lineTo for stability
        currentPath.lineTo(x, y);
      } else {
        // Otherwise, use quadTo for smoother curves
        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;
        currentPath.quadTo(prevX, prevY, midX, midY);
      }

      setCurrentPath(currentPath.copy());
      setPreviousPoint({ x, y });
    }
  }, [currentPath, previousPoint]); // Removed canvasWidth/Height dependency

  const onDrawingEnd = useCallback(() => {
    if (currentPath) {
      const newPath: PathWithColor = {
        path: currentPath.copy(),
        color: tool === 'brush' ? color : backgroundColor,
        strokeWidth,
        tool,
      };
      const updatedPaths = [...paths, newPath];
      setPaths(updatedPaths);
      setCurrentPath(null);
      setPreviousPoint(null);

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedPaths);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [currentPath, paths, tool, color, strokeWidth, history, historyIndex, backgroundColor]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPaths(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPaths(history[historyIndex + 1]);
    }
  };

  const handleReset = () => {
    setPaths([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const handleSave = async () => {
    if (!captureViewRef.current) {
      Alert.alert('Error', 'Capture view reference is not available.');
      return;
    }
    try {
      // 1. Capture the wrapper view to temporary file
      const tempPath = await captureRef(captureViewRef, {
        format: 'png',
        quality: 0.9,
        result: 'tmpfile',
      });

      // 2. Define permanent storage location
      const timestamp = Date.now();
      const fileName = `${timestamp}.png`;
      const drawingsDir = `${FileSystem.documentDirectory}drawings/`;
      const permanentPath = `${drawingsDir}${fileName}`;

      // 3. Ensure permanent directory exists
      await FileSystem.makeDirectoryAsync(drawingsDir, { intermediates: true });

      // 4. Copy from temp path to permanent path
      await FileSystem.copyAsync({
        from: tempPath,
        to: permanentPath
      });
      console.log(`Copied drawing from ${tempPath} to ${permanentPath}`);

      // 5. (Optional but recommended) Delete the temporary file
      try {
        await FileSystem.deleteAsync(tempPath, { idempotent: true });
        console.log(`Deleted temporary file: ${tempPath}`);
      } catch (deleteError) {
        console.warn(`Could not delete temporary file ${tempPath}:`, deleteError);
      }

      // 6. Navigate back
      setSelectedMenu('drawing');

    } catch (error) {
      console.error('Error capturing or saving drawing:', error);
      Alert.alert('Save Failed', `Could not capture or save drawing: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleCancel = () => {
    setSelectedMenu('drawing');
  };

  const handleToolPress = (pressedTool: Tool) => {
    if (tool === pressedTool && activePopover === pressedTool) {
      // If clicking the active tool's button again, close its popover
      setActivePopover(null);
    } else {
      // If switching tool OR opening the selected tool's popover
      setTool(pressedTool); 
      setActivePopover(pressedTool); // Explicitly set to brush or eraser, closing background popover
    }
  };

  const handleBackgroundColorPopover = () => {
    if (activePopover === 'background') {
      // If clicking the background button again, close its popover
      setActivePopover(null);
    } else {
      // Open background popover, implicitly closing tool popovers
      setActivePopover('background'); 
    }
  };

  // Function to render the popover content
  const renderPopoverContent = () => {
    if (!activePopover) return null;

    // Background Color Picker Mode
    if (activePopover === 'background') {
      return (
        <View style={[styles.popoverContainer, styles.backgroundPopover]}>
          <Text style={styles.popoverTitle}>Canvas Color</Text>
          <View style={[styles.toolSection, styles.colorGridContainer]}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={`bg-color-${c}`}
                style={[
                  styles.colorButton,
                  { backgroundColor: c },
                  // Highlight the currently selected background color
                  backgroundColor === c && styles.selectedColor,
                ]}
                onPress={() => {
                  setBackgroundColor(c);
                  setActivePopover(null); // Close popover on selection
                }}
              />
            ))}
          </View>
        </View>
      );
    }

    // Brush/Eraser Tool Options Mode
    return (
      <View style={styles.popoverContainer}>
        {/* Stroke Width Picker (Always shown for brush/eraser) */}
        <View style={styles.toolSection}>
          <Text style={styles.popoverTitle}>Stroke Width</Text>
          {STROKE_WIDTHS.map((width) => (
            <TouchableOpacity
              key={`stroke-${width}`}
              style={[
                styles.strokeWidthButtonContainer,
                strokeWidth === width && styles.selectedStrokeWidth,
              ]}
              onPress={() => {
                setStrokeWidth(width);
              }}
            >
              <View style={[styles.strokeWidthButton, { width: 40, height: width }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Color Picker (Only for Brush) */}
        {activePopover === 'brush' && (
          <View style={[styles.toolSection, styles.colorGridContainer, { marginTop: 15 }]}>
            <Text style={styles.popoverTitle}>Brush Color</Text>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={`brush-color-${c}`}
                style={[
                  styles.colorButton,
                  { backgroundColor: c },
                  color === c && styles.selectedColor,
                ]}
                onPress={() => {
                  setColor(c);
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Outer View for Capturing and Clipping */}
      <View
        ref={captureViewRef}
        style={{
          width: canvasWidth, 
          height: canvasHeight,
          overflow: 'hidden',
          // Add background color here temporarily for debugging if needed
          // backgroundColor: 'rgba(0, 0, 255, 0.2)', 
        }}
      >
        <Canvas
          ref={canvasRef}
          style={styles.interactionCanvas}
          onTouchStart={onDrawingStart}
          onTouchMove={onDrawingActive}
          onTouchEnd={onDrawingEnd}
        >
          {/* Use RoundedRect for the background, now using state */}
          <RoundedRect 
            x={CANVAS_PADDING_HORIZONTAL} 
            y={CANVAS_PADDING_VERTICAL} 
            width={canvasWidth} 
            height={canvasHeight} 
            color={backgroundColor}
            r={20} 
          />
          {/* Paths are drawn relative to the interaction canvas origin */}
          {paths.map((p, i) => (
            <Path
              key={i}
              path={p.path}
              color={p.color}
              style="stroke"
              strokeWidth={p.strokeWidth}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}
          {currentPath && (
            <Path
              path={currentPath}
              color={tool === 'brush' ? color : CANVAS_BACKGROUND_COLOR}
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
              strokeJoin="round"
            />
          )}
        </Canvas>
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Left Side: History Actions */}
        <View style={styles.topBarSection}>
          <TouchableOpacity onPress={handleUndo} style={styles.button} disabled={historyIndex <= 0}>
            <MaterialIcons name="undo" size={24} color={historyIndex <= 0 ? 'grey' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRedo} style={styles.button} disabled={historyIndex >= history.length - 1}>
            <MaterialIcons name="redo" size={24} color={historyIndex >= history.length - 1 ? 'grey' : 'black'} />
          </TouchableOpacity>
          {/* Background Color Button MOVED from here */}
          <TouchableOpacity onPress={handleReset} style={styles.button} disabled={paths.length === 0}>
            <MaterialIcons name="delete" size={24} color={paths.length === 0 ? 'grey' : 'black'} />
          </TouchableOpacity>
        </View>

        {/* Center: Tools - Overhauled for consistency */}
        <View style={styles.topCenterSection}>
          {/* Draw Button */}
          <TouchableOpacity
            ref={brushButtonRef}
            style={[styles.toolButton, tool === 'brush' && activePopover === 'brush' && styles.selectedTool]}
            onPress={() => handleToolPress('brush')}
          >
            <View style={styles.toolButtonContent}>
              <MaterialIcons name="brush" size={24} color={'black'} />
              {tool === 'brush' ? (
                <>
                  <Text style={styles.toolText}>draw</Text>
                  <View style={styles.previewContainer}>
                    <View
                      style={[
                        styles.previewCircle,
                        {
                          backgroundColor: color,
                          width: strokeWidth + 4,
                          height: strokeWidth + 4,
                          borderRadius: (strokeWidth + 4) / 2,
                        },
                      ]}
                    />
                  </View>
                </>
              ) : null}
            </View>
          </TouchableOpacity>

          {/* Background Color Button */}
          <TouchableOpacity
            onPress={handleBackgroundColorPopover}
            style={[styles.toolButton, activePopover === 'background' && styles.selectedTool]}
          >
            <View style={styles.toolButtonContent}>
              <MaterialIcons name="layers" size={24} color={'black'} />
              {activePopover === 'background' ? (
                <Text style={styles.toolText}>Canvas</Text>
              ) : null}
            </View>
          </TouchableOpacity>

          {/* Eraser Button */}
          <TouchableOpacity
            ref={eraserButtonRef}
            style={[styles.toolButton, tool === 'eraser' && activePopover === 'eraser' && styles.selectedTool]}
            onPress={() => handleToolPress('eraser')}
          >
            <View style={styles.toolButtonContent}>
              {/* Use MaterialCommunityIcons for eraser */}
              <MaterialCommunityIcons name="eraser" size={24} color={'black'} /> 
              {tool === 'eraser' ? (
                <>
                  <Text style={styles.toolText}>eraser</Text>
                  <View style={styles.previewContainer}>
                    <View
                      style={[
                        styles.previewCircle,
                        {
                          backgroundColor: 'black',
                          width: strokeWidth + 4,
                          height: strokeWidth + 4,
                          borderRadius: (strokeWidth + 4) / 2,
                        },
                      ]}
                    />
                  </View>
                </>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>

        {/* Right Side: Cancel/Save */}
        <View style={styles.topBarSection}>
          <TouchableOpacity onPress={handleCancel} style={styles.button}>
            <MaterialIcons name="close" size={24} color={'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.button}>
            <MaterialIcons name="save" size={24} color={'black'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Render the Popover conditionally */}
      {activePopover && renderPopoverContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Rename canvas style to interactionCanvas and use interaction dimensions
  interactionCanvas: {
    width: interactionWidth,
    height: interactionHeight,
    position: 'absolute', // Position within the clipping view
    // Update positioning based on separate padding
    top: -CANVAS_PADDING_VERTICAL,
    left: -CANVAS_PADDING_HORIZONTAL,
  },
  topBar: {
    height: 70,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  topBarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width:90,
  },
  toolButton: {
    paddingVertical: 6, // Adjust padding
    paddingHorizontal: 10,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'white',
  },
  toolButtonContent: { // Style for the inner content row
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    gap: 6, // Space between icon, text, preview
    minHeight: 24, // Ensure minimum height consistency (match icon size)
  },
  toolText: { // Style for the text
    fontSize: 14,
    marginLeft: 2, // Small space after icon
    color: 'black',
  },
  previewContainer: { // Container for the preview circle
    width: 24, // Fixed size for alignment
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4, // Space before preview
    // backgroundColor: 'rgba(0,0,0,0.1)', // Optional: background for debugging
  },
  previewCircle: { // Base style for the preview circle
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)', // Slight border for visibility
  },
  selectedTool: {
    backgroundColor: ACTIVE_BORDER_COLOR,
    borderWidth: 1,
    borderColor: 'black',
    // Maybe add a border as well for more emphasis
  },
  topCenterSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginHorizontal: 10,
  },
  button: {
    padding: 8,
  },
  popoverContainer: {
    position: 'absolute',
    top: 70, 
    zIndex: 10, 
    backgroundColor: '#ffffff', 
    borderRadius: 40,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'lightgray',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 20,
    width: 440,
  },
  backgroundPopover: { 
    paddingVertical: 15,
  },
  popoverTitle: { // Style for titles within the popover
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
    width: '100%', 
    textAlign: 'center',
  },
  toolSection: { // Reuse this style for layout within popover
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap', // Allow wrapping if many colors/widths
    justifyContent: 'center', // Center items if they wrap
  },
  strokeWidthButtonContainer: {
    padding: 4,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedStrokeWidth: {
    borderColor: ACTIVE_BORDER_COLOR,
  },
  strokeWidthButton: {
    height: 4,
    backgroundColor: 'black',
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D3D3D3',
  },
  selectedColor: {
    borderColor: 'black',
    transform: [{ scale: 1.1 }],
  },
  colorGridContainer: { // Specific styles for the color grid section
    width: 370, // Width to accommodate ~10 buttons (28px) + gaps (10px)
    marginTop: 10,
    paddingBottom: 5, // Add a little padding at the bottom
  },
});
