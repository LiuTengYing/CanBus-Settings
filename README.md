# CanBus Settings for Flarum

A Flarum extension for managing vehicle CanBus configurations. This extension provides an intuitive interface for organizing and managing vehicle brands, models, years, and related CanBus configuration information.

## Features

### 1. Vehicle Database Management
- Brand Management: Add, edit, and delete vehicle manufacturers
- Model Management: Add specific models for each brand
- Year Management: Specify year ranges for each model
- Configuration Management: Add specific CanBus configurations for each year
- Resource Management: Add related documentation and resource links

### 2. Hierarchical Navigation System
- Intuitive hierarchical navigation interface
- Quick switching between different configuration levels
- Clear hierarchical structure display

### 3. User Interface
- Responsive design for all screen sizes
- Intuitive icon navigation
- User-friendly prompts and help information

### 4. Data Management
- Real-time settings saving
- Local cache support
- Error handling and recovery mechanism

## Installation

1. Install via Composer:
```bash
composer require ltydi/canbus-settings:"^1.0.0"
```

2. Enable the extension in Flarum admin panel

## Usage

### 1. Basic Settings
1. Go to Flarum admin panel
2. Find "CanBus Settings" option
3. Set welcome message (optional)

### 2. Manage Vehicle Data
1. Add Brand
   - Click "Add New Brand" button
   - Enter brand name
   - Click save

2. Add Model
   - Click the arrow icon next to the brand
   - Add specific models under the brand

3. Add Year
   - Click the arrow icon next to the model
   - Add year ranges for the model

4. Add Configuration
   - Click the arrow icon next to the year
   - Add specific CanBus configuration information

5. Add Resources
   - Click the arrow icon next to the configuration
   - Add related documentation and resource links

### 3. Edit and Delete
- Use edit icon to modify existing entries
- Use delete icon to remove unwanted entries


### Data Storage
- Uses Flarum's database system
- Supports local caching
- Includes error recovery


