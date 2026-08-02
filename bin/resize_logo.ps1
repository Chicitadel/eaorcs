Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Professional\Downloads\eaorcs_logo.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Loaded original logo: $($srcImage.Width) x $($srcImage.Height)"

$targetDirs = @(
    "d:\ujomor-platform\products\eaorcs\assets\branding",
    "d:\ujomor-platform\products\eaorcs\docs\assets",
    "d:\ujomor-platform\products\eaorcs\current\assets"
)

foreach ($dir in $targetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

# Function to resize and save
function Resize-Image ($img, $width, $height, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $graph.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bmp.Dispose()
    Write-Host "Created resized logo: $outPath ($width x $height)"
}

# 1. Copy original to branding, docs, current
Copy-Item -Path $srcPath -Destination "d:\ujomor-platform\products\eaorcs\assets\branding\eaorcs_logo.png" -Force
Copy-Item -Path $srcPath -Destination "d:\ujomor-platform\products\eaorcs\docs\assets\eaorcs_logo.png" -Force
Copy-Item -Path $srcPath -Destination "d:\ujomor-platform\products\eaorcs\current\assets\eaorcs_logo.png" -Force

# 2. Generate resized variants
$sizes = @(512, 256, 128, 64, 32, 16)
foreach ($size in $sizes) {
    Resize-Image $srcImage $size $size "d:\ujomor-platform\products\eaorcs\assets\branding\eaorcs_logo_$size.png"
    Resize-Image $srcImage $size $size "d:\ujomor-platform\products\eaorcs\docs\assets\eaorcs_logo_$size.png"
    Resize-Image $srcImage $size $size "d:\ujomor-platform\products\eaorcs\current\assets\eaorcs_logo_$size.png"
}

$srcImage.Dispose()
Write-Host "Logo resizing complete across all asset target directories."
