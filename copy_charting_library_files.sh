#!/bin/sh

remove_if_directory_exists() {
	if [ -d "$1" ]; then rm -Rf "$1"; fi
}

BRANCH="master"

REPOSITORY="https://$TV_USERNAME:$TV_ACCESS_TOKEN@github.com/tradingview/charting_library/"

echo $REPOSITORY

LATEST_HASH=$(git ls-remote $REPOSITORY $BRANCH | grep -Eo '^[[:alnum:]]+')

remove_if_directory_exists "$LATEST_HASH"

git clone -q --depth 1 -b "$BRANCH" $REPOSITORY "$LATEST_HASH"

remove_if_directory_exists "public/static/charting_library"
remove_if_directory_exists "public/static/datafeeds"
remove_if_directory_exists "src/utils/charting_library"
remove_if_directory_exists "src/utils/datafeeds"

cp -r "$LATEST_HASH/charting_library" public/
cp -r "$LATEST_HASH/charting_library" src/utils/
cp -r "$LATEST_HASH/datafeeds" public/
cp -r "$LATEST_HASH/datafeeds" src/utils/

remove_if_directory_exists "$LATEST_HASH"
src/utils/parsers.ts