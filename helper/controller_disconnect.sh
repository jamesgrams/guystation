# This is run as a keybord shortcut
# stop contoller connect
ps -aux | grep '[c]ontroller_connect' | awk '{print $2}' | xargs sudo kill -9
# disconnect
bash -c "echo -e 'disconnect 8C:CD:E8:BB:E5:8D\nquit' | bluetoothctl"
# sleep 10
sleep 8
# Try to only allow one program to run at a time
ps -aux | grep '[c]ontroller_connect' | awk '{print $2}' | xargs sudo kill -9
# restart controller connect
sudo bash -c "/home/james/controller_connect.sh > /var/log/controller_log" &
