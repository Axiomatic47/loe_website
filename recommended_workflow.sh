#!/bin/bash
# Recommended workflow for processing testimonies

echo "🚀 Laws of Existence Framework - Testimony Processing Workflow"
echo "============================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "testimonies" ]; then
    echo "❌ Please run this from the loe_site root directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo "📁 Available processors:"
echo ""

# List current processors with their purposes
echo "1. 🔍 comprehensiveImageProcessor.js  - RECOMMENDED: Complete testimony and image processing"
echo "2. 📄 processTestimoniesToCMS.ts      - Create CMS-compatible content"
echo "3. 🏛️  processTestimoniesToEvidence.ts - Create evidence collections"
echo "4. 🖼️  simpleTestimonyProcessor.js     - Basic image processing (legacy)"
echo "5. 🔧 fixedTestimonyProcessor.js      - Full processing with image handling (legacy)"
echo ""

echo "🎯 Recommended Processing Order:"
echo "================================"
echo ""

echo "STEP 1: (RECOMMENDED) Comprehensive processing - finds all images and creates collections"
echo "   node scripts/comprehensiveImageProcessor.js"
echo ""

echo "STEP 2: (Alternative) Process testimonies to CMS format"
echo "   npx tsx scripts/processTestimoniesToCMS.ts"
echo ""

echo "STEP 3: (Alternative) Create evidence collections"
echo "   npx tsx scripts/processTestimoniesToEvidence.ts"
echo ""

echo "LEGACY OPTIONS:"
echo "STEP 4: Basic image processor (for specific image-only tasks)"
echo "   node scripts/simpleTestimonyProcessor.js"
echo ""

echo "STEP 5: Full processor (older version)"
echo "   node scripts/fixedTestimonyProcessor.js"
echo ""

# Interactive menu
echo "Choose an option:"
echo "1) 🔍 Run comprehensive processor (RECOMMENDED)"
echo "2) 📄 Run CMS processor"
echo "3) 🏛️ Run evidence processor"
echo "4) 🖼️ Run simple image processor (legacy)"
echo "5) 🔧 Run full processor (legacy)"
echo "6) 🎯 Run recommended sequence (comprehensive + CMS)"
echo "7) 🔄 Run all processors in sequence"
echo "8) 📊 Just show status"
echo ""

read -p "Enter choice (1-8): " choice

case $choice in
    1)
        echo "🔍 Running comprehensive image processor (RECOMMENDED)..."
        node scripts/comprehensiveImageProcessor.js
        ;;
    2)
        echo "📄 Running CMS processor..."
        npx tsx scripts/processTestimoniesToCMS.ts
        ;;
    3)
        echo "🏛️ Running evidence processor..."
        npx tsx scripts/processTestimoniesToEvidence.ts
        ;;
    4)
        echo "🖼️ Running simple image processor (legacy)..."
        node scripts/simpleTestimonyProcessor.js
        ;;
    5)
        echo "🔧 Running full processor (legacy)..."
        node scripts/fixedTestimonyProcessor.js
        ;;
    6)
        echo "🎯 Running recommended sequence..."
        echo ""
        echo "Step 1: Comprehensive processor..."
        node scripts/comprehensiveImageProcessor.js
        echo ""
        echo "Step 2: CMS processor..."
        npx tsx scripts/processTestimoniesToCMS.ts
        ;;
    7)
        echo "🔄 Running all processors in sequence..."
        echo ""
        echo "Step 1: Comprehensive processor..."
        node scripts/comprehensiveImageProcessor.js
        echo ""
        echo "Step 2: CMS processor..."
        npx tsx scripts/processTestimoniesToCMS.ts
        echo ""
        echo "Step 3: Evidence processor..."
        npx tsx scripts/processTestimoniesToEvidence.ts
        ;;
    8)
        echo "📊 Current Status:"
        echo ""
        echo "📁 Testimony directories:"
        find testimonies -type d -maxdepth 2 2>/dev/null | wc -l | xargs echo "   Directories found:"
        ls -la testimonies/ 2>/dev/null || echo "   No testimonies directory found"
        echo ""
        echo "📄 Content files:"
        ls -la content/data/*.json 2>/dev/null | wc -l | xargs echo "   JSON files:"
        echo ""
        echo "🖼️ Uploaded images:"
        ls -1 public/uploads/data/*.{png,jpg,jpeg} 2>/dev/null | wc -l | xargs echo "   Images found:"
        echo ""
        echo "🔍 Recent processing:"
        ls -lt content/data/*.json 2>/dev/null | head -3
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Processing complete!"
echo ""
echo "📍 Next steps:"
echo "1. Check your CMS admin at /admin"
echo "2. Visit your evidence page at /composition/data"
echo "3. Restart dev server if needed: npm run dev:all"
echo ""
echo "💡 Pro tip: Use option 1 (comprehensive processor) for most tasks - it handles everything!"