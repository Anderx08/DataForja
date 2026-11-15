#!/usr/bin/env bash
# Genera artifact.html: la misma página sin el envoltorio <html>/<head>/<body>,
# que es el formato que espera la publicación como artefacto de Claude.
set -e
cd "$(dirname "$0")"
sed '1d;$d' index.html > artifact.html
echo "artifact.html generado ($(wc -c < artifact.html) bytes)"
