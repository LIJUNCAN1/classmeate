Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\vfolk\.gemini\antigravity\brain\f52998cd-0077-448f-88ff-ff9e1d73cd2e\.user_uploaded\media_1792650348068_db186f58.png"
$sourceImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Proportional-Center($src, $destPath, $targetWidth, $targetHeight) {
    $destBitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $scaleW = $targetWidth / $src.Width
    $scaleH = $targetHeight / $src.Height
    $scale = [Math]::Min($scaleW, $scaleH)

    $drawW = [int]($src.Width * $scale)
    $drawH = [int]($src.Height * $scale)
    $drawX = [int](($targetWidth - $drawW) / 2)
    $drawY = [int](($targetHeight - $drawH) / 2)

    $graphics.DrawImage($src, $drawX, $drawY, $drawW, $drawH)

    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    Write-Output "Saved: $destPath ($targetWidth x $targetHeight)"
}

# 1. Update React Native splash assets
Resize-Proportional-Center $sourceImg "D:\classmeate\assets\splash-monster.png" 512 512
Resize-Proportional-Center $sourceImg "D:\classmeate\assets\splash-icon.png" 512 512

# 2. Update Android native splash screens
$splashSizes = @{
    "drawable-mdpi" = 288
    "drawable-hdpi" = 432
    "drawable-xhdpi" = 576
    "drawable-xxhdpi" = 864
    "drawable-xxxhdpi" = 1152
}

foreach ($d in $splashSizes.Keys) {
    $size = $splashSizes[$d]
    $dest = "D:\classmeate\android\app\src\main\res\$d\splashscreen_logo.png"
    Resize-Proportional-Center $sourceImg $dest $size $size
}

$sourceImg.Dispose()
Write-Output "All splash screen images updated successfully!"
