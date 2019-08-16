# This is run as an autocontrol script
while true
do
	PAIRED=$(bash -c "echo -e 'paired-devices\nquit' | bluetoothctl" | grep '^Device' | awk '{print $2}')
	while read -r line; do
		echo $line
	done <<< $PAIRED
	sleep 5
done