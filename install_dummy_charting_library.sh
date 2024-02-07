#!/bin/sh

remove_if_directory_exists() {
	if [ -d "$1" ]; then rm -Rf "$1"; fi
}

BRANCH="master"

remove_if_directory_exists "public/charting_library"
remove_if_directory_exists "public/datafeeds"
remove_if_directory_exists "src/utils/charting_library"
remove_if_directory_exists "src/utils/datafeeds"

cp -r src/dummy/charting_library public/
cp -r src/dummy/charting_library src/utils/
cp -r src/dummy/datafeeds public/
cp -r src/dummy/datafeeds src/utils/