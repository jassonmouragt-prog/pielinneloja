Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Jasson Moura\Documents\pielinneloja\Imagens\logo (preta).png"
$dst = "C:\Users\Jasson Moura\Documents\pielinneloja\Imagens\logo (branca).png"

$bmp = New-Object System.Drawing.Bitmap($src)

$rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $bmp.Height)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

$minDark = 255
$maxDark = 0
for ($y = 0; $y -lt $bmp.Height; $y++) {
  for ($x = 0; $x -lt $bmp.Width; $x++) {
    $i = $y * $stride + $x * 4
    $b = $bytes[$i]; $g = $bytes[$i+1]; $r = $bytes[$i+2]; $a = $bytes[$i+3]
    if ($a -gt 40) {
      $lum = ($r + $g + $b) / 3
      if ($lum -lt $minDark) { $minDark = $lum }
      if ($lum -gt $maxDark) { $maxDark = $lum }
    }
  }
}
"Visible luminance range after remove: minDark=$minDark maxDark=$maxDark"

for ($y = 0; $y -lt $bmp.Height; $y++) {
  for ($x = 0; $x -lt $bmp.Width; $x++) {
    $i = $y * $stride + $x * 4
    $b = $bytes[$i]; $g = $bytes[$i+1]; $r = $bytes[$i+2]; $a = $bytes[$i+3]
    if ($a -gt 40) {
      # Map original grayscale (0..255) to output white, i.e. invert for dark->light
      $orig = ($r + $g + $b) / 3
      $out = [int](255 - $orig)
      $bytes[$i]   = $out   # B
      $bytes[$i+1] = $out   # G
      $bytes[$i+2] = $out   # R
      # keep alpha unchanged
    }
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$bmp.UnlockBits($data)
$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"Saved: $dst"
