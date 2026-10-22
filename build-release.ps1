$env:JAVA_HOME = "C:\Users\vfolk\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
Set-Location android
.\gradlew.bat assembleRelease --no-daemon
Set-Location ..
Copy-Item android\app\build\outputs\apk\release\app-release.apk .\classmeate-release.apk -Force
Write-Host "Build complete! APK ready at classmeate-release.apk"
