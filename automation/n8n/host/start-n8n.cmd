@echo off
REM CloudSpring n8n -- starts the Speed-to-Lead engine host at logon (CLO-14).
REM Canonical copy: automation/n8n/host/start-n8n.cmd in cldsprng/cloudspring-mockups
start "" /min powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Users\ACenteno\cloudspring-n8n\start-n8n.ps1"
