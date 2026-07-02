param(
    [string]$Host = "0.0.0.0",
    [int]$Port = 31145
)

Set-Location $PSScriptRoot
php -S "${Host}:${Port}" index.php
