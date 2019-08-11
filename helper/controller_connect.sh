# This is run as an autocontrol script
while true
do
	bash -c "echo -e 'connect 8C:CD:E8:BB:E5:8D\nquit' | bluetoothctl"
	sleep 5
done
