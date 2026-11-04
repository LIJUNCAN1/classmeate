Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\vfolk\.gemini\antigravity\brain\f52998cd-0077-448f-88ff-ff9e1d73cd2e\.user_uploaded\media_1793772931757_73ba7928.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source image loaded: $($srcImg.Width) x $($srcImg.Height)"

function Resize-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$CanvasWidth,
        [int]$CanvasHeight,
        [int]$DrawWidth,
        [int]$DrawHeight,
        [string]$OutputPath,
        [System.Drawing.Color]$BgColor = [System.Drawing.Color]::Transparent
    )

    $bmp = New-Object System.Drawing.Bitmap($CanvasWidth, $CanvasHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($BgColor -ne [System.Drawing.Color]::Transparent) {
        $g.Clear($BgColor)
    } else {
        $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    }

    $offsetX = [int](($CanvasWidth - $DrawWidth) / 2)
    $offsetY = [int](($CanvasHeight - $DrawHeight) / 2)

    $rect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $DrawWidth, $DrawHeight)
    $g.DrawImage($Image, $rect)

    $parentDir = Split-Path $OutputPath -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $OutputPath ($CanvasWidth x $CanvasHeight)"
}

# 1. Update Assets
Resize-Image -Image $srcImg -CanvasWidth 1024 -CanvasHeight 1024 -DrawWidth 1024 -DrawHeight 1024 -OutputPath "assets/icon.png"
Resize-Image -Image $srcImg -CanvasWidth 1024 -CanvasHeight 1024 -DrawWidth 1024 -DrawHeight 1024 -OutputPath "assets/splash-monster.png"
Resize-Image -Image $srcImg -CanvasWidth 1024 -CanvasHeight 1024 -DrawWidth 1024 -DrawHeight 1024 -OutputPath "assets/dancing-monster.png"
Resize-Image -Image $srcImg -CanvasWidth 1024 -CanvasHeight 1024 -DrawWidth 1024 -DrawHeight 1024 -OutputPath "assets/splash-icon.png"

# Adaptive foreground needs safe zone padding (~72% of canvas)
Resize-Image -Image $srcImg -CanvasWidth 1024 -CanvasHeight 1024 -DrawWidth 736 -DrawHeight 736 -OutputPath "assets/android-icon-foreground.png"

# 2. Update Android mipmaps
$densities = @(
    @{ name = "mipmap-mdpi";    launcher = 48;  fg = 108; fgDraw = 76 },
    @{ name = "mipmap-hdpi";    launcher = 72;  fg = 162; fgDraw = 116 },
    @{ name = "mipmap-xhdpi";   launcher = 96;  fg = 216; fgDraw = 154 },
    @{ name = "mipmap-xxhdpi";  launcher = 144; fg = 324; fgDraw = 232 },
    @{ name = "mipmap-xxxhdpi"; launcher = 192; fg = 432; fgDraw = 310 }
)

foreach ($d in $densities) {
    $dir = "android/app/src/main/res/$($d.name)"
    Resize-Image -Image $srcImg -CanvasWidth $d.launcher -CanvasHeight $d.launcher -DrawWidth $d.launcher -DrawHeight $d.launcher -OutputPath "$dir/ic_launcher.png"
    Resize-Image -Image $srcImg -CanvasWidth $d.launcher -CanvasHeight $d.launcher -DrawWidth $d.launcher -DrawHeight $d.launcher -OutputPath "$dir/ic_launcher_round.png"
    Resize-Image -Image $srcImg -CanvasWidth $d.fg -CanvasHeight $d.fg -DrawWidth $d.fgDraw -DrawHeight $d.fgDraw -OutputPath "$dir/ic_launcher_foreground.png"
}

$srcImg.Dispose()
Write-Host "All icons generated successfully!"
