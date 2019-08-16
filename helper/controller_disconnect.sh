# This is run as a keybord shortcut
# stop contoller connect
ps -aux | grep '[c]ontroller_connect' | awk '{print $2}' | xargs sudo kill -9
# disconnect
PAIRED=$(bash -c "echo -e 'paired-devices\nquit' | bluetoothctl" | grep '^Device' | awk '{print $2}')
while read -r line; do
    bash -c "echo -e 'disconnect $line\nquit' | bluetoothctl"
done <<< $PAIRED
# sleep 8
sleep 8
# Try to only allow one program to run at a time
ps -aux | grep '[c]ontroller_connect' | awk '{print $2}' | xargs sudo kill -9
# restart controller connect
sudo bash -c "/home/james/controller_connect.sh > /var/log/controller_log" &