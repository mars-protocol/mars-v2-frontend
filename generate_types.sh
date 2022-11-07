# generates smart contracts type definitions and copies respective files to types directory
# Usage: ./generate-types.sh

R='\033[0;31m'   #'0;31' is Red's ANSI color code
G='\033[0;32m'   #'0;32' is Green's ANSI color code

dir=$(pwd)
echo $dir

if [ -d "../rover" ]; then
    echo "Fetching latest changes from rover repo"
    cd ../rover && git fetch && git checkout master && git pull
    cd $dir
    echo "Generating types for rover..."
    cp -r ../rover/scripts/types/generated ./types
    echo "${G}Success"
else
    echo "${R}Directory rover not found..."
fi
