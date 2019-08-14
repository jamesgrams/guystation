#!/bin/bash

# This script will remount Google Drive
# When a file is deleted, and another file is placed on Google Drive with the same name,
# when google-drive-ocamlfuse goes to update, it will see two different files with the same name -
# the one that was there before currently on the local filesystem and the new one. When ocamlfuse sees this, it will append a suffix
# to the files to differentiate them. However, it then deletes the one it had stored locally, and we are left with only one file
# with a suffix (that doesn't need one) that breaks our symlinks (since Tela GBA deletes the save file and uploads a new one each time).

# This script will unmount, clear the cache deleting any trace of the deleted file, and then remount google-drive.

fusermount -u /home/james/google-drive
google-drive-ocamlfuse -cc
google-drive-ocamlfuse /home/james/google-drive/
