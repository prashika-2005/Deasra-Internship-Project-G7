Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\hp\.gemini\antigravity\brain\0a7c4619-d5f8-4833-89c3-2bdb8f95ef29\cutout_scratch_frame_1786541102481.jpg"
$destPath = "C:\Users\hp\.gemini\antigravity\scratch\escape-room-entrepreneur\assets\standing_scratch_frame.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        $brightness = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        if ($brightness -lt 16) {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($brightness -lt 36) {
            $alpha = [int](($brightness - 16) / 20.0 * 255)
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        } else {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
    }
}

$bmp.Dispose()
$outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Write-Host "Cutout Frame PNG successfully written to $destPath"
