# How to Upload GIS Viewer to GitHub

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button in the top-right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `gis-viewer` (or any name you prefer)
   - **Description**: "Interactive web-based GIS viewer with coordinate system support"
   - **Visibility**: Public (recommended) or Private
   - Do not check "Add a README file" (there is already one in the project)
   - Do not add .gitignore or license (these are included)
5. Click **"Create repository"**

## Step 2: Copy Repository URL

After creating the repository, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/gis-viewer.git
```

Copy this URL!

## Step 3: Push Your Code

Open a terminal in this project folder and run these commands:

### Option A: If this is a new repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/gis-viewer.git
git branch -M main
git push -u origin main
```

### Option B: If you already have a repository
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/gis-viewer.git
git push -u origin master
```

## Step 4: Verify Upload

1. Go to your GitHub repository page
2. You should see all the project files
3. Click on the README.md to see the documentation
4. Your GIS Viewer is now publicly available!

## Step 5: Enable GitHub Pages (Optional)

To host your GIS Viewer for free on GitHub:

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under "Source", select **"Deploy from a branch"**
5. Choose **"main"** branch (or "master") and **"/ (root)"**
6. Click **"Save"**
7. Your site will be available at: `https://haijunsu-osu.github.io/gis-viewer`

## Current Project Files


Project files:
- index.html - Main GIS Viewer application
- gis-viewer.js - Core JavaScript functionality
- styles.css - Responsive styling
- README.md - Documentation
- demo.html - Feature demonstration page
- sample-data.geojson - Test GeoJSON data
- package.json - Project configuration
- .gitignore - Git ignore rules

## Repository Description Suggestions


Suggested repository description:

Web-based GIS viewer for loading map images, calibrating coordinates, adding annotations, measuring distances, and overlaying GeoJSON data. Built with HTML5, CSS3, and JavaScript for modern browsers.

## Tags/Topics to Add


Recommended topics/tags for your repository:
- gis
- mapping
- geospatial
- javascript
- canvas
- coordinates
- geojson
- web-gis
- cartography
- visualization

---


Note: Replace YOUR_USERNAME with your actual GitHub username in all URLs and commands above.
