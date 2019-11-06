#!/bin/bash

BACKUP_DIR=~
SYSTEMS_DIR="$(echo /home/*/guystation/systems)"

cd $BACKUP_DIR
mkdir -p backup_saves

cd $SYSTEMS_DIR
IFS=$'\n'
for filename in $(find . | grep "./.*/games/.*/saves$" | cut -c 3-)
do
    DESTINATION="$BACKUP_DIR/backup_saves/$filename"
    mkdir -p "$DESTINATION"
    cp -r $filename "$DESTINATION/../"
done
unset IFS
