#!/bin/sh

remove_if_directory_exists() {
	if [ -d "$1" ]; then rm -Rf "$1"; fi
}

BRANCH="master"

REPOSITORY="https://$CHARTING_LIBRARY_USERNAME:$CHARTING_LIBRARY_ACCESS_TOKEN@$CHARTING_LIBRARY_REPOSITORY"

LATEST_HASH=$(git ls-remote $REPOSITORY $BRANCH | grep -Eo '^[[:alnum:]]+')

remove_if_directory_exists "$LATEST_HASH"

git clone -q --depth 1 -b "$BRANCH" $REPOSITORY "$LATEST_HASH"

remove_if_directory_exists "public/charting_library"
remove_if_directory_exists "public/datafeeds"
remove_if_directory_exists "src/utils/charting_library"
remove_if_directory_exists "src/utils/datafeeds"

cp -r "$LATEST_HASH/charting_library" public/
cp -r "$LATEST_HASH/charting_library" src/utils/
cp -r "$LATEST_HASH/datafeeds" public/
cp -r "$LATEST_HASH/datafeeds" src/utils/

# Create index.js to export widget for Next.js compatibility
cat > "src/utils/charting_library/index.js" << 'JSEOF'
// The charting library is loaded via a UMD bundle that attaches to window.TradingView
// We provide a stub that resolves to the actual widget at runtime
export const widget = (typeof window !== 'undefined' && typeof window.TradingView !== 'undefined')
  ? window.TradingView.widget
  : class MockWidget {}
JSEOF

# Create index.d.ts to re-export types
cat > "src/utils/charting_library/index.d.ts" << 'DTSEOF'
// Re-export all types from the charting library
export * from './charting_library.d'
export * from './datafeed-api.d'
DTSEOF

remove_if_directory_exists "$LATEST_HASH"