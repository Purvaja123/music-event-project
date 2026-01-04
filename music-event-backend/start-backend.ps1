# PowerShell script to start the backend server
Write-Host "Starting Music Event Backend Server..." -ForegroundColor Green
Write-Host "Port: 8080" -ForegroundColor Cyan
Write-Host "Database: MySQL on port 3306" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location $PSScriptRoot

# Check if Maven is installed
$mavenCheck = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mavenCheck) {
    Write-Host "ERROR: Maven is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if port 8080 is already in use
$portCheck = netstat -ano | findstr :8080
if ($portCheck) {
    Write-Host "WARNING: Port 8080 is already in use!" -ForegroundColor Yellow
    Write-Host "Please stop the process using port 8080 first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To find and kill the process:" -ForegroundColor Yellow
    Write-Host "  netstat -ano | findstr :8080" -ForegroundColor Gray
    Write-Host "  taskkill /PID <PID> /F" -ForegroundColor Gray
    exit 1
}

# Start the Spring Boot application
Write-Host "Starting Spring Boot application..." -ForegroundColor Green
mvn spring-boot:run

