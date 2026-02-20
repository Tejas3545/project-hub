# Fix markdown linting issues in SCRAPING_GUIDE.md
$content = Get-Content "SCRAPING_GUIDE.md" -Raw

# Remove trailing colons from headings  
$content = $content -replace '###\s+([^:\n]+):', '### $1'

# Remove trailing spaces
$content = $content -replace '\s+\n', "`n"

# Add blank line after headings that are immediately followed by lists
$content = $content -replace '(###[^\n]+)\n(\d+\.|-)', '$1' + "`n`n" + '$2'

# Add blank line before code blocks
$content = $content -replace '([^\n])\n```', '$1' + "`n`n" + '```'

# Add blank line after code blocks
$content = $content -replace '```\n([^\n])', '```' + "`n`n" + '$1'

# Add language to code blocks without one
$content = $content -replace '```\n((?!bash|typescript|text)[^\n]*\n)', '```text' + "`n" + '$1'

# Output fixed content
$content | Set-Content "SCRAPING_GUIDE_FIXED.md" -NoNewline
Write-Host "Fixed markdown saved to SCRAPING_GUIDE_FIXED.md"
