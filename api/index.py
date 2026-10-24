"""
NODUX Enterprise Quantum Decision Platform
api/index.py - Serverless entrypoint for Vercel
"""
import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT_DIR, "src")
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from backend import app
