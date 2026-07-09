$ErrorActionPreference = "Stop"

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ENVIAR PLAYBOOK OBJECAO ZERO - GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Conta correta: flaviasimone25-max" -ForegroundColor Yellow
Write-Host "Repositorio:    https://github.com/flaviasimone25-max/playbookzero-obje-o.git" -ForegroundColor Yellow
Write-Host ""
Write-Host "Se pedir senha, use um Personal Access Token do GitHub." -ForegroundColor Gray
Write-Host "Crie em: https://github.com/settings/tokens (permissao: repo)" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path ".git")) {
  Write-Host "Inicializando Git..." -ForegroundColor Yellow
  git init
  git add .
  git commit -m "Deploy inicial do Playbook Objeção Zero para Vercel"
  git branch -M main
  git remote add origin https://github.com/flaviasimone25-max/playbookzero-obje-o.git
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  git remote add origin https://github.com/flaviasimone25-max/playbookzero-obje-o.git
}

Write-Host "Enviando codigo para o GitHub..." -ForegroundColor Green
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "SUCESSO! Codigo enviado para o GitHub." -ForegroundColor Green
  Write-Host "Confira em: https://github.com/flaviasimone25-max/playbookzero-obje-o" -ForegroundColor Green
  Write-Host ""
  Write-Host "Proximo passo: conectar na Vercel em https://vercel.com/new" -ForegroundColor Cyan
} else {
  Write-Host ""
  Write-Host "Falhou. Verifique se entrou com flaviasimone25-max e usou o token como senha." -ForegroundColor Red
  Write-Host "Leia o arquivo LEIA-ANTES-DE-SUBIR.txt para mais detalhes." -ForegroundColor Red
}

Write-Host ""
Read-Host "Pressione Enter para fechar"
