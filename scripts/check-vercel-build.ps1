# PowerShell script to check latest Vercel deployment and save logs locally
# Usage: .\scripts\check-vercel-build.ps1

Write-Host "🔍 Checking latest Vercel deployment..." -ForegroundColor Cyan

# Get latest deployment
try {
    $deployments = vercel ls --json | ConvertFrom-Json
    if ($deployments -and $deployments.Count -gt 0) {
        $latest = $deployments[0]
        Write-Host "📦 Latest deployment: $($latest.url)" -ForegroundColor Green
        
        # Get logs
        Write-Host "📥 Fetching logs..." -ForegroundColor Cyan
        vercel logs $latest.url > vercel-build-logs.txt 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Trying alternative method..." -ForegroundColor Yellow
            vercel inspect $latest.url --logs > vercel-build-logs.txt 2>&1
        }
        
        # Extract errors
        Write-Host "🔎 Extracting errors..." -ForegroundColor Cyan
        Select-String -Pattern "Type error|error TS|Failed to compile|Failed to build" -Path vercel-build-logs.txt -ErrorAction SilentlyContinue | 
            Select-Object -First 20 | 
            Out-File BUILD_ERRORS.txt
        
        if (-not (Test-Path BUILD_ERRORS.txt) -or (Get-Item BUILD_ERRORS.txt).Length -eq 0) {
            Write-Host "✅ No build errors found in logs" -ForegroundColor Green
            "✅ Build successful" | Out-File BUILD_ERRORS.txt
        }
        
        Write-Host "✅ Logs saved to vercel-build-logs.txt" -ForegroundColor Green
        Write-Host "✅ Errors saved to BUILD_ERRORS.txt" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Latest errors:" -ForegroundColor Cyan
        Get-Content BUILD_ERRORS.txt -Head 20
    } else {
        Write-Host "⚠️  No deployments found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Make sure you're logged in: vercel login" -ForegroundColor Yellow
    exit 1
}

