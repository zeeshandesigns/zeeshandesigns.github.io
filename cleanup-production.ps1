# PakCards Project Cleanup Script
# This script removes all development and test files for production deployment
# Run with: .\cleanup-production.ps1

Write-Host "🧹 PakCards Production Cleanup Script" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Get confirmation
Write-Host "⚠️  WARNING: This will delete development files!" -ForegroundColor Yellow
Write-Host "Files will be moved to 'cleanup-backup' folder first.`n" -ForegroundColor Yellow
$confirmation = Read-Host "Continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "`n❌ Cleanup cancelled." -ForegroundColor Red
    exit
}

Write-Host "`n✅ Starting cleanup...`n" -ForegroundColor Green

# Create backup directory
Write-Host "📁 Creating backup directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path ".\cleanup-backup" -Force | Out-Null

# Backup files before deletion
Write-Host "💾 Backing up files to cleanup-backup folder...`n" -ForegroundColor Cyan

# Function to safely move file if it exists
function Safe-Move {
    param($Path, $Destination)
    if (Test-Path $Path) {
        try {
            Move-Item $Path $Destination -Force -ErrorAction Stop
            Write-Host "  ✓ Moved: $Path" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  ✗ Failed to move: $Path" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  ⊘ Not found: $Path" -ForegroundColor Gray
        return $false
    }
}

# Counter for tracking
$movedCount = 0

Write-Host "`n1️⃣  Cleaning root directory test scripts..." -ForegroundColor Yellow
$movedCount += Safe-Move ".\clear-orders.js" ".\cleanup-backup\"
$movedCount += Safe-Move ".\test-env.js" ".\cleanup-backup\"
$movedCount += Safe-Move ".\test-product-apis.js" ".\cleanup-backup\"
$movedCount += Safe-Move ".\proxy.ts" ".\cleanup-backup\"
$movedCount += Safe-Move ".\setup-local-db.ps1" ".\cleanup-backup\"

Write-Host "`n2️⃣  Cleaning Prisma test files..." -ForegroundColor Yellow
$movedCount += Safe-Move ".\prisma\test-schema.js" ".\cleanup-backup\"
$movedCount += Safe-Move ".\prisma\test-optimize.js" ".\cleanup-backup\"
$movedCount += Safe-Move ".\prisma\seed.js.backup" ".\cleanup-backup\"
$movedCount += Safe-Move ".\prisma\seed_clean.js" ".\cleanup-backup\"
$movedCount += Safe-Move ".\prisma\set-admin.js" ".\cleanup-backup\"

Write-Host "`n3️⃣  Cleaning scripts directory..." -ForegroundColor Yellow
if (Test-Path ".\scripts") {
    try {
        Move-Item ".\scripts" ".\cleanup-backup\scripts" -Force
        Write-Host "  ✓ Moved: scripts directory" -ForegroundColor Green
        $movedCount++
    } catch {
        Write-Host "  ✗ Failed to move scripts directory" -ForegroundColor Red
    }
} else {
    Write-Host "  ⊘ Scripts directory not found" -ForegroundColor Gray
}

Write-Host "`n4️⃣  Cleaning redundant root documentation..." -ForegroundColor Yellow
$movedCount += Safe-Move ".\CODE_OF_CONDUCT.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\CUSTOMER_MANAGEMENT.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\ORDER_MANAGEMENT_GUIDE.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\ORDER_SYSTEM_COMPLETE.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\WARNINGS_FIXED.md" ".\cleanup-backup\"

Write-Host "`n5️⃣  Cleaning development documentation..." -ForegroundColor Yellow
$movedCount += Safe-Move ".\docs\AUDIT_SUMMARY.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\CLIENT_DEMO_READY.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\CODE_UPDATES_COMPLETE.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\DATABASE_MIGRATION.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\MIGRATION_INSTRUCTIONS.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\PRE_PRODUCTION_ACTIONS.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\PRODUCTION_SECURITY_AUDIT.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\REFACTORING_SUMMARY.md" ".\cleanup-backup\"
$movedCount += Safe-Move ".\docs\SINGLE_PRODUCT_UPDATE.md" ".\cleanup-backup\"

Write-Host "`n6️⃣  Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path ".\.next") {
    try {
        Remove-Item ".\.next" -Recurse -Force
        Write-Host "  ✓ Removed: .next directory (will be regenerated)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not remove .next (may be in use)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⊘ .next directory not found" -ForegroundColor Gray
}

# Summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "="*50 -ForegroundColor Cyan

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Files moved to backup: $movedCount" -ForegroundColor White
Write-Host "  • Backup location: .\cleanup-backup\" -ForegroundColor White

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review files in cleanup-backup folder" -ForegroundColor White
Write-Host "  2. Run 'npm run build' to verify everything works" -ForegroundColor White
Write-Host "  3. If build succeeds, you can delete cleanup-backup folder" -ForegroundColor White
Write-Host "  4. Commit changes to git" -ForegroundColor White
Write-Host "  5. Deploy to production" -ForegroundColor White

Write-Host "`n⚠️  Files Kept (Essential):" -ForegroundColor Yellow
Write-Host "  ✓ app/ - All application code" -ForegroundColor Green
Write-Host "  ✓ components/ - All components" -ForegroundColor Green
Write-Host "  ✓ lib/ - All utilities" -ForegroundColor Green
Write-Host "  ✓ prisma/schema.prisma - Database schema" -ForegroundColor Green
Write-Host "  ✓ prisma/migrations/ - Migration history" -ForegroundColor Green
Write-Host "  ✓ prisma/seed_with_categories_regions.js - Production seed" -ForegroundColor Green
Write-Host "  ✓ configs/ - Configuration files" -ForegroundColor Green
Write-Host "  ✓ package.json - Dependencies" -ForegroundColor Green
Write-Host "  ✓ README.md - Main documentation" -ForegroundColor Green

Write-Host "`n🧪 Test Build:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White

Write-Host "`n"
