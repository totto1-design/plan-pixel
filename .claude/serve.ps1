# Servidor local para probar Plan Pixel en esta computadora (no hay Python ni Node).
# Sirve los archivos de la carpeta del proyecto en http://localhost:8766/
param([int]$Puerto = 8766)

$raiz = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$tipos = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.ico' = 'image/x-icon'
  '.webmanifest' = 'application/manifest+json'
  '.woff2' = 'font/woff2'
  '.txt' = 'text/plain; charset=utf-8'
  '.md' = 'text/plain; charset=utf-8'
}

$servidor = New-Object System.Net.HttpListener
$servidor.Prefixes.Add("http://localhost:$Puerto/")
$servidor.Start()
Write-Host "Plan Pixel en http://localhost:$Puerto/ (carpeta $raiz)"

while ($servidor.IsListening) {
  $contexto = $servidor.GetContext()
  $respuesta = $contexto.Response
  try {
    $ruta = [Uri]::UnescapeDataString($contexto.Request.Url.AbsolutePath.TrimStart('/'))
    if ($ruta -eq '' -or $ruta.EndsWith('/')) { $ruta = $ruta + 'index.html' }
    $archivo = [IO.Path]::GetFullPath((Join-Path $raiz $ruta))
    $esPrivado = $archivo.StartsWith((Join-Path $raiz 'privado'), [StringComparison]::OrdinalIgnoreCase)
    if ($archivo.StartsWith($raiz, [StringComparison]::OrdinalIgnoreCase) -and -not $esPrivado -and (Test-Path $archivo -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($archivo)
      $extension = [IO.Path]::GetExtension($archivo).ToLower()
      $respuesta.ContentType = $(if ($tipos[$extension]) { $tipos[$extension] } else { 'application/octet-stream' })
      $respuesta.Headers.Add('Cache-Control', 'no-store')
      $respuesta.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $respuesta.StatusCode = 404
    }
  } catch {
    $respuesta.StatusCode = 500
  } finally {
    $respuesta.Close()
  }
}
