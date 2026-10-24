@echo off
title NODUX Enterprise Quantum Platform
echo ========================================================
echo  NODUX • Enterprise Quantum Decision Platform (QAP10)
echo  Qiskit Fall Fest Lima 2026 · Reto NTT DATA
echo ========================================================
echo Iniciando entorno virtual y verificando dependencias...
call .venv\Scripts\activate.bat
echo Verificando backend...
python -c "import qiskit; print('[OK] Qiskit ' + qiskit.__version__ + ' listo')"
echo Iniciando Micro-API y Consola Web en http://127.0.0.1:5000 ...
start "" http://127.0.0.1:5000
python src/backend.py
pause
