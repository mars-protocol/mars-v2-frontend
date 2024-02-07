#!/bin/bash
# no verbose
set +x
nextFolder='/app/.next'
# create the config file from environment variables
envFilename='override.conf'
echo "APP_NEXT_OSMOSIS_RPC=$URL_OSMOSIS_RPC" >> $envFilename
echo "APP_NEXT_OSMOSIS_REST=$URL_OSMOSIS_REST" >> $envFilename
echo "APP_NEXT_WALLET_CONNECT_ID=$WALLET_CONNECT_ID" >> $envFilename
echo "APP_CHARTING_LIBRARY_USERNAME=$CHARTING_LIBRARY_USERNAME" >> $envFilename
echo "APP_CHARTING_LIBRARY_ACCESS_TOKEN=$CHARTING_LIBRARY_ACCESS_TOKEN" >> $envFilename
echo "APP_CHARTING_LIBRARY_REPOSITORY=$CHARTING_LIBRARY_REPOSITORY" >> $envFilename

function apply_path {
  # read all config file  
  while read line; do
    # no comment or not empty
    if [ "${line:0:1}" == "#" ] || [ "${line}" == "" ]; then
      continue
    fi
    
    # split
    configName="$(cut -d'=' -f1 <<<"$line")"
    configValue="$(cut -d'=' -f2 <<<"$line")"
    
    # replace all config values in built app with the ones defined in override
    find $nextFolder \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#$configName#$configValue#g"
    
  done < $envFilename
}
apply_path
exec "$@"
