#!/usr/bin/env pwsh
# Run brand captures for CLO-39 cards in priority order

$ErrorActionPreference = 'SilentlyContinue'

# Load card data
$cards = Get-Content CLO-39-cards.json | ConvertFrom-Json

# Separate priority (email) and non-priority (FB-only) cards
$priority = $cards | Where-Object { $_.priority }
$nonPriority = $cards | Where-Object { -not $_.priority }

# Combine with priority first
$allCards = @($priority) + @($nonPriority)

$results = @{
    ready = @()
    palettePending = @()
    noAssets = @()
    errors = @()
}

$processed = 0
Write-Host "CLO-39 Brand Capture Sweep"
Write-Host "==========================`n"
Write-Host "Processing $($allCards.Count) cards (priority emails first)`n"

foreach ($card in $allCards) {
    $processed++
    $slug = $card.slug
    $name = $card.name

    # Build capture command
    $args = @('tools/brand-capture/capture.mjs', '--slug', $slug, '--out', "./$slug/brand")
    if ($card.site) { $args += @('--site', $card.site) }
    if ($card.facebook) { $args += @('--facebook', $card.facebook) }

    Write-Host "[$processed/$($allCards.Count)] $slug..." -NoNewline

    try {
        # Run capture and capture JSON output
        $output = & node $args 2>$null
        $exitCode = $LASTEXITCODE

        if ($exitCode -eq 0 -or $exitCode -eq 1) {
            # Parse the brand.json from the output
            $brandJson = $output | ConvertFrom-Json -ErrorAction Stop

            if ($brandJson.ready) {
                $results.ready += @{
                    slug = $slug
                    name = $name
                    logo = $brandJson.logo.file
                    colors = $brandJson.colors.brand.Count
                }
                Write-Host " ✓ READY" -ForegroundColor Green
            } elseif ($brandJson.blockedBy -eq 'palette-pending') {
                $results.palettePending += @{
                    slug = $slug
                    name = $name
                    logo = $brandJson.logo.file
                }
                Write-Host " ⚠ palette-pending" -ForegroundColor Yellow
            } elseif ($brandJson.blockedBy -eq 'no-assets') {
                $results.noAssets += @{
                    slug = $slug
                    name = $name
                }
                Write-Host " ✗ no-assets" -ForegroundColor Red
            }
        } else {
            throw "Unexpected exit code: $exitCode"
        }
    } catch {
        $results.errors += @{
            slug = $slug
            error = $_.Exception.Message
        }
        Write-Host " ✗ ERROR" -ForegroundColor Red
    }
}

# Print summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Ready to build: $($results.ready.Count)" -ForegroundColor Green
foreach ($r in $results.ready) {
    Write-Host "  • $($r.slug) ($($r.colors) colors)"
}

Write-Host "`nPalette pending (vision-read): $($results.palettePending.Count)" -ForegroundColor Yellow
foreach ($r in $results.palettePending) {
    Write-Host "  • $($r.slug) (logo: $($r.logo))"
}

Write-Host "`nNo assets (BRAND BLOCKED): $($results.noAssets.Count)" -ForegroundColor Red
foreach ($r in $results.noAssets) {
    Write-Host "  • $($r.slug)"
}

if ($results.errors.Count -gt 0) {
    Write-Host "`nErrors: $($results.errors.Count)" -ForegroundColor Red
}

# Save results
$results | ConvertTo-Json | Set-Content CLO-39-capture-results.json -Encoding UTF8
Write-Host "`nResults saved to CLO-39-capture-results.json"
