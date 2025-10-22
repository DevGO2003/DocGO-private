# Setup Java Environment
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"

# Set JAVA_HOME for current session
$env:JAVA_HOME = $javaPath
Write-Host "JAVA_HOME set to: $env:JAVA_HOME"

# Add to PATH for current session
$env:PATH = "$javaPath\bin;$env:PATH"

# Set JAVA_HOME permanently (requires admin)
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "Machine")
Write-Host "JAVA_HOME set permanently (Machine level)"

# Test Java
Write-Host "`nTesting Java installation:"
& "$javaPath\bin\java.exe" -version

Write-Host "`nJava setup completed!"
