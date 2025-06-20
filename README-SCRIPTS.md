# YelpCamp Scripts Guide

## Available Commands

### 🚀 **Production Commands**

```bash
# Start the application (recommended for normal use)
npm start
```
- Starts the YelpCamp server on port 3000
- **Does NOT seed the database**
- Uses your existing 500 campgrounds
- Perfect for daily development and testing

### 🌱 **Database Management**

```bash
# Seed the database only (when you want to refresh data)
npm run seed
```
- Deletes all existing campgrounds
- Generates 500 new campgrounds with unique descriptions and pricing
- **Does NOT start the app** - run `npm start` afterwards
- Use this when you want fresh data or test new seeding features

```bash
# Full setup (seed + start app)
npm run setup
```
- Seeds the database AND starts the app
- Equivalent to the old behavior
- Use for initial setup or when you want completely fresh data

### 🔧 **Development Commands**

```bash
# Development mode with auto-restart
npm run dev
```
- Starts the app with nodemon
- Automatically restarts when you make code changes
- **Does NOT seed** - perfect for development
- Great for working on features without losing your data

## Why the Change?

**Before**: `npm start` would:
1. Delete all 500 campgrounds ⏱️ (~2 minutes)
2. Regenerate 500 new campgrounds ⏱️ (~2 minutes) 
3. Start the app ✅

**Now**: `npm start` simply:
1. Start the app ✅ (~2 seconds)

## Typical Workflow

```bash
# Daily development
npm start              # Quick app startup

# When you want fresh data
npm run seed           # Generate new campgrounds
npm start              # Start the app

# Development with auto-reload
npm run dev            # Start with nodemon

# First time setup
npm run setup          # Seed + start together
```

## Current Status
✅ **500 Campgrounds**: Already in your database  
✅ **Unique Descriptions**: Each campground has contextual descriptions  
✅ **Dynamic Pricing**: Realistic pricing based on location and features  
✅ **Fast Startup**: App starts in seconds, not minutes 