# Historical Data Integration - Jewish Population Example

## 🗺️ What's Been Added

Your GIS Viewer now includes powerful historical data integration capabilities, specifically designed to work with sites like the Jewish Population map from the International Institute for Jewish Genealogy.

### New Features:

1. **📜 Historical Data Importer**
   - Automatically detects and imports data from ImageMapper websites
   - Special support for Jewish population data (1900-1930)
   - Handles CORS restrictions gracefully with fallback options

2. **🎨 Enhanced Visualization**
   - Population markers scaled by size
   - Dual-ring display (1900 vs 1930 populations)
   - City names and population numbers
   - Color-coded historical data

3. **📊 Rich Tooltips**
   - Population changes over time
   - Percentage growth/decline
   - Historical context information

## 🎯 How to Use

### Step 1: Import Historical Data
1. Click **"📜 Import Historical Data"** button
2. The URL for Jewish population data is pre-filled: 
   ```
   https://www.iijg.org/wp-content/uploads/maps/Map-1900-1930-2/WEB-1900-1930/INDEX.HTML
   ```
3. Select **"Jewish Population Data"** as the data type
4. Click **"Import Data"**

### Step 2: Load a Compatible Map
For best results, use a historical map of Europe from 1900-1930 period. You can:
- Use any European map image (JPEG/PNG)
- Download historical maps from sources like:
  - Library of Congress
  - David Rumsey Map Collection
  - National archives

### Step 3: Calibrate the Map
1. Use the **Calibrate tool** to set reference points
2. Suggested calibration points for European maps:
   - **Berlin**: 52.5200, 13.4050
   - **Paris**: 48.8566, 2.3522
   - **Vienna**: 48.2082, 16.3738
   - **Warsaw**: 52.2297, 21.0122

### Step 4: Explore the Data
- Hover over population markers to see detailed information
- Purple markers show Jewish population data
- Larger markers = larger populations
- Inner/outer rings show population changes

## 📊 Sample Data Included

If the direct import fails (due to CORS restrictions), the system automatically loads sample data for major Jewish communities:

| City | Country | 1900 Population | 1930 Population | Change |
|------|---------|----------------|------------------|--------|
| Warsaw | Poland | 254,000 | 353,000 | +39% |
| Budapest | Hungary | 166,000 | 204,000 | +23% |
| Vienna | Austria | 147,000 | 191,000 | +30% |
| Berlin | Germany | 92,000 | 160,000 | +74% |
| Łódź | Poland | 98,000 | 202,000 | +106% |

## 🔧 Technical Details

### Data Format Support
- **ImageMapper websites** (like the IIJG site)
- **Tiled map services**
- **Configuration-based maps**
- **Population databases**

### Import Process
1. **Auto-detection**: Analyzes website structure
2. **Configuration parsing**: Extracts JavaScript config files
3. **Data extraction**: Finds coordinate and population data
4. **CORS handling**: Graceful fallback for restricted sites
5. **Sample data**: Provides realistic examples when needed

### Visualization Features
- **Scalable markers**: Size based on population
- **Temporal comparison**: Visual difference between time periods
- **Rich metadata**: Comprehensive tooltip information
- **Historical context**: Special styling for historical data

## 🌍 Expanding to Other Historical Data

The system is designed to work with various historical map sources:

### Supported Website Types:
- **ImageMapper sites** (HTML ImageMapper 13.3+)
- **Tiled map services**
- **Population databases**
- **Historical archives**

### Adding New Data Sources:
1. Use the **"Import Historical Data"** feature
2. Enter the URL of the historical map website
3. Select appropriate data type
4. The system will attempt automatic extraction

### Manual Import Process:
If automatic import fails, the system provides detailed instructions for manual data extraction.

## 🎨 Customization

You can modify the visualization by editing these properties in the code:

```javascript
// Population marker styling
const baseSize = 8;        // Minimum marker size
const maxSize = 25;        // Maximum marker size
const scaleFactor = 50000; // Population per size unit

// Colors
const outerColor = '#8e24aa';  // 1930 population
const innerColor = '#ab47bc';  // 1900 population
```

## 📚 Data Sources

### Primary Example:
- **Jewish Populations in Europe: 1900 and 1930**
- Created by Sandra Crystall
- Based on research by Laurence Leitenberg
- International Institute for Jewish Genealogy

### Additional Compatible Sources:
- Historical census data
- Population atlases
- Immigration records
- Urban development maps

## 🔍 Next Steps

1. **Try the Import**: Test with the pre-loaded Jewish population URL
2. **Load Your Map**: Upload a historical European map
3. **Calibrate**: Set reference points for accurate positioning
4. **Explore**: Hover over markers to see population data
5. **Expand**: Try importing other historical datasets

Your GIS Viewer is now a powerful tool for historical demographic analysis! 🎊
