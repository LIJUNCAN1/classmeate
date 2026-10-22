Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\vfolk\.gemini\antigravity\brain\f52998cd-0077-448f-88ff-ff9e1d73cd2e\.user_uploaded\media_1792649925634_723f266b.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)
Write-Output "Image loaded successfully: $($img.Width) x $($img.Height)"

function Resize-And-Save($sourceImg, $destPath, $width, $height) {
    $destBitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($sourceImg, 0, 0, $width, $height)
    
    $extension = [System.IO.Path]::GetExtension($destPath).ToLower()
    if ($extension -eq ".png") {
        $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } elseif ($extension -eq ".jpg" -or $extension -eq ".jpeg") {
        $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    } else {
        $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    
    $graphics.Dispose()
    $destBitmap.Dispose()
    Write-Output "Saved: $destPath ($width x $height)"
}

# Update assets
Resize-And-Save $img "D:\classmeate\assets\icon.png" 1024 1024
Resize-And-Save $img "D:\classmeate\assets\android-icon-foreground.png" 432 432
Resize-And-Save $img "D:\classmeate\assets\favicon.png" 48 48
Resize-And-Save $img "D:\classmeate\assets\splash-icon.png" 512 512
Resize-And-Save $img "D:\classmeate\assets\splash-monster.png" 512 512

$img.Dispose()
Write-Output "All asset icons updated!"
