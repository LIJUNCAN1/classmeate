Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\vfolk\.gemini\antigravity\brain\f52998cd-0077-448f-88ff-ff9e1d73cd2e\.user_uploaded\media_1792649925634_723f266b.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)

function Resize-And-Save-Png($sourceImg, $destPath, $width, $height) {
    $destBitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($sourceImg, 0, 0, $width, $height)
    
    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    Write-Output "Saved: $destPath ($width x $height)"
}

$densities = @{
    "mipmap-mdpi" = @{ launcher = 48; fg = 108 }
    "mipmap-hdpi" = @{ launcher = 72; fg = 162 }
    "mipmap-xhdpi" = @{ launcher = 96; fg = 216 }
    "mipmap-xxhdpi" = @{ launcher = 144; fg = 324 }
    "mipmap-xxxhdpi" = @{ launcher = 192; fg = 432 }
}

foreach ($d in $densities.Keys) {
    $folder = "D:\classmeate\android\app\src\main\res\$d"
    $lSize = $densities[$d].launcher
    $fgSize = $densities[$d].fg
    
    # Remove old webp files to avoid duplicates
    Remove-Item "$folder\ic_launcher.webp" -ErrorAction SilentlyContinue
    Remove-Item "$folder\ic_launcher_round.webp" -ErrorAction SilentlyContinue
    Remove-Item "$folder\ic_launcher_foreground.webp" -ErrorAction SilentlyContinue
    
    # Save as PNG
    Resize-And-Save-Png $img "$folder\ic_launcher.png" $lSize $lSize
    Resize-And-Save-Png $img "$folder\ic_launcher_round.png" $lSize $lSize
    Resize-And-Save-Png $img "$folder\ic_launcher_foreground.png" $fgSize $fgSize
}

$img.Dispose()
Write-Output "Mipmap icons updated successfully!"
