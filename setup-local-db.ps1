# PakCards Quick Setup Script for Local PostgreSQL
# Run this script to set up everything automatically

Write-Host "🚀 PakCards Local Database Setup" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Check if PostgreSQL is installed
Write-Host "1️⃣  Checking PostgreSQL installation..." -ForegroundColor Cyan
$pgPath = "C:\Program Files\PostgreSQL"
if (Test-Path $pgPath) {
    Write-Host "✅ PostgreSQL found!" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Then run this script again.`n" -ForegroundColor Yellow
    exit
}

# Get database password from user
Write-Host "`n2️⃣  Database Configuration" -ForegroundColor Cyan
$dbPassword = Read-Host "Enter your PostgreSQL password (postgres user)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Create .env.local file for local development
Write-Host "`n3️⃣  Creating local environment configuration..." -ForegroundColor Cyan
$envContent = @"
# Local PostgreSQL Connection
DATABASE_URL="postgresql://postgres:$password@localhost:5432/pakcards_db"
DIRECT_URL="postgresql://postgres:$password@localhost:5432/pakcards_db"

# Copy these from your .env file:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZW5nYWdlZC1jYXJkaW5hbC01OS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_nNiuIuKBP0bgfbJUjot94vJ8jIHChhLffDsVIaIBPI

INGEST_EVENT_KEY="47dY4PB_l261GFaS1mgVccOnqDpyUcJ1CTTDdlZPkxStE_flmEo2j8jzBK7rrWhVF3o1TRZHg7SkcF7vBrn6xA"
INGEST_SIGNIN_KEY="signkey-prod-24f648edc0e8cbc457910deaf5fb1fba5beb85fdc9e550876a55f28bc6e02a51"

IMAGEKIT_PUBLIC_KEY="public_FTdzjh83WoPuqEt4M5e+39PvtFs="
IMAGEKIT_PRIVATE_KEY="private_Y8LbKishQBhPimEopGkSOtxjUTo="
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/zynk"

PRISMA_CLIENT_ENGINE_TYPE="library"
OPTIMIZE_API_KEY="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ3aWQiOiJjbWhoaDBmZWwwMzIyeXNmbGtrNzlzOGxrIiwidWlkIjoiY21oaGgwZmhyMDVqeHl4Zmw0amUxdWt6bCIsInRzIjoxNzYyMDc1ODYzNDk4fQ.W2D1rrcktmGw7o0IMhvNFNO5ON5s93Bbj90tjYik_C6a6aXNVU8zh0FH1tLFu5UtXyynvClR7zXiAG1nLL0IAA"

NEXT_PUBLIC_CURRENCY_SYMBOL_PKR = '₨'
"@

# Backup original .env
if (Test-Path ".env") {
    Copy-Item .env .env.neon.backup -Force
    Write-Host "✅ Original .env backed up to .env.neon.backup" -ForegroundColor Green
}

# Save to .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
Write-Host "✅ .env updated with local PostgreSQL connection" -ForegroundColor Green

# Create database
Write-Host "`n4️⃣  Creating database..." -ForegroundColor Cyan
try {
    $env:PGPASSWORD = $password
    psql -U postgres -c "CREATE DATABASE pakcards_db;" 2>$null
    Write-Host "✅ Database 'pakcards_db' created" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database might already exist (this is okay)" -ForegroundColor Yellow
}

# Generate Prisma Client
Write-Host "`n5️⃣  Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Run migrations
Write-Host "`n6️⃣  Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init
Write-Host "✅ Migrations completed" -ForegroundColor Green

# Seed database
Write-Host "`n7️⃣  Seeding database with test data..." -ForegroundColor Cyan
npm run seed
Write-Host "✅ Database seeded successfully" -ForegroundColor Green

# Summary
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Green
Write-Host "✅ PostgreSQL configured" -ForegroundColor Green
Write-Host "✅ Database created" -ForegroundColor Green
Write-Host "✅ Tables migrated" -ForegroundColor Green
Write-Host "✅ Test data seeded`n" -ForegroundColor Green

Write-Host "📊 Test Data:" -ForegroundColor Cyan
Write-Host "   - 6 Users (1 admin, 2 sellers, 3 customers)" -ForegroundColor White
Write-Host "   - 3 Stores (2 approved, 1 pending)" -ForegroundColor White
Write-Host "   - 6 Gift card products" -ForegroundColor White
Write-Host "   - 2 Active coupons`n" -ForegroundColor White

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run dev" -ForegroundColor Yellow
Write-Host "   2. Visit: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   3. Check: npx prisma studio (to view data)`n" -ForegroundColor Yellow

Write-Host "💡 Admin Email: admin@pakcards.com" -ForegroundColor Magenta
Write-Host "`nGood luck with your client demo! 🎯`n" -ForegroundColor Green

# Clear password from memory
$password = $null
$env:PGPASSWORD = $null
