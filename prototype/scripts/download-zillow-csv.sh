#!/bin/bash
# Bash Script to Download Zillow CSV Files
# Run this script from the project root directory

echo "Downloading Zillow ZHVI CSV files..."

# Create data directory if it doesn't exist
DATA_DIR="$(dirname "$0")/../data/zillow"
mkdir -p "$DATA_DIR"

# Zillow CSV file URLs
METRO_URL="https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
ZIP_URL="https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

# File names
METRO_FILE="$DATA_DIR/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
ZIP_FILE="$DATA_DIR/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

# Download Metro CSV
echo ""
echo "Downloading Metro CSV file..."
if curl -f -o "$METRO_FILE" "$METRO_URL"; then
    METRO_SIZE=$(du -h "$METRO_FILE" | cut -f1)
    echo "✓ Metro CSV downloaded: $METRO_FILE ($METRO_SIZE)"
else
    echo "✗ Error downloading Metro CSV"
    exit 1
fi

# Download Zip CSV
echo ""
echo "Downloading Zip CSV file..."
if curl -f -o "$ZIP_FILE" "$ZIP_URL"; then
    ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
    echo "✓ Zip CSV downloaded: $ZIP_FILE ($ZIP_SIZE)"
else
    echo "✗ Error downloading Zip CSV"
    exit 1
fi

echo ""
echo "✓ All CSV files downloaded successfully!"
echo "Files saved to: $DATA_DIR"
echo ""
echo "Note: The app currently fetches these files automatically from URLs."
echo "These local files can be used as fallback or for testing purposes."
