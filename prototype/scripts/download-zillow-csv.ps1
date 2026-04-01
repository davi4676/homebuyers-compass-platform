# PowerShell Script to Download Zillow CSV Files
# Run this script from the project root directory

Write-Host "Downloading Zillow ZHVI CSV files..." -ForegroundColor Cyan

# Create data directory if it doesn't exist
$dataDir = Join-Path $PSScriptRoot ".." "data" "zillow"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "Created directory: $dataDir" -ForegroundColor Green
}

# Zillow CSV file URLs
$metroUrl = "https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
$zipUrl = "https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

# File names
$metroFile = Join-Path $dataDir "Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
$zipFile = Join-Path $dataDir "Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

# Download Metro CSV
Write-Host "`nDownloading Metro CSV file..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $metroUrl -OutFile $metroFile -UseBasicParsing
    $metroSize = (Get-Item $metroFile).Length / 1MB
    Write-Host "✓ Metro CSV downloaded: $metroFile ($([math]::Round($metroSize, 2)) MB)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error downloading Metro CSV: $_" -ForegroundColor Red
    exit 1
}

# Download Zip CSV
Write-Host "`nDownloading Zip CSV file..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipFile -UseBasicParsing
    $zipSize = (Get-Item $zipFile).Length / 1MB
    Write-Host "✓ Zip CSV downloaded: $zipFile ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error downloading Zip CSV: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ All CSV files downloaded successfully!" -ForegroundColor Green
Write-Host "Files saved to: $dataDir" -ForegroundColor Cyan
Write-Host "`nNote: The app currently fetches these files automatically from URLs." -ForegroundColor Yellow
Write-Host "These local files can be used as fallback or for testing purposes." -ForegroundColor Yellow
