#!/bin/bash

echo "🔍 Scan des declare_id! dans ./programs/... 🔎"
echo "--------------------------------------------"

INVALID=0

find programs/ -name "*.rs" | while read file; do
    LINE=$(grep -E 'declare_id!\(".*"\)' "$file")
    if [[ -n "$LINE" ]]; then
        ID=$(echo "$LINE" | sed -n 's/.*declare_id!("\(.*\)").*/\1/p')
        echo "🧩 Fichier: $file"
        echo "   → ID trouvé: $ID"

        LENGTH=${#ID}
        if [[ $LENGTH -lt 32 || $LENGTH -gt 44 ]]; then
            echo "   ❌ Longueur incorrecte ($LENGTH caractères)"
            INVALID=1
        elif echo "$ID" | grep -q '[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]'; then
            echo "   ❌ Caractère non autorisé dans Base58"
            INVALID=1
        else
            echo "   ✅ ID semble valide"
        fi
        echo "--------------------------------------------"
    fi
done

if [[ $INVALID -eq 0 ]]; then
    echo "🎉 Tous les declare_id! sont correctement formatés ✅"
else
    echo "🚨 Un ou plusieurs declare_id! semblent invalides ❌"
fi
