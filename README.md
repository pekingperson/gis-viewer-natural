
# GIS Viewer - Interactive Web-Based Map Application

A comprehensive web-based GIS (Geographic Information System) viewer that allows users to load map images, calibrate coordinate systems, add annotations, measure distances, and overlay GeoJSON data. Built with vanilla JavaScript and HTML5 Canvas for maximum compatibility and performance.

## 🌟 Features


## Features

### Map Image Loading
- Supported formats: JPEG, JPG, PNG
- Drag & drop or file picker upload
- Responsive display and scaling
- High-DPI support

### Interactive Navigation
- Zoom with mouse wheel (centered on cursor)
- Pan by dragging
- Smooth, responsive interactions
- Configurable zoom limits

### Coordinate System Calibration
- Set multiple reference points with known coordinates
- Affine transformation for coordinate mapping
- Live coordinate display
- Supports both 2-point and multi-point calibration

### Interactive Annotations
- Add labeled points to the map
- Metadata: labels and descriptions
- Automatic geographic coordinates when calibrated
- Hover tooltips
- Persistent storage in localStorage

### Distance Measurement
- Click two points to measure distance
- Geographic accuracy using Haversine formula
- Automatic units (meters/kilometers)
- Dashed lines for visual feedback

### GeoJSON Support
- Import external GeoJSON files
- Supports points, lines, polygons, multi-geometries
- Customizable styling
- Automatic projection to calibrated coordinates
- Hover tooltips for feature info

### Grid Overlay
- Lat/lng grid lines
- Dynamic spacing based on zoom
- Toggle grid on/off
- Subtle styling for clarity

### Data Persistence
- Automatic saving to localStorage
- Restore work between sessions
- Export all annotations and measurements as JSON
- Clear/reset options

### Responsive Design
- Mobile and tablet friendly
## 🚀 Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Click "Load Map Image" to upload a JPEG or PNG map file
3. Use the "Calibrate" tool to set reference points with known coordinates
4. Start exploring with annotations, measurements, and overlays

### Calibration Process
1. **Switch to Calibrate Tool**: Click the "📍 Calibrate" button
2. **Select Points**: Click on known locations on your map
3. **Enter Coordinates**: Input the corresponding latitude and longitude
4. **Repeat**: Add at least 2 reference points for basic calibration
5. **Verify**: Check the coordinate display for accuracy

### Tool Usage

#### 🤚 Pan Tool (Default)
- **Mouse**: Click and drag to pan
- **Wheel**: Scroll to zoom in/out
- **Purpose**: Navigate around the map

#### 📍 Calibrate Tool
- **Click**: Select reference points
- **Input**: Enter known lat/lng coordinates
- **Purpose**: Establish geographic coordinate system

#### 📌 Annotate Tool
- **Click**: Add annotation points
- **Input**: Enter label and optional description
- **Purpose**: Mark important locations

#### 📏 Measure Tool
- **Click**: Select two points to measure
- **Result**: Distance displayed in appropriate units
- **Purpose**: Calculate distances between locations

## 🛠️ Technical Implementation

### Architecture
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Rendering**: HTML5 Canvas with 2D context
- **Storage**: localStorage for data persistence
- **Math**: Custom affine transformation algorithms

### Coordinate Transformation
The application uses mathematical coordinate transformation to map between pixel coordinates on the image and real-world geographic coordinates:

```javascript
// Affine transformation matrix
lat = a * x + b * y + c
lng = d * x + e * y + f
```

Where:
- `(x, y)` are pixel coordinates
- `(lat, lng)` are geographic coordinates
- `a, b, c, d, e, f` are transformation coefficients

### Distance Calculation
For calibrated maps, the application uses the Haversine formula to calculate accurate distances:

```javascript
const R = 6371000; // Earth's radius in meters
const dLat = (lat2 - lat1) * π / 180;
const dLng = (lng2 - lng1) * π / 180;
const a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLng/2);
const c = 2 * atan2(√a, √(1-a));
const distance = R * c;
```

### Data Storage Structure
```json
{
  "annotations": [
    {
      "id": 1234567890,
      "pixel": {"x": 100, "y": 200},
      "geo": {"lat": 40.7128, "lng": -74.0060},
      "label": "New York City",
      "description": "City center",
      "timestamp": "2025-01-01T12:00:00.000Z"
    }
  ],
  "referencePoints": [
    {
      "pixel": {"x": 50, "y": 100},
      "geo": {"lat": 40.7589, "lng": -73.9851}
    }
  ],
  "measurements": [
    {
      "id": 1234567891,
      "points": [{"x": 10, "y": 20}, {"x": 100, "y": 200}],
      "distance": "15.67",
      "unit": "km",
      "timestamp": "2025-01-01T12:30:00.000Z"
    }
  ]
}
```

## 📋 Browser Compatibility

### Minimum Requirements
- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

### Required Features
- HTML5 Canvas support
- ES6 JavaScript features
- localStorage API
- File API for uploads
- CSS Grid and Flexbox

## 🎯 Use Cases

### Geographic Analysis
- **Survey Data**: Overlay field survey points
- **Planning**: Urban and regional planning visualization
- **Environmental**: Ecological site mapping
- **Historical**: Historical map analysis

### Educational
- **Geography**: Teaching coordinate systems
- **Cartography**: Map projection concepts
- **STEM**: Mathematics and science visualization
- **Research**: Academic spatial analysis

### Professional
- **Engineering**: Site planning and analysis
- **Real Estate**: Property boundary visualization
- **Construction**: Project site mapping
- **Emergency**: Incident response mapping

## ⚠️ Limitations

### Projection Support
- **Simple Transformations**: Affine transformation only
- **No Projection Handling**: Assumes planar coordinate system
- **Local Accuracy**: Best for small to medium scale maps

### File Size
- **Browser Memory**: Limited by available RAM
- **Image Size**: Very large images may cause performance issues
- **Storage**: localStorage has size limitations (~5-10MB)

### Accuracy
- **Calibration Dependent**: Accuracy depends on reference point quality
- **Linear Transformation**: May not account for map distortions
- **Scale Variations**: Best accuracy near reference points

## 🔧 Customization

### Styling
The application uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #667eea;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
}
```

### Configuration
Key parameters can be modified in the JavaScript:

```javascript
this.viewport = {
  minScale: 0.1,    // Minimum zoom level
  maxScale: 10,     // Maximum zoom level
  // ... other settings
};
```

## 📚 API Reference

### Main Class: GISViewer

#### Methods
- `loadStoredData()`: Load data from localStorage
- `saveData()`: Save current data to localStorage
- `pixelToGeo(x, y)`: Convert pixel to geographic coordinates
- `geoToPixel(lat, lng)`: Convert geographic to pixel coordinates
- `calculateTransform()`: Compute coordinate transformation
- `exportData()`: Export data as JSON file

#### Events
- Map loading and display
- Tool switching and interaction
- Coordinate transformation
- Data persistence

## 🤝 Contributing

### Development Setup
1. Clone or download the project files
2. Open in a local web server (for file upload functionality)
3. Edit HTML, CSS, or JavaScript files as needed
4. Test in multiple browsers

### Code Structure
- `index.html`: Main application layout
- `styles.css`: All styling and responsive design
- `gis-viewer.js`: Core application logic and GIS functionality

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute according to your needs.

## 🆘 Support

### Common Issues

**Q: Coordinates seem inaccurate**
A: Ensure you have at least 2 well-distributed reference points with accurate coordinates.

**Q: Map appears blurry on high-DPI displays**
A: The application automatically handles retina displays. Ensure your browser supports devicePixelRatio.

**Q: GeoJSON doesn't display correctly**
A: Verify your map is properly calibrated and the GeoJSON coordinates match your map's coordinate system.

**Q: Performance issues with large images**
A: Consider resizing very large images before upload, or use progressive loading techniques.

### Tips for Best Results

1. **Use high-quality reference points**: Choose clearly identifiable features
2. **Distribute reference points**: Spread them across the map area
3. **Verify coordinates**: Double-check lat/lng values for accuracy
4. **Test calibration**: Add a known point to verify transformation accuracy
5. **Regular saves**: Export your work periodically for backup

---

*Built with ❤️ for the GIS and mapping community*
