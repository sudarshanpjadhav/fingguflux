param(
    [Parameter(Mandatory=$true)]
    [string]$OTP
)

$ErrorActionPreference = "Stop"
$root = "c:\Users\pc\Desktop\finggu\FingguFlux"

$packages = @(
    "$root\packages\core",
    "$root\packages\motion",
    "$root\packages\js-helper",
    "$root\packages\compiler",
    "$root\packages\adapters\react",
    "$root\packages\adapters\vue",
    "$root\packages\adapters\svelte"
)

foreach ($pkg in $packages) {
    $pkgName = (Get-Content "$pkg\package.json" | ConvertFrom-Json).name
    $pkgVer  = (Get-Content "$pkg\package.json" | ConvertFrom-Json).version
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  📦  Publishing $pkgName@$pkgVer ..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

    Push-Location $pkg
    try {
        $result = npm publish --access public --otp $OTP 2>&1
        Write-Host $result
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ FAILED: $pkgName" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Write-Host "✅ Published: $pkgName@$pkgVer" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  🚀  All 7 packages published for v0.9.6!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
