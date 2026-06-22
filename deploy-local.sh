#!/bin/bash
# Clone the current branch to a folder on Desktop for local preview

BRANCH=$(git rev-parse --abbrev-ref HEAD)
FOLDER_NAME=$(echo "$BRANCH" | tr '/' '-')
DEST="$HOME/Desktop/$FOLDER_NAME"

if [ -d "$DEST" ]; then
  echo "Updating existing folder: $DEST"
  rm -rf "$DEST"
fi

echo "Copying site files to $DEST ..."
mkdir -p "$DEST/assets"

cp index.html "$DEST/"
cp base.min.css "$DEST/"
cp style.min.css "$DEST/"
cp calc-modal.min.css "$DEST/"
cp app.min.js "$DEST/"
cp calc-engine.min.js "$DEST/"
cp -r assets/* "$DEST/assets/"

echo ""
echo "Done! Open in browser:"
echo "  open $DEST/index.html"
echo ""
echo "Branch: $BRANCH"
echo "Folder: $DEST"
