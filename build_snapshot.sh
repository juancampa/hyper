# OPTIONAL: clear cache
# rm -rf /tmp/hyper* 

npm run build 

# Generate the linked.js file
node ./link.js

# Generate the heap snapshots
node_modules/.bin/mksnapshot $PWD/linked.js 

# Move the snapshot to electorn's directory
cp ./v8_context_snapshot.bin ./node_modules/electron/dist/v8_context_snapshot.bin 

echo Snapshot created
