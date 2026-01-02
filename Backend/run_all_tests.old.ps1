# run_all_tests.ps1
# Script PowerShell pour executer TOUS les tests (users + trajets + reservations + notifications)
# DZ-CarPool Backend Tests

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   TESTS COMPLETS: TOUS LES MODULES           " -ForegroundColor Cyan
Write-Host "   DZ-CarPool Backend Test Suite              " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ==================================================
# 1. VERIFICATIONS PREALABLES
# ==================================================

Write-Host " Verifications prealables..." -ForegroundColor Yellow

if (-not (Test-Path "manage.py")) {
    Write-Host ""
    Write-Host " ERREUR: manage.py non trouve" -ForegroundColor Red
    Write-Host "   Veuillez executer ce script depuis le dossier Backend/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "   OK: Repertoire correct (manage.py trouve)" -ForegroundColor Green

if (-not (Test-Path ".venv")) {
    Write-Host ""
    Write-Host " ERREUR: Environnement virtuel .venv non trouve" -ForegroundColor Red
    Write-Host "   Creez-le avec: python -m venv .venv" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "   OK: Environnement virtuel trouve" -ForegroundColor Green

# ==================================================
# 2. ACTIVATION DE L'ENVIRONNEMENT
# ==================================================

Write-Host ""
Write-Host " Activation de l'environnement virtuel..." -ForegroundColor Yellow

# Verifier si deja active
if ($env:VIRTUAL_ENV) {
    Write-Host "   Attention: Environnement deja actif" -ForegroundColor Yellow
}
else {
    try {
        & .\.venv\Scripts\Activate.ps1
        Write-Host "   OK: Environnement active" -ForegroundColor Green
    }
    catch {
        Write-Host ""
        Write-Host " ERREUR: Impossible d'activer l'environnement" -ForegroundColor Red
        Write-Host ("   " + $_.Exception.Message) -ForegroundColor Yellow
        Write-Host "   Astuce: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
}

# ==================================================
# 3. VERIFICATION DES PACKAGES
# ==================================================

Write-Host ""
Write-Host " Verification des packages installes..." -ForegroundColor Yellow

$requiredPackages = @(
    "pytest",
    "coverage",
    "django",
    "djangorestframework",
    "pytest-django",
    "pytest-cov",
    "channels"
)

$missingPackages = @()

foreach ($package in $requiredPackages) {
    $pipOutput = pip list --format=freeze | Select-String -Pattern ("^" + $package + "==")
    if ($pipOutput) {
        Write-Host ("   OK: " + $package + " installe") -ForegroundColor Green
    }
    else {
        Write-Host ("   MANQUANT: " + $package) -ForegroundColor Red
        $missingPackages += $package
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host ""
    Write-Host (" Packages manquants: " + ($missingPackages -join ", ")) -ForegroundColor Yellow
    Write-Host " Installation automatique..." -ForegroundColor Yellow

    pip install pytest coverage pytest-django pytest-cov djangorestframework channels -q

    Write-Host "   OK: Installation terminee" -ForegroundColor Green
}

# ==================================================
# 4. NETTOYAGE DES FICHIERS TEMPORAIRES
# ==================================================

Write-Host ""
Write-Host " Nettoyage des fichiers temporaires..." -ForegroundColor Yellow

$itemsToClean = @(".coverage", "htmlcov", ".pytest_cache", "coverage.xml")
$cleanedCount = 0

foreach ($item in $itemsToClean) {
    if (Test-Path $item) {
        Remove-Item $item -Recurse -Force -ErrorAction SilentlyContinue
        $cleanedCount++
    }
}

Write-Host ("   OK: " + $cleanedCount + " fichier(s) nettoye(s)") -ForegroundColor Green

# ==================================================
# 5. EXECUTION DES TESTS
# ==================================================

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    EXECUTION DES TESTS                       " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
Write-Host (" Debut: " + $startTime.ToString("HH:mm:ss")) -ForegroundColor Gray
Write-Host ""

# CORRECTION: app.notifications (pas app.notificatios)
python -m coverage run `
    --source='app.users,app.trajets,app.reservations,app.notifications' `
    --omit='*/migrations/*,*/tests/*,*/test_*.py,*/__init__.py,*/admin.py,*/apps.py,*/consumers.py,*/routing.py,*/asgi.py' `
    manage.py test app.notifications.tests app.reservations.tests app.users.tests app.trajets.tests `
    --settings=config.settings_test `
    --verbosity=2 `
    --keepdb

$testResult = $LASTEXITCODE

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host (" Fin: " + $endTime.ToString("HH:mm:ss")) -ForegroundColor Gray
Write-Host (" Duree: " + $duration.ToString("mm\:ss")) -ForegroundColor Gray
Write-Host ""

# ==================================================
# 6. RAPPORT DE COUVERTURE CONSOLE
# ==================================================

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    RAPPORT DE COUVERTURE                     " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

python -m coverage report --show-missing

# ==================================================
# 7. GENERATION RAPPORT HTML
# ==================================================

Write-Host ""
Write-Host " Generation rapport HTML..." -ForegroundColor Yellow

python -m coverage html --directory=htmlcov
Write-Host "   OK: Rapport HTML genere (htmlcov/index.html)" -ForegroundColor Green

# ==================================================
# 8. GENERATION RAPPORT XML
# ==================================================

Write-Host ""
Write-Host " Generation rapport XML (CI/CD)..." -ForegroundColor Yellow

python -m coverage xml
Write-Host "   OK: coverage.xml genere" -ForegroundColor Green

# ==================================================
# 9. SEUIL DE COUVERTURE (80 %)
# ==================================================

Write-Host ""
Write-Host " Verification seuil couverture (80 %)..." -ForegroundColor Yellow

python -m coverage report --fail-under=80
$coverageFailed = $LASTEXITCODE -ne 0

if ($coverageFailed) {
    Write-Host "   ALERTE: Couverture < 80 %" -ForegroundColor Red
}
else {
    Write-Host "   OK: Couverture >= 80 %" -ForegroundColor Green
}

# ==================================================
# 10. RESULTAT FINAL
# ==================================================

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "           RESULTATS FINAUX                   " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

if ($testResult -eq 0 -and -not $coverageFailed) {
    Write-Host " RESULTAT: Tests OK et couverture OK" -ForegroundColor Green
}
elseif ($testResult -ne 0) {
    Write-Host " RESULTAT: Certains tests ont echoue" -ForegroundColor Red
}
else {
    Write-Host " RESULTAT: Tests OK mais couverture < 80 %" -ForegroundColor Yellow
}

Write-Host ""
Write-Host " Rapports :" -ForegroundColor Cyan
Write-Host "   - Console: ci-dessus"
Write-Host "   - HTML:   htmlcov/index.html"
Write-Host "   - XML:    coverage.xml"

Write-Host ""
Write-Host " Fichiers exclus de la couverture:" -ForegroundColor Gray
Write-Host "   - */migrations/*"
Write-Host "   - */tests/*"
Write-Host "   - */test_*.py"
Write-Host "   - */__init__.py"
Write-Host "   - */admin.py"
Write-Host "   - */apps.py"
Write-Host "   - */consumers.py (WebSocket - difficilement testable)"
Write-Host "   - */routing.py (Configuration WebSocket)"
Write-Host "   - */asgi.py (Configuration ASGI)"

Write-Host ""
Write-Host " NOTE:" -ForegroundColor Yellow
Write-Host "   Les fichiers WebSocket (consumers.py, routing.py) sont exclus car" -ForegroundColor Gray
Write-Host "   les tests asynchrones ne sont pas correctement detectes par coverage." -ForegroundColor Gray
Write-Host "   Ces fichiers sont testes fonctionnellement mais exclus du calcul." -ForegroundColor Gray

# ==================================================
# 11. OUVERTURE RAPPORT HTML (OPTIONNEL)
# ==================================================

Write-Host ""
$openReport = Read-Host "Ouvrir le rapport HTML dans le navigateur ? (o/N)"
if ($openReport -eq "o" -or $openReport -eq "O") {
    if (Test-Path "htmlcov/index.html") {
        Start-Process "htmlcov/index.html"
    }
}

# ==================================================
# 12. FIN
# ==================================================

Write-Host ""
Read-Host "Appuyez sur Entree pour quitter"

$finalExitCode = 0
if ($testResult -ne 0) {
    $finalExitCode = 1
}
elseif ($coverageFailed) {
    $finalExitCode = 2
}

exit $finalExitCode