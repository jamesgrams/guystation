# This is run as an autocontrol script
while true
do
	PAIRED=$(bash -c "echo -e 'paired-devices\nquit' | bluetoothctl" | grep '^Device' | awk '{print $2}')
	while read -r line; do
		bash -c "echo -e 'connect $line\nquit' | bluetoothctl"
		sleep 5
	done <<< $PAIRED
	sleep 5
done
