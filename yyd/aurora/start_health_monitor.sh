#!/bin/bash

# Aurora Embedding Health Monitor - Background Service
# Runs health check every 30 minutes to detect OpenAI quota restoration

echo "🚀 Starting Aurora Embedding Health Monitor..."
echo "   Check interval: 30 minutes"
echo "   Logs: yyd/aurora/health_monitor.log"
echo ""

cd /home/runner/$(basename $REPL_SLUG)/yyd/aurora

# Run health monitor in background
python embedding_health_check.py >> health_monitor.log 2>&1 &

echo "✅ Health Monitor started (PID: $!)"
echo "   Monitor logs: tail -f yyd/aurora/health_monitor.log"
