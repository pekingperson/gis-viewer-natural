/**
 * GIS Viewer - Interactive Map Application
 * 
 * This application provides a web-based GIS viewer with the following features:
 * - Map image loading and display
 * - Coordinate system calibration
 * - Interactive annotations
 * - Distance measurement
 * - GeoJSON overlay support
 * - Grid overlay
 * - Persistent storage
 */

class GISViewer {
    constructor() {
        // Canvas and rendering
        this.canvas = document.getElementById('map-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.mapImage = null;
        
        // Viewport and interaction
        this.viewport = {
            x: 0,
            y: 0,
            scale: 1,
            minScale: 0.1,
            maxScale: 10
        };
        
        // Current tool mode
        this.currentTool = 'pan';
        
        // Coordinate transformation
        this.referencePoints = []; // Array of {pixel: {x, y}, geo: {lat, lng}}
        this.isCalibrated = false;
        this.transform = null; // Transformation matrix
        
        // Data storage
        this.annotations = []; // User-added points
        this.geoJsonData = null; // Loaded GeoJSON features
        this.measurements = []; // Distance measurements
        
        // UI state
        this.isDragging = false;
        this.dragStart = null;
        this.measurementPoints = [];
        this.showGrid = false;
        this.showAnnotations = true;
        
        // Storage key for persistence
        this.storageKey = 'gis-viewer-data';
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadStoredData();
        this.updateUI();
        this.render();
    }
    
    /**
     * Setup canvas dimensions and retina display support
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas size to container size
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Handle retina displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width *= dpr;
        this.canvas.height *= dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(dpr, dpr);
        
        // Store display dimensions
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File uploads
        document.getElementById('map-upload').addEventListener('change', (e) => this.handleMapUpload(e));
        document.getElementById('geojson-upload').addEventListener('change', (e) => this.handleGeoJSONUpload(e));
        
        // Tool selection
        document.getElementById('pan-tool').addEventListener('click', () => this.setTool('pan'));
        document.getElementById('calibrate-tool').addEventListener('click', () => this.setTool('calibrate'));
        document.getElementById('annotate-tool').addEventListener('click', () => this.setTool('annotate'));
        document.getElementById('measure-tool').addEventListener('click', () => this.setTool('measure'));
        
        // View options
        document.getElementById('grid-toggle').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.render();
        });
        
        document.getElementById('annotations-toggle').addEventListener('change', (e) => {
            this.showAnnotations = e.target.checked;
            this.render();
        });
        
        // Data management
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('clear-data').addEventListener('click', () => this.clearAllData());
        document.getElementById('reset-calibration').addEventListener('click', () => this.resetCalibration());
        
        // Canvas interactions
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Modal interactions
        this.setupModalEvents();
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
    }
    
    /**
     * Setup modal event handlers
     */
    setupModalEvents() {
        // Calibration modal
        document.getElementById('confirm-reference').addEventListener('click', () => this.confirmReferencePoint());
        document.getElementById('cancel-reference').addEventListener('click', () => this.cancelReferencePoint());
        
        // Annotation modal
        document.getElementById('confirm-annotation').addEventListener('click', () => this.confirmAnnotation());
        document.getElementById('cancel-annotation').addEventListener('click', () => this.cancelAnnotation());
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }
    
    /**
     * Load stored data from localStorage
     */
    loadStoredData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.annotations = data.annotations || [];
                this.referencePoints = data.referencePoints || [];
                this.measurements = data.measurements || [];
                
                if (this.referencePoints.length >= 2) {
                    this.calculateTransform();
                }
            }
        } catch (error) {
            console.warn('Failed to load stored data:', error);
        }
    }
    
    /**
     * Save data to localStorage
     */
    saveData() {
        try {
            const data = {
                annotations: this.annotations,
                referencePoints: this.referencePoints,
                measurements: this.measurements,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save data:', error);
        }
    }
    
    /**
     * Handle map image upload
     */
    handleMapUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/i)) {
            alert('Please select a JPEG or PNG image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.mapImage = img;
                this.resetViewport();
                this.render();
                this.updateStatus('Map loaded successfully');
                document.getElementById('file-name').textContent = file.name;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Handle GeoJSON file upload
     */
    handleGeoJSONUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.geoJsonData = JSON.parse(e.target.result);
                this.render();
                this.updateStatus('GeoJSON loaded successfully');
            } catch (error) {
                alert('Invalid GeoJSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Set the current tool
     */
    setTool(tool) {
        this.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool + '-tool').classList.add('active');
        
        // Update canvas cursor
        this.canvas.className = '';
        if (tool === 'calibrate' || tool === 'annotate' || tool === 'measure') {
            this.canvas.classList.add('crosshair');
        }
        
        // Reset measurement if switching away from measure tool
        if (tool !== 'measure') {
            this.measurementPoints = [];
        }
        
        this.updateStatus(`Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`);
    }
    
    /**
     * Reset viewport to fit the map image
     */
    resetViewport() {
        if (!this.mapImage) return;
        
        const scaleX = this.displayWidth / this.mapImage.width;
        const scaleY = this.displayHeight / this.mapImage.height;
        this.viewport.scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some margin
        
        this.viewport.x = (this.displayWidth - this.mapImage.width * this.viewport.scale) / 2;
        this.viewport.y = (this.displayHeight - this.mapImage.height * this.viewport.scale) / 2;
    }
    
    /**
     * Convert screen coordinates to map coordinates
     */
    screenToMap(screenX, screenY) {
        return {
            x: (screenX - this.viewport.x) / this.viewport.scale,
            y: (screenY - this.viewport.y) / this.viewport.scale
        };
    }
    
    /**
     * Convert map coordinates to screen coordinates
     */
    mapToScreen(mapX, mapY) {
        return {
            x: mapX * this.viewport.scale + this.viewport.x,
            y: mapY * this.viewport.scale + this.viewport.y
        };
    }
    
    /**
     * Convert pixel coordinates to geographic coordinates using calibration
     */
    pixelToGeo(x, y) {
        if (!this.isCalibrated || !this.transform) {
            return null;
        }
        
        // Apply affine transformation
        const lat = this.transform.a * x + this.transform.b * y + this.transform.c;
        const lng = this.transform.d * x + this.transform.e * y + this.transform.f;
        
        return { lat, lng };
    }
    
    /**
     * Convert geographic coordinates to pixel coordinates
     */
    geoToPixel(lat, lng) {
        if (!this.isCalibrated || !this.transform) {
            return null;
        }
        
        // Apply inverse transformation
        const det = this.transform.a * this.transform.e - this.transform.b * this.transform.d;
        if (Math.abs(det) < 1e-10) return null;
        
        const x = (this.transform.e * (lat - this.transform.c) - this.transform.b * (lng - this.transform.f)) / det;
        const y = (this.transform.a * (lng - this.transform.f) - this.transform.d * (lat - this.transform.c)) / det;
        
        return { x, y };
    }
    
    /**
     * Calculate transformation matrix from reference points
     * Uses least squares to fit an affine transformation
     */
    calculateTransform() {
        if (this.referencePoints.length < 2) {
            this.isCalibrated = false;
            this.transform = null;
            return;
        }
        
        // For 2 points, use simple linear interpolation
        // For more points, use least squares fitting
        
        if (this.referencePoints.length === 2) {
            const p1 = this.referencePoints[0];
            const p2 = this.referencePoints[1];
            
            // Simple linear transformation between two points
            const dx = p2.pixel.x - p1.pixel.x;
            const dy = p2.pixel.y - p1.pixel.y;
            const dLat = p2.geo.lat - p1.geo.lat;
            const dLng = p2.geo.lng - p1.geo.lng;
            
            if (Math.abs(dx) < 1e-10 && Math.abs(dy) < 1e-10) {
                this.isCalibrated = false;
                return;
            }
            
            // Simple 2-point calibration (assumes north-aligned, uniform scaling)
            const scaleLat = dLat / dy;
            const scaleLng = dLng / dx;
            
            this.transform = {
                a: 0, b: scaleLat, c: p1.geo.lat - scaleLat * p1.pixel.y,
                d: scaleLng, e: 0, f: p1.geo.lng - scaleLng * p1.pixel.x
            };
        } else {
            // Least squares fitting for multiple points
            this.calculateAffineTransform();
        }
        
        this.isCalibrated = true;
        this.updateCalibrationStatus();
    }
    
    /**
     * Calculate affine transformation using least squares
     */
    calculateAffineTransform() {
        const n = this.referencePoints.length;
        
        // Set up matrices for least squares: Ax = b
        const A = [];
        const bLat = [];
        const bLng = [];
        
        for (let i = 0; i < n; i++) {
            const p = this.referencePoints[i];
            A.push([p.pixel.x, p.pixel.y, 1]);
            bLat.push(p.geo.lat);
            bLng.push(p.geo.lng);
        }
        
        // Solve for latitude coefficients
        const latCoeffs = this.leastSquares(A, bLat);
        const lngCoeffs = this.leastSquares(A, bLng);
        
        if (latCoeffs && lngCoeffs) {
            this.transform = {
                a: latCoeffs[0], b: latCoeffs[1], c: latCoeffs[2],
                d: lngCoeffs[0], e: lngCoeffs[1], f: lngCoeffs[2]
            };
        }
    }
    
    /**
     * Solve least squares problem Ax = b
     */
    leastSquares(A, b) {
        const m = A.length;
        const n = A[0].length;
        
        // Compute A^T * A and A^T * b
        const AtA = Array(n).fill().map(() => Array(n).fill(0));
        const Atb = Array(n).fill(0);
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < m; k++) {
                    AtA[i][j] += A[k][i] * A[k][j];
                }
            }
            for (let k = 0; k < m; k++) {
                Atb[i] += A[k][i] * b[k];
            }
        }
        
        // Solve using Gaussian elimination
        return this.gaussianElimination(AtA, Atb);
    }
    
    /**
     * Gaussian elimination solver
     */
    gaussianElimination(A, b) {
        const n = A.length;
        const x = Array(n).fill(0);
        
        // Forward elimination
        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            // Swap rows
            [A[i], A[maxRow]] = [A[maxRow], A[i]];
            [b[i], b[maxRow]] = [b[maxRow], b[i]];
            
            // Check for singular matrix
            if (Math.abs(A[i][i]) < 1e-10) {
                return null;
            }
            
            // Eliminate column
            for (let k = i + 1; k < n; k++) {
                const factor = A[k][i] / A[i][i];
                for (let j = i; j < n; j++) {
                    A[k][j] -= factor * A[i][j];
                }
                b[k] -= factor * b[i];
            }
        }
        
        // Back substitution
        for (let i = n - 1; i >= 0; i--) {
            x[i] = b[i];
            for (let j = i + 1; j < n; j++) {
                x[i] -= A[i][j] * x[j];
            }
            x[i] /= A[i][i];
        }
        
        return x;
    }
    
    /**
     * Handle mouse down events
     */
    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.currentTool === 'pan') {
            this.isDragging = true;
            this.dragStart = { x, y };
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    /**
     * Handle mouse move events
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Update coordinate display
        this.updateCoordinateDisplay(x, y);
        
        // Handle tooltip for annotations and features
        this.updateTooltip(x, y, event.clientX, event.clientY);
        
        // Handle panning
        if (this.isDragging && this.currentTool === 'pan') {
            const dx = x - this.dragStart.x;
            const dy = y - this.dragStart.y;
            
            this.viewport.x += dx;
            this.viewport.y += dy;
            
            this.dragStart = { x, y };
            this.render();
        }
    }
    
    /**
     * Handle mouse up events
     */
    handleMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;
            this.canvas.style.cursor = this.currentTool === 'pan' ? 'grab' : 'crosshair';
        }
    }
    
    /**
     * Handle wheel events for zooming
     */
    handleWheel(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const zoom = event.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(this.viewport.minScale, 
                         Math.min(this.viewport.maxScale, this.viewport.scale * zoom));
        
        if (newScale !== this.viewport.scale) {
            // Zoom towards cursor position
            this.viewport.x = x - (x - this.viewport.x) * (newScale / this.viewport.scale);
            this.viewport.y = y - (y - this.viewport.y) * (newScale / this.viewport.scale);
            this.viewport.scale = newScale;
            
            this.render();
        }
    }
    
    /**
     * Handle click events for tools
     */
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (!this.mapImage) return;
        
        const mapCoords = this.screenToMap(x, y);
        
        switch (this.currentTool) {
            case 'calibrate':
                this.addReferencePoint(mapCoords.x, mapCoords.y);
                break;
            case 'annotate':
                this.addAnnotation(mapCoords.x, mapCoords.y);
                break;
            case 'measure':
                this.addMeasurementPoint(mapCoords.x, mapCoords.y);
                break;
        }
    }
    
    /**
     * Add a reference point for calibration
     */
    addReferencePoint(x, y) {
        this.pendingReferencePoint = { x, y };
        this.showModal('calibration-modal');
    }
    
    /**
     * Confirm reference point with coordinates
     */
    confirmReferencePoint() {
        const lat = parseFloat(document.getElementById('ref-lat').value);
        const lng = parseFloat(document.getElementById('ref-lng').value);
        
        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid latitude and longitude values.');
            return;
        }
        
        this.referencePoints.push({
            pixel: this.pendingReferencePoint,
            geo: { lat, lng }
        });
        
        this.calculateTransform();
        this.saveData();
        this.render();
        this.hideModal('calibration-modal');
        this.clearModalInputs('calibration-modal');
        
        this.updateStatus(`Reference point ${this.referencePoints.length} added`);
    }
    
    /**
     * Cancel reference point addition
     */
    cancelReferencePoint() {
        this.pendingReferencePoint = null;
        this.hideModal('calibration-modal');
        this.clearModalInputs('calibration-modal');
    }
    
    /**
     * Add an annotation
     */
    addAnnotation(x, y) {
        this.pendingAnnotation = { x, y };
        this.showModal('annotation-modal');
    }
    
    /**
     * Confirm annotation
     */
    confirmAnnotation() {
        const label = document.getElementById('annotation-label').value.trim();
        const description = document.getElementById('annotation-desc').value.trim();
        
        if (!label) {
            alert('Please enter a label for the annotation.');
            return;
        }
        
        const annotation = {
            id: Date.now(),
            pixel: this.pendingAnnotation,
            label,
            description,
            timestamp: new Date().toISOString()
        };
        
        // Add geographic coordinates if calibrated
        if (this.isCalibrated) {
            annotation.geo = this.pixelToGeo(this.pendingAnnotation.x, this.pendingAnnotation.y);
        }
        
        this.annotations.push(annotation);
        this.saveData();
        this.render();
        this.hideModal('annotation-modal');
        this.clearModalInputs('annotation-modal');
        
        this.updateStatus('Annotation added');
    }
    
    /**
     * Cancel annotation
     */
    cancelAnnotation() {
        this.pendingAnnotation = null;
        this.hideModal('annotation-modal');
        this.clearModalInputs('annotation-modal');
    }
    
    /**
     * Add measurement point
     */
    addMeasurementPoint(x, y) {
        this.measurementPoints.push({ x, y });
        
        if (this.measurementPoints.length === 2) {
            this.calculateDistance();
            this.measurementPoints = []; // Reset for next measurement
        }
        
        this.render();
    }
    
    /**
     * Calculate distance between measurement points
     */
    calculateDistance() {
        if (this.measurementPoints.length !== 2) return;
        
        const p1 = this.measurementPoints[0];
        const p2 = this.measurementPoints[1];
        
        let distance, unit = 'pixels';
        
        if (this.isCalibrated) {
            // Calculate geographic distance
            const geo1 = this.pixelToGeo(p1.x, p1.y);
            const geo2 = this.pixelToGeo(p2.x, p2.y);
            
            if (geo1 && geo2) {
                distance = this.haversineDistance(geo1.lat, geo1.lng, geo2.lat, geo2.lng);
                unit = distance > 1000 ? 'km' : 'm';
                if (unit === 'km') distance /= 1000;
            } else {
                distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            }
        } else {
            // Pixel distance
            distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        }
        
        const measurement = {
            id: Date.now(),
            points: [p1, p2],
            distance: distance.toFixed(2),
            unit,
            timestamp: new Date().toISOString()
        };
        
        this.measurements.push(measurement);
        this.saveData();
        
        alert(`Distance: ${measurement.distance} ${measurement.unit}`);
        this.updateStatus(`Measured: ${measurement.distance} ${measurement.unit}`);
    }
    
    /**
     * Calculate haversine distance between two geographic points
     */
    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    /**
     * Update coordinate display
     */
    updateCoordinateDisplay(x, y) {
        if (!this.mapImage) {
            document.getElementById('coord-text').textContent = 'No map loaded';
            return;
        }
        
        const mapCoords = this.screenToMap(x, y);
        
        if (this.isCalibrated) {
            const geoCoords = this.pixelToGeo(mapCoords.x, mapCoords.y);
            if (geoCoords) {
                document.getElementById('coord-text').textContent = 
                    `${geoCoords.lat.toFixed(6)}, ${geoCoords.lng.toFixed(6)}`;
                return;
            }
        }
        
        document.getElementById('coord-text').textContent = 
            `Pixel: ${Math.round(mapCoords.x)}, ${Math.round(mapCoords.y)}`;
    }
    
    /**
     * Update tooltip for features
     */
    updateTooltip(x, y, clientX, clientY) {
        const tooltip = document.getElementById('tooltip');
        let content = '';
        
        if (this.mapImage && this.showAnnotations) {
            const mapCoords = this.screenToMap(x, y);
            
            // Check for nearby annotations
            for (const annotation of this.annotations) {
                const screenPos = this.mapToScreen(annotation.pixel.x, annotation.pixel.y);
                const distance = Math.sqrt(Math.pow(screenPos.x - x, 2) + Math.pow(screenPos.y - y, 2));
                
                if (distance < 15) { // 15px radius
                    content = `<strong>${annotation.label}</strong>`;
                    if (annotation.description) {
                        content += `<br>${annotation.description}`;
                    }
                    if (annotation.geo) {
                        content += `<br>Lat: ${annotation.geo.lat.toFixed(6)}<br>Lng: ${annotation.geo.lng.toFixed(6)}`;
                    }
                    break;
                }
            }
        }
        
        if (content) {
            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
            tooltip.style.left = clientX + 10 + 'px';
            tooltip.style.top = clientY - 10 + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    }
    
    /**
     * Main render function
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        
        if (!this.mapImage) {
            this.drawPlaceholder();
            return;
        }
        
        // Draw map image
        this.ctx.save();
        this.ctx.translate(this.viewport.x, this.viewport.y);
        this.ctx.scale(this.viewport.scale, this.viewport.scale);
        this.ctx.drawImage(this.mapImage, 0, 0);
        this.ctx.restore();
        
        // Draw grid if enabled
        if (this.showGrid && this.isCalibrated) {
            this.drawGrid();
        }
        
        // Draw GeoJSON features
        if (this.geoJsonData && this.isCalibrated) {
            this.drawGeoJSON();
        }
        
        // Draw annotations
        if (this.showAnnotations) {
            this.drawAnnotations();
        }
        
        // Draw reference points
        this.drawReferencePoints();
        
        // Draw measurement points
        this.drawMeasurementPoints();
    }
    
    /**
     * Draw placeholder when no map is loaded
     */
    drawPlaceholder() {
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        
        this.ctx.fillStyle = '#6c757d';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Load a map image to begin', this.displayWidth / 2, this.displayHeight / 2);
    }
    
    /**
     * Draw coordinate grid
     */
    drawGrid() {
        if (!this.isCalibrated || !this.mapImage) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 100, 200, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Determine grid spacing based on zoom level
        const gridSpacing = this.getGridSpacing();
        
        // Get visible bounds in geographic coordinates
        const topLeft = this.pixelToGeo(
            -this.viewport.x / this.viewport.scale,
            -this.viewport.y / this.viewport.scale
        );
        const bottomRight = this.pixelToGeo(
            (this.displayWidth - this.viewport.x) / this.viewport.scale,
            (this.displayHeight - this.viewport.y) / this.viewport.scale
        );
        
        if (!topLeft || !bottomRight) return;
        
        // Draw latitude lines
        const startLat = Math.floor(Math.min(topLeft.lat, bottomRight.lat) / gridSpacing) * gridSpacing;
        const endLat = Math.ceil(Math.max(topLeft.lat, bottomRight.lat) / gridSpacing) * gridSpacing;
        
        for (let lat = startLat; lat <= endLat; lat += gridSpacing) {
            const startPixel = this.geoToPixel(lat, Math.min(topLeft.lng, bottomRight.lng));
            const endPixel = this.geoToPixel(lat, Math.max(topLeft.lng, bottomRight.lng));
            
            if (startPixel && endPixel) {
                const start = this.mapToScreen(startPixel.x, startPixel.y);
                const end = this.mapToScreen(endPixel.x, endPixel.y);
                
                this.ctx.beginPath();
                this.ctx.moveTo(start.x, start.y);
                this.ctx.lineTo(end.x, end.y);
                this.ctx.stroke();
            }
        }
        
        // Draw longitude lines
        const startLng = Math.floor(Math.min(topLeft.lng, bottomRight.lng) / gridSpacing) * gridSpacing;
        const endLng = Math.ceil(Math.max(topLeft.lng, bottomRight.lng) / gridSpacing) * gridSpacing;
        
        for (let lng = startLng; lng <= endLng; lng += gridSpacing) {
            const startPixel = this.geoToPixel(Math.min(topLeft.lat, bottomRight.lat), lng);
            const endPixel = this.geoToPixel(Math.max(topLeft.lat, bottomRight.lat), lng);
            
            if (startPixel && endPixel) {
                const start = this.mapToScreen(startPixel.x, startPixel.y);
                const end = this.mapToScreen(endPixel.x, endPixel.y);
                
                this.ctx.beginPath();
                this.ctx.moveTo(start.x, start.y);
                this.ctx.lineTo(end.x, end.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Get appropriate grid spacing based on zoom level
     */
    getGridSpacing() {
        const scale = this.viewport.scale;
        
        if (scale > 5) return 0.0001;      // Very high zoom
        if (scale > 2) return 0.001;       // High zoom
        if (scale > 1) return 0.01;        // Medium zoom
        if (scale > 0.5) return 0.1;       // Low zoom
        return 1;                          // Very low zoom
    }
    
    /**
     * Draw GeoJSON features
     */
    drawGeoJSON() {
        if (!this.geoJsonData || !this.isCalibrated) return;
        
        const features = this.geoJsonData.features || [this.geoJsonData];
        
        this.ctx.save();
        
        for (const feature of features) {
            this.drawGeoJSONFeature(feature);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw individual GeoJSON feature
     */
    drawGeoJSONFeature(feature) {
        const geometry = feature.geometry;
        if (!geometry) return;
        
        switch (geometry.type) {
            case 'Point':
                this.drawGeoJSONPoint(geometry.coordinates, feature.properties);
                break;
            case 'LineString':
                this.drawGeoJSONLineString(geometry.coordinates, feature.properties);
                break;
            case 'Polygon':
                this.drawGeoJSONPolygon(geometry.coordinates, feature.properties);
                break;
            case 'MultiPoint':
                geometry.coordinates.forEach(coords => 
                    this.drawGeoJSONPoint(coords, feature.properties));
                break;
            case 'MultiLineString':
                geometry.coordinates.forEach(coords => 
                    this.drawGeoJSONLineString(coords, feature.properties));
                break;
            case 'MultiPolygon':
                geometry.coordinates.forEach(coords => 
                    this.drawGeoJSONPolygon(coords, feature.properties));
                break;
        }
    }
    
    /**
     * Draw GeoJSON point
     */
    drawGeoJSONPoint(coordinates, properties) {
        const [lng, lat] = coordinates;
        const pixel = this.geoToPixel(lat, lng);
        if (!pixel) return;
        
        const screen = this.mapToScreen(pixel.x, pixel.y);
        
        this.ctx.fillStyle = properties?.color || '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(screen.x, screen.y, 5, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    /**
     * Draw GeoJSON line string
     */
    drawGeoJSONLineString(coordinates, properties) {
        if (coordinates.length < 2) return;
        
        this.ctx.strokeStyle = properties?.color || '#4ecdc4';
        this.ctx.lineWidth = properties?.weight || 2;
        this.ctx.beginPath();
        
        let first = true;
        for (const [lng, lat] of coordinates) {
            const pixel = this.geoToPixel(lat, lng);
            if (!pixel) continue;
            
            const screen = this.mapToScreen(pixel.x, pixel.y);
            
            if (first) {
                this.ctx.moveTo(screen.x, screen.y);
                first = false;
            } else {
                this.ctx.lineTo(screen.x, screen.y);
            }
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw GeoJSON polygon
     */
    drawGeoJSONPolygon(coordinates, properties) {
        if (coordinates.length === 0) return;
        
        this.ctx.fillStyle = properties?.fillColor || 'rgba(76, 205, 196, 0.3)';
        this.ctx.strokeStyle = properties?.color || '#4ecdc4';
        this.ctx.lineWidth = properties?.weight || 2;
        
        // Draw each ring (first is exterior, others are holes)
        for (let ringIndex = 0; ringIndex < coordinates.length; ringIndex++) {
            const ring = coordinates[ringIndex];
            if (ring.length < 3) continue;
            
            this.ctx.beginPath();
            let first = true;
            
            for (const [lng, lat] of ring) {
                const pixel = this.geoToPixel(lat, lng);
                if (!pixel) continue;
                
                const screen = this.mapToScreen(pixel.x, pixel.y);
                
                if (first) {
                    this.ctx.moveTo(screen.x, screen.y);
                    first = false;
                } else {
                    this.ctx.lineTo(screen.x, screen.y);
                }
            }
            
            this.ctx.closePath();
            
            if (ringIndex === 0) {
                // Exterior ring
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                // Hole - create clipping region (simplified approach)
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fill();
                this.ctx.globalCompositeOperation = 'source-over';
            }
        }
    }
    
    /**
     * Draw annotations
     */
    drawAnnotations() {
        if (!this.mapImage) return;
        
        this.ctx.save();
        
        for (const annotation of this.annotations) {
            const screen = this.mapToScreen(annotation.pixel.x, annotation.pixel.y);
            
            // Draw marker
            this.ctx.fillStyle = '#ff4757';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, 8, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw label
            this.ctx.fillStyle = '#2f3542';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(annotation.label, screen.x, screen.y - 15);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw reference points
     */
    drawReferencePoints() {
        if (!this.mapImage) return;
        
        this.ctx.save();
        
        for (let i = 0; i < this.referencePoints.length; i++) {
            const point = this.referencePoints[i];
            const screen = this.mapToScreen(point.pixel.x, point.pixel.y);
            
            // Draw marker
            this.ctx.fillStyle = '#5352ed';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw number
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((i + 1).toString(), screen.x, screen.y + 4);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw measurement points
     */
    drawMeasurementPoints() {
        if (!this.mapImage || this.measurementPoints.length === 0) return;
        
        this.ctx.save();
        
        for (let i = 0; i < this.measurementPoints.length; i++) {
            const point = this.measurementPoints[i];
            const screen = this.mapToScreen(point.x, point.y);
            
            // Draw marker
            this.ctx.fillStyle = '#ffa502';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Draw line between points
        if (this.measurementPoints.length === 2) {
            const start = this.mapToScreen(this.measurementPoints[0].x, this.measurementPoints[0].y);
            const end = this.mapToScreen(this.measurementPoints[1].x, this.measurementPoints[1].y);
            
            this.ctx.strokeStyle = '#ffa502';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Show modal
     */
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    /**
     * Hide modal
     */
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
    
    /**
     * Clear modal inputs
     */
    clearModalInputs(modalId) {
        const modal = document.getElementById(modalId);
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => input.value = '');
    }
    
    /**
     * Update status message
     */
    updateStatus(message) {
        document.getElementById('status-text').textContent = message;
    }
    
    /**
     * Update calibration status
     */
    updateCalibrationStatus() {
        const status = document.getElementById('calibration-status');
        if (this.isCalibrated) {
            status.textContent = `Calibrated (${this.referencePoints.length} points)`;
            status.classList.add('calibrated');
        } else {
            status.textContent = 'Not Calibrated';
            status.classList.remove('calibrated');
        }
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        this.updateCalibrationStatus();
    }
    
    /**
     * Export data as JSON
     */
    exportData() {
        const data = {
            annotations: this.annotations,
            referencePoints: this.referencePoints,
            measurements: this.measurements,
            metadata: {
                exportDate: new Date().toISOString(),
                isCalibrated: this.isCalibrated,
                version: '1.0'
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `gis-viewer-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.updateStatus('Data exported successfully');
    }
    
    /**
     * Clear all data
     */
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            this.annotations = [];
            this.referencePoints = [];
            this.measurements = [];
            this.geoJsonData = null;
            this.isCalibrated = false;
            this.transform = null;
            
            localStorage.removeItem(this.storageKey);
            this.updateUI();
            this.render();
            this.updateStatus('All data cleared');
        }
    }
    
    /**
     * Reset calibration
     */
    resetCalibration() {
        if (confirm('Are you sure you want to reset the calibration?')) {
            this.referencePoints = [];
            this.isCalibrated = false;
            this.transform = null;
            
            this.saveData();
            this.updateUI();
            this.render();
            this.updateStatus('Calibration reset');
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gisViewer = new GISViewer();
});
