@echo off
echo ========================================
echo Testing Auto-Redirect for Microservices
echo ========================================

echo.
echo Testing auto-redirect from root (/) to /docs for each service:
echo.

REM Test API Gateway BFF (port 8000)
echo 🔍 Testing API Gateway BFF (Next.js)
echo    Root URL: http://localhost:8000/
echo    Expected redirect to: http://localhost:8000/docs
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/' -MaximumRedirection 0 -TimeoutSec 5; if ($response.StatusCode -eq 302) { Write-Host '   ✅ SUCCESS: Redirect to /docs working correctly' -ForegroundColor Green } else { Write-Host '   ❌ FAILED: No redirect found' -ForegroundColor Red } } catch { Write-Host '   ❌ FAILED: Service not available' -ForegroundColor Red }"
echo.

REM Test Authentication Identity Service (port 8001)
echo 🔍 Testing Authentication Identity Service (Spring Boot)
echo    Root URL: http://localhost:8001/
echo    Expected redirect to: http://localhost:8001/docs
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8001/' -MaximumRedirection 0 -TimeoutSec 5; if ($response.StatusCode -eq 302) { Write-Host '   ✅ SUCCESS: Redirect to /docs working correctly' -ForegroundColor Green } else { Write-Host '   ❌ FAILED: No redirect found' -ForegroundColor Red } } catch { Write-Host '   ❌ FAILED: Service not available' -ForegroundColor Red }"
echo.

REM Test User Management Service (port 8002)
echo 🔍 Testing User Management Service (FastAPI)
echo    Root URL: http://localhost:8002/
echo    Expected redirect to: http://localhost:8002/docs
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8002/' -MaximumRedirection 0 -TimeoutSec 5; if ($response.StatusCode -eq 302) { Write-Host '   ✅ SUCCESS: Redirect to /docs working correctly' -ForegroundColor Green } else { Write-Host '   ❌ FAILED: No redirect found' -ForegroundColor Red } } catch { Write-Host '   ❌ FAILED: Service not available' -ForegroundColor Red }"
echo.

REM Test Contract Management Service (port 8003)
echo 🔍 Testing Contract Management Service (Spring Boot)
echo    Root URL: http://localhost:8003/
echo    Expected redirect to: http://localhost:8003/docs
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8003/' -MaximumRedirection 0 -TimeoutSec 5; if ($response.StatusCode -eq 302) { Write-Host '   ✅ SUCCESS: Redirect to /docs working correctly' -ForegroundColor Green } else { Write-Host '   ❌ FAILED: No redirect found' -ForegroundColor Red } } catch { Write-Host '   ❌ FAILED: Service not available' -ForegroundColor Red }"
echo.

REM Test AI Processing Service (port 8017)
echo 🔍 Testing AI Processing Service (FastAPI)
echo    Root URL: http://localhost:8017/
echo    Expected redirect to: http://localhost:8017/docs
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8017/' -MaximumRedirection 0 -TimeoutSec 5; if ($response.StatusCode -eq 302) { Write-Host '   ✅ SUCCESS: Redirect to /docs working correctly' -ForegroundColor Green } else { Write-Host '   ❌ FAILED: No redirect found' -ForegroundColor Red } } catch { Write-Host '   ❌ FAILED: Service not available' -ForegroundColor Red }"
echo.

REM Test File Storage Asset Service (port 8012)
echo 🔍 Testing File Storage Asset Service (FastAPI)
echo    Root URL: http://localhost:8012/
echo    Expected redirect to: http://localhost:8012/docs
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8012/' -MaximumRedirection 0 -TimeoutSec 5; if ($response.StatusCode -eq 302) { Write-Host '   ✅ SUCCESS: Redirect to /docs working correctly' -ForegroundColor Green } else { Write-Host '   ❌ FAILED: No redirect found' -ForegroundColor Red } } catch { Write-Host '   ❌ FAILED: Service not available' -ForegroundColor Red }"
echo.

echo ========================================
echo Test completed!
echo ========================================
echo.
echo Expected behavior:
echo • All backend microservices should redirect from / to /docs
echo • Frontend services should NOT redirect to /docs
echo • Status code 302 (Found) indicates successful redirect
echo.

pause
