![GuyStation Logo](https://raw.githubusercontent.com/jamesgrams/guystation/master/assets/logo.png)

[![Stargazers repo roster for @jamesgrams/guystation](https://reporoster.com/stars/jamesgrams/guystation)](https://github.com/jamesgrams/guystation/stargazers)
[![Forkers repo roster for @jamesgrams/guystation](https://reporoster.com/forks/jamesgrams/guystation)](https://github.com/jamesgrams/guystation/network/members)

# GuyStation
https://guystation.net

An Emulator Hub for Ubuntu. This is a small frontend for emulators designed to be easily installable and accessible. In addition to having several emulators, GuyStation's major highlights include the ability to stream games to and access the menu from any device on the same network, the ability create seperate save files for the same game (designed for Pokémon :)), a media player that lets you play music or videos on any device on the same network, and an internet browser that can be controlled remotely.

## Overview Video
[![GuyStation Overview Video](https://img.youtube.com/vi/Zykq1mJrGgM/0.jpg)](https://www.youtube.com/watch?v=Zykq1mJrGgM)

## Run
GuyStation is designed to run on Ubuntu (working on version 18.04) and to basically be the sole purpose of the machine. The steps to get it running are as follows:

### Quick
1. Download and run [this script](https://raw.githubusercontent.com/jamesgrams/guystation/master/scripts/setup.sh) on Ubuntu 18.04.
2. Restart your computer, and GuyStation should boot automatically.
3. Read the [Short Summary]('#short-summary') Section of [Emulator Specific Setup]('#emulator-specific-setup') and complete the few setup steps listed.
4. Connect and setup any controllers or other devices that you want to use to control the emulators. 
5. Add games and have fun! You should be able to access the GuyStation frontend on any device within the same network by going to the IP that GuyStation displays in your browser.

### Full Build
1. Clone this repository into your home directory
2. `cd` into this repository
3. Run `./scripts/setup.sh complete` (don't run as root).
4. Read the [Short Summary]('#short-summary') Section of [Emulator Specific Setup]('#emulator-specific-setup') and complete the few setup steps listed.
5. Optionally get an register a Twitch developer application for GuyStation and set the `GUYSTATION_IGDB_CLIENT_ID` and `GUYSTATION_IGDB_CLIENT_SECRET` environment variables. See the Extras section for more info.
6. Restart your computer, and GuyStation should boot automatically.
7. Connect and setup any controllers or other devices that you want to use to control the emulators. 
8. Add games and have fun! You should be able to access the GuyStation frontend on any device within the same network by going to the IP that GuyStation displays in your browser.

Note: You can press F11 to get GuyStation out of full screen mode at any time.

## Supported Systems
* Game Boy
* Game Boy Color
* Game Boy Advance
* NES
* Nintendo DS
* Nintendo 3DS
* Nintendo 64
* Nintendo GameCube
* Wii
* PC
* PlayStation 1
* PlayStation 2
* PSP
* SNES

## Extras
* Internet Browser - you can remotely control a browser running on your GuyStation
    * You can control remotely by opening the menu and clicking the globe icon under "More".
    * Note: It is recommended to close the Browser controls when not using them (this will turn off streaming and help with speeds).
    * You can add games to the browser. If you add a URL, the opening that game will open the URL. If you select a file, it should be a JSON file with a key for `siteUrl` with a url as the value. In addition, you can optionally include a `script` key with an array of strings. Each string should contain JavaScipt that will be run a few seconds apart on the page once it is opened. For example:
        ```
        {
            "siteUrl": "https://google.com",
            "script": [
                "document.querySelector('input').click()",
                "document.querySelector('input').value = 'Test'"
            ]
        }
        ```
    * The file `helper/browser-scripts/stream.json` can be added as a browser game. Opening it in GuyStation will take you to a page that will stream connected user media. You can use this if you have a capture device on your GuyStation machine. You will be able to play HDMI/AV content such as another video game system through GuyStation and thus stream that to another device if you like.
    * The file `helper/browser-scripts/stream-remote.json` can be used as a browser game to pull up a stream on another guystation. Just be sure to set the url to the right IP address. Make sure the regular stream is called `Stream` if you use this script.
* Media - you can play media files or stream them to any device using the GuyStation web interface.
    * You add a media file just like a game. Upload the audio/video file as the ROM file.
    * You can access media remotely by opening the menu and clicking the CD icon under "More".
    * You can also create playlists by selecting the playlist type when adding a game to media and selecting tracks that you want to include.
    * Note: if you accidently move a game under media, your save files are safe! Just move the game to the correct console, and your save files will be there.
    * You can also specify a YouTube url as the ROM url to download a YouTube video.
* Screenshots - you can view the screenshots for a game (or folder) by opening the menu and clicking the CD icon under "More".
* Streaming - you can stream the screen to any web capable device.
    * Simply open Guystation in a web browser by going to the Guystation IP address on another device and click the monitor icon in the menu on the device you want to stream to.
    * Keyboard input, gamepad input, and mouse clicks will be forwarded to GuyStation when streaming (with the exception of Escape, since that is used to exit Fullscreen).
    * On a mobile device, streaming in fullscreen mode will allow you to add virtual keyboard and gamepad buttons to the page. These buttons' values will by fowarded when touched. Please note, the gamepad buttons (e.g. A, B, X, etc.), which are at the bottom of the list of keys that a button can be assigned, are listed in order of their button number. So, if your emulator is set to map "button 0" to a control, that would be "A" for the virtual controller, since "A" is the first button in the list.
        * When you start streaming, a virtual controller will be added to GuyStation. Please keep in mind that some emulators need to have a controller plugged in before starting up, so you might need to start streaming before opening the game. Also keep this in mind as it may conflict with your physical controllers, if they are not already connected before starting to stream.
* You can update, restart, or reboot the system by clicking the power button under "More" in the menu.
* GuyStation has IGDB integration to display information about games. To display information, you must first generate a client ID and secret by creating an application on Twitch's developer site (Twitch owns IGDB). For information on how to do this, see [here](https://api-docs.igdb.com/#about). Then, you must set the environment variables, GUYSTATION_IGDB_CLIENT_ID and GUYSTATION_IGDB_CLIENT_SECRET, to these values. The easiest way to do this is to add the lines `GUYSTATION_IGDB_CLIENT_ID=<client id>` and `GUYSTATION_IGDB_CLIENT_SECRET=<client secret>` to `/etc/environment`. After a system reboot, GuyStation should start fetching game metadata.
* PC - GuyStation installs Wine so you can run PC games. Since these can vary so widely, GuyStation doesn't allow for changing saves or controller mapping. Most PC games have an installer. Simply upload the installer as the ROM file, then run the game. GuyStation will boot up the installer. Install the game. While the game is installing, GuyStation will be monitoring the `~/.wine/c_drive/Program Files` and `~/.wine/c_drive/Program Files (x86)` directories for changes. Once it finds a new folder there, which is likely where your game will be installed, it will look for the largest executable file in that folder and continue to do so while the installation finishes. Once it finds this file, it will update your game to run this file rather than the installer, so next time you launch from GuyStation, you will boot directly to the game! Of course, this process is not perfect, so you may need to manually edit the `metadata.json` file to point to the `exe` file for your installed game (e.g. `{"rom":"/home/myexe.exe/"}).
    * To help with this, you can specify an absolute path of an exe file in the Rom URL field if you like.
    * Additionally, it's often the case that multiple files are needed to install a PC game. If you have multiple files, you can zip them up and upload them. GuyStation will take the biggest .exe or .msi file found as the installer (or potentially game) file, but all the files will be available in the folder.
        * Please note, this only happens when you upload a zip file. Downloading a zip file via the ROM URL function will behave as that function typically does - only the largest file is kept.
* Picture-in-Picture Mode
    * You can play an online video (e.g. YouTube) while you use GuyStation. Simply click the PIP Button under "More" in the menu and enter the URL of the page containing the video and click Apply. You can also choose whether to mute the game or the video in PIP mode. Once you are done, use the Stop button to leave PIP mode. You can switch between the video and the game being muted by selecting one and clicking Apply without entering a value for the URL field.

## Recommendations
Here are some recommendedations to make your experience better on Ubuntu.
1. Disable screen lock in settings
2. Use a Bluetooth adapater and install Bluetooth Manager (`sudo apt-get install blueman`)
    * This is good for initially pariring your controller.
3. For Wii/Wii U Controllers use xwiimote (`sudo apt-get install xwiimote`)
    * In addition, I recommend the Mayflash Wii U Pro Controller Adapter for third party Wii U Pro controllers. I had an afterglow controller that would not work with a regular bluetooth adapter, but it worked great with this. Note that you will need one adapter per controller.
4. For Switch Pro Controllers, they will work out of the box (without a specific driver) with Bluetooth (You have to press the sync button to connect).
    * In March 2019, Google released Switch Pro Controller support for Chrome. However, this locks any other program from using the controller (when `navigator.getGamepads()` is called). So, you will need to use a version of Chrome released before this date if you want to use a Switch Pro Controller. For Chrome 70 and 71, you will need to enable the "Experimental Web Platform features" flag in `chrome://flags` to get screensharing to work.
    * You may need to fix the axes on the Switch Controller. To do so, you can follow [this guide](https://joaorb64.github.io/2018/02/14/Configuring-a-Nintendo-Switch-Pro-Controller-on-Linux.html). I also recommend creating a udev rule to do this every time the controller connects. There are rules that you can use posted in the comments of the guide.
5. To map controller buttons to keyboard keys, use [Antimicro](https://github.com/AntiMicro/antimicro).
    * To build on Ubuntu, in addition to following the instructions in the project's README, you will need the following libraries:
        * `sudo apt-get install libqt4-dev libqt4-dev-bin libqt4-opengl-dev libqtwebkit-dev qt4-linguist-tools qt4-qmake`
    * The configuration for my Wii U Pro Controller can be found in the `/helper` directory.
    * Please note, that Anticicro uses different profiles for different controllers, and as such, you'll need to set one up for the GuyStation virtual controller if you so desire (this controller is available during screencasts).
    * If you are having trouble with Antimicro, I recommend using [AntimicroX](https://github.com/juliagoda/antimicroX). A fork of Antimicro that has been kept up to date and works mostly the same.
6. I sync my saves with Google Drive (Get on Ubuntu with google-drive-ocamlfuse - you'll have to mount as root), so I can play the same game on GuyStation and GBA4iOS (Currently, the Tela fork Beta supports Google Drive). To do this, with GuyStation closed, create a symbolic link from the save file (in the Google Drive mount) to a save file in the GuyStation tree (or the folder containing the save file). See the tree below for more details.
    * Note: the Tela fork will only download your save file if there is no save on your device. As such, you'll only want to turn on Sync when you want to download or upload your save, and you should delete the game from your iPhone before you download. Then, when you turn on sync, Tela will detect the game isn't there and re-download the game and the save.
    * After uploading from Tela, you will have to remount Google Drive or just restart the computer to get the symbolic links to work, since Google Drive will append a suffix to the name to indicate there was a change from another device. There is a helper script located in `/helper/remount_drive.sh` that you can use as a starting point to do this. You might want to map it to a keyboard shortcut and then map some controller keys to that shortcut.
    * To work with Delta and dropbox, all you'll need to do is reimport the save file from Dropbox on Delta after saving on GuyStation. Saving on Delta will automatically update GuyStation. You can use [dbxfs](https://github.com/rianhunter/dbxfs) to mount dropbox and create an autostart entry to mount dropbox on startup. Delta saves are hashed, so you may need to test a little to get the right save.
7. Use unclutter (`sudo apt-get install unclutter` and `unclutter -idle 2 -root`) to hide the mouse after 2 seconds. The settings for unclutter to be run on startup can be found in `/etc/defaults/unclutter`.
8. For easy controller connecting, I use a script that tries to automatically connect with any paired controller (I use Bluetooth Manager to initially pair) every 5-10 seconds. I've set this script to run on startup. I also use an Ubuntu Keyboard Shortcut to run a script that disconnects my controller on keypress (and then restarts the program looking for the controller). I use Antimicro to map some buttons on my controller to the keys in the keyboard shortcut, so I can disconnect the controller when I'm not using it. My connect and disconnect scripts can be found in `/helper/controller_connect.sh` and `/helper/controller_disconnect.sh` respectively. You will need the `bluetoothctl` program.
    * You'll have to kill this script when you add a new controller, I've found.
9. Disable `apport`, so you don't have to deal with crash menu popups.
10. Several of the programs mentioned above are good to have run on startup. To do this, create a file in `~/.config/autocontrol/` - the setup script should already set one up for guystation itself.
    * The `/helper/autocontrol` directory contains example scripts for antimicro (with hidden GUI), google-drice-ocamlfuse, and the controller_connect script.
11. There is a script called `backup_saves.sh` in the `helper` directory that you can edit to copy your savedata to another location on your computer. Personally, I run the script each night in cron and copy the data to my mounted Google Drive.
12. Turn off notifications. You can do this in Ubuntu settings.
13. Disable auto-checking and notifications of new Ubuntu versions in Update Manager. This will prevent update popups.
14. Set the default input/output audio device on login. You can do this by doing the following. Find your output/input device by running `pactl list short sinks` or `pactl list short sources`, respectively. Create an entry in `~/.config/autostart/` similar to `~/.config/autostart/guystation.desktop` to run the command `pactl set-default-sink '<device name>'` or `pactl set-default-source '<device name>'`, respectively. You may have to comment out the line `load-module module-switch-on-connect` in `/etc/pulse/default.pa` as well.
15. On remote devices that you plan on accessing GuyStation from, install the [GuyStation Remote Extension](https://github.com/jamesgrams/guystation-remote-extension). This will allow you to run the scripts you create to execute in the browser on remote devices as well.

## Emulator Specific Setup
For all emulators, you will have to setup your controller(s). You can do this by opening emulator GUIs by clicking a system image when it is the selected system. This will launch the emulator without any game allowing you to choose options.

Note: there is also limited support for setting up controls for each emulator all at once by using the EZ Controller Configuration section of the Joypad Configuration (available by clicking the gamepad icon in the menu). EZ Controller buttons correspond to their positions on a Nintendo Wii U Pro Controller.

### Short Summary

You can use EZ Controller Configuration to set up all the emulator's main controls and screenshot key (must be a keyboard key). Beyond that, you may need to change the resolution of Mupen64Plus and set the controller ports you want enabled to have "Plugged" be checked, you will need to provide a bios for PCSX2 and perhaps play with its settings to work well on your machine, and you will need to set the Auto-save SRAM setting to a low number on SNES9x. You may also need to start Citra once, before EZ config will work. 

Note: EZ controller configuration will save only the button mapping to the server (not which controller port or nunchuk/classic controller option). The autoload function will save the button mapping AND the nunchuk/classic controller option. It will always set the controls for the first controller port. Additionally, the autoload function will check for any updates to the button mapping on the server prior to setting the controls.

### VBA-M (Game Boy Advance)
This emulator doesn't change the default screenshot key to be Ctrl+S like most others, mainly because you can set the screenshot key to a joystick button and because you can't set multiple simulataneous keys for a button (it would just have to be S). Feel free to set it accordingly when you set up your controller.
Personally, I use the same controller button that I have mappend to Ctrl+S in Antimicro, so the same button takes screenshots in all emulators.

### Desmume (Nintendo DS)
This version of Desmume allows the screenshot key to be mapped.

### Mupen64Plus (Nintendo 64)
You may need to change the Video Plugin for Mupen64Plus. It defaults to `mupen64plus-video-rice.so`, and I changed it to `mupen64plus-video-glide64.so` to work properly on my machine. You can change it in the mupen64 configuration file created after the first time you start Mupen64Plus in `~/.config/mupen64plus/mupen64plus.cfg`.
* I also had to edit the controller configuration. Mupen64Plus is good at autodetecting controllers, but I had to change the Analog Peak, since the analog stick was too sensitive. If you do this, be sure to set the "mode" for the controller to 0, so your settings do not get overwritten.
* You will also want to make sure controllers that you want to recognize as plugged in, are set to plugged in (Settings > Plugins > Input Configure > Check Plugged). This can be done in m64py or the config file.
* This version of Mupen64Plus changes the quit key to F15 rather than Escape (since Escape takes you home) and sets the screenshot key to Ctrl+S by default. Changing the screenshot key to "S" in any settings will actually change it to Ctrl+S.
* Guystation will install M64Py, a frontend for Mupen64Plus, but will not use it due to it having problems with Fullscreen. You can still use it to esily configure settings, however. It can be opened by running `m64py` in the command line.
* The best resolution that I have found is 720x576 with aspect set to 2 (stretch). This runs in fullscreen, full-speed, with proper sound. The aspect ratio is an important factor. If it is too high (for me, 1920x1080), games can be very slow, and some games stuggled with sound through HDMI with an aspect ratio of 640x480 in my experience.
* When streaming Nintendo 64 games, it is best to start streaming while playing the game if you change the aspect ratio. GuyStation takes into account the current aspect ratio when the stream is started and will stream with those dimensions.

### Dolphin (Gamecube/Wii)
The version of Dolphin used changes the default screenshot key to Ctrl+S, and the quit key to Delete+F12. This version also labels all game controllers loaded with evdev as `Gamepad`. This allows you to use the same controller configuration for multiple gamepads. I have found the easiest way to connect Wiimotes is to do the following:
* Change the Dolphin controller settings to use a real Wiimote
* DO NOT connect/pair the wiimote to your system using Bluetooth Manager (this is mainly to avoid the script that tries to connect to paired devices, so it probably doesn't matter if you aren't using that script)
* Every time you start a Wii game, press the red sync button on your Wiimote to connect.
 * I have found that sometimes it takes several tries to work (It may be a conflict with the `controller_connect.sh` script). Dolphin will disconnect the Bluetooth controller you are using for GuyStation (paired with Bluetooth Manager) when you start it, but you can connect it again easily by pressing a button (provided `controller_connect.sh` is running). I use this controller to go back to GuyStation home if necessary as the Wiimote is completely taken over by Dolphin. The reason I find this is best is because the buttons on the Wiimote don't have much support compared to typical gamepads on Ubuntu (For example, the D-Pad doesn't work). I have also found the Wiimote often successfully connects to Dolphin (with a press of the sync button) right after connecting the seperate controller (the one paired with Bluetooth Manager that connects through `controller_connect.sh` - also just needs a button press).

### PXSX2 (PS2)
The version of PCSX2 changes the default screenshot key to Ctrl+S. It also changes the default suspend/resume key from Escape to Ctrl+R. In addition, you will have to run PCSX2 once to get it set up first (you can do that by running `/home/*/pcsx2/bin/PCSX2` in the command line). The main configuration you will have to make is providing PS2 BIOS. You can look more into how this can be acheived online.
The configuration options for PCSX2 are extensive. You might want to play around with them to try to get as little lag as possible.

### Citra (3DS)
The version of Citra changes the default screenshot key to Ctrl+S, the default toggle status bar key to Ctrl+P, and the default exit full screen key to F12. In addition, this version removes the prompt that asks you for a screenshot file name and simply uses the current timestamp as the name. When Citra first starts up, it will ask if you want to send data to the Citra team for debugging. Finally, there are some points within games where you might have to do something that usually would interact with shared 3DS data such as select a Mii. Citra handles this nicely and shows a dialog box. You'll likely have to use a mouse to navigate these, however. Additionally, this version of Citra does not include controller GUIDs in the input mapping. Therefore, you can use any controller to send an input. This is set up so you can switch between your regular controller and the GuyStation virtual controller easily.

### PPSSPP (PSP)
Make sure set to set a key for taking screenshots if you want to (probably Ctrl+S). By default, PPSSPP uses Escape to pause the game meaning returning to the menu will pause the game. Feel free to change this if you do not want this to occur.

### Snes9X (SNES)
No keys are mapped by default, so it is recommended that you map "Take Screenshot" to "S" when you are setting up your controller. This version also removes functionality for the Escape key. Finally, it is recommended that you use the "PulseAudio" sound driver (I had some trouble with the default PortAudio driver on my machine). To save games properly, please set the "Auto-save SRAM" setting to a low number (1-2). Otherwise, you game will not save, since GuyStation does not use the conventional method to save games.

### FCEUX (NES)
This version of FCEUX changes the default screenshot key to Ctrl+S.
Additionally, if you change the screenshot key, it will always include the Ctrl modifier.

## Backwards Compatibility
Some emulators have Backwards compability. From what I understand, VisualBoyAdvance-M supports Game Boy Color and Game Boy Games (like the Game Boy Advance), and PCSX2 supports PS1 games (like the Playstation 2). Dolphin could be thought of as a Wii emulator with backwards compability for the GameCube (like the Wii), however they are two seperate menu options since the Wii requires some extra commands due to the structure it uses for save games. Citra does not support DS games.

## Controls
You can use the arrow keys to control the menu, and enter to start a game/toggle a folder's children visibility (holding for 5 seconds will launch you into a fullscreen screencast if remote). Escape will return to the menu from a game, and holding escape for 2.5 seconds will quit a game (once you're already on the menu). Escape will also snap you to the game you are currently playing if there is one. Adding games and performing similar functions are best done with a mouse (The UI is in a web browser though, so you can access the buttons however you normally would). Spacebar is a shortcut to open remote media. You can also use a game controller to control the menu. The D-Pad and left analog stick will move the menu, A or Start will start a game/toggle a folder's children visibility (holding for 5 seconds will launch you into a fullscreen screencast if remote), and the left and right triggers will cycle through saves. If you are playing media, A or Start will toggle play/paused, Select will toggle fullscreen, and the left and right triggers will cycle through songs in the current folder/playlist. You can configure the Joypad controls by opening the menu, clicking the gamepad icon under "More", and then selecting the field for the input you want (e.g. "Start", "Left Trigger", etc.) and pressing the button on the Joypad that you want to use. To restore to default, you should clear local storage in Chrome.

If you are using a mouse, clicking a game or system will take you to that system. If the game is already selected, clicking it will launch the game/toggle the folder's children visibility. If the system is already selected and it is clicked, the emulator will open without a game (this allows you to edit preferences). On mobile, swiping can be used to move the menu.

You will want to use Antimicro to map home (or some other button) to the escape key. I also map the right analog stick press to Ctrl+S in Antrimicro to use for screenshots (See above for what emulators you need to update the settings in). Beyond that, you can see my helper scripts mentioned above. I have some button combinations mapping to key combinations which are shortcuts for remounting Google Drive and disconnecting the controller. You should manually configure the emulators to have the control scheme you want for your controllers.

## Technical Notes
GuyStation launches a Node.js server along with a Chromium browser (via Puppeteer) that automatically navigates to a web page that allows you to interact with the server. This same page can be accessed by going to the IP address listed on the page in any web capable device.

## Samba Guide
It's possible to set up multiple GuyStations and set up one to share the `systems` directory over Samba, and have the other one mount it. To do this, add the following to `/etc/samba/smb.conf` on the server:
```
[systems]
path = /home/james/guystation/systems
valid users = root
writable = yes
force user = root
force group = root
#veto files = /*current*/
```
On the client, install (`sudo apt-get`) samba and cifs-utils. Then, update `/etc/fstab` to have the following entry, replacing the values within angle brackets appropriately:
```
//192.168.1.2/systems   /home/<your_home_name>/guystation/systems  cifs    sfu,rw,username=root,password=<root_password>,vers=1.0       00
```
There are a few important things to note with this. You won't be able to change saves on the client machine. This is simply because you can't update symlinks on a mounted drive. Additionally, you can't use colons or pipes in your game or save names. Samba doesn't like files that have these names, so it is best to avoid them. However, you can tell GuyStation to send save change requests that wouldn't work typically to the GuyStation that you are mounting by starting the client GuyStation with the command `node src/index.js --smb <server GuyStation ip>`.
Note: Since PC games are installed outside of the systems directory, you'll have to install them on all computers in your cluster.

## File Structure for Systems Directory
* `systems`
    * `<system>` (d)
        * `games` (d)
            * `<gamefolder>` (d) (optional, multiple allowed)
                * `<game>` (d)
                    * `<ROM>`
                    * `saves` (d)
                        * `<save>` (d)
                            * `<save file>`
                            * `screenshots` (d)
                                * `<screenshot>`
                        * `current` (d) - symlink to the current save directory
                    * `metadata.json`
                * `<playlist>` (d) (only for media)
                    * `<symlink to game directory> (this symlink's name will be - n 0s depending on its position in the playlist + seperator + parents.join(seperator) + seperator + game name - where the parents and the game are the parents and name of the game this symlink is to)
        * `metadata.json`

## Additional Information
Multiple monitor support may be limited. GuyStation will aim to use the primary monitor.

## Known Issues
* Citra and Mupen64 flicker when hiding the screenshare message. As such, the message is not hidden when these emulators are in use and screenshare is started. It is made transparent, and click event are ignored on it.
* A program restart is required if you change the screen resolution or add, change primary, or remove monitors.
* PS2 can only have keyboard controls set with EZ configuration.
* NGC EZ configuration will set the device to the Dolphin internal name for a virtual keyboard when a control is set to a keyboard key (with the exception of the screenshot control) as Dolphin requires a device name with controls. It will set the device to gamepad when a control is set to a gamepad button/axis a gamepad. The custom version of Dolphin will recognize devices as game controllers if the evdev device name matches one of a set of keywords (gamepad, joystick, controller, joypad). Other devices are recognized as keyboards. This system isn't perfect.
* EZ Controller Configuration only allows the left version of buttons (control, alt, shift, etc.)
* PSP maps button names to PSP controls rather than numbers. Names can be different per controller, which can be nice. However, you have to have the mapping (number to name) for the controller listed for it to work properly. PPSSPP itself can do a little better at guessing button names, I believe with the help of the generic controller mapping of the controller plugged in, but we can't get this with the HTML5 Gamepad API. The best we can do is apply a default which likely won't be accurate. Add a controller mapping to `~/ppsspp/assets/gamecontrollerdb.txt` if your controller is not recognized.
* EZ Config missing print screen and keys around the numpad (+, -, etc.).
* In addition to the keys that aren't supported on all emulators through EZ Controller Configuration, EZ Controller Configuration does not allow Shift, Ctrl, Alt, and Meta for Citra, Pause, Scroll Lock, Caps Lock, Shift, Ctrl, Alt, and Meta for PCSX2 Hotkeys, and the F keys, Numpad keys, Pause, Scroll Lock, Caps Lock, and Meta for VBAM.
* Mobile Virtual Controller Keycode options don't extend beyond main keyboard area, F keys, and arrow keys.
* The resolution is incorrect for a PIP video for N64.
* PC games that install won't work in Samba mode unless the installed directory for Wine programs is also mapped.
* m64py changes the Mupen64Plus dimensions when you use it.

## Credits and Special Thanks
* Game Boy Advance and DS Lite icons: [David Pérez](https://thenounproject.com/david730/)
* Nintendo 64 icon: [Guilherme Simoes](https://thenounproject.com/uberux/)
* Gamecube icon: [Aaron Benjamin](https://thenounproject.com/aaron.benjamin/)
* PS2 icon: [Icon-Library.net](https://icon-library.net/icon/playstation-controller-icon-5.html)
* 3DS icon: [Sweet Design, Man](https://www.iconfinder.com/sweetdesignman)
* WiiMote icon: [Jon Koop](https://www.iconfinder.com/Koop_Designs)
* Internet icon: [flaticon.com](https://www.flaticon.com/)
* PSP icon: [Guilherme Simoes](https://icons-for-free.com/icons-author-Guilherme+Simoes/)
* SNES icon: [Icon-Library.net](https://icon-library.net/icon/nintendo-controller-icon-14.html)
* NES icon: [Icon-Library.net](https://icon-library.net/icon/nes-icon-22.html)
* Keyboard icon: [Yorlmar Campos](https://thenounproject.com/Yorlmar%20Campos/)
* Game Boy Advance emulator: [VisualBoyAdvance-m](https://vba-m.com/)
* DS emulator: [DeSmuMe](http://desmume.org/)
* Nintendo 64 emulator: [Mupen64Plus](https://mupen64plus.org/)
* Gamecube/Wii emulator: [Dolphin](https://dolphin-emu.org/)
* PS2 emulator: [PCSX2](https://pcsx2.net/)
* 3DS emulator: [Citra](https://citra-emu.org/)
* PSP emulator: [PPSSPP](https://www.ppsspp.org/)
* SNES emulator: [Snes9X](http://www.snes9x.com/)
* NES emulator: [FCEUX](http://www.fceux.com/)
* PC player: [Wine](https://www.winehq.org/)
* Menu Icons: [Font Awesome](https://fontawesome.com/)
* Blinker font: [Juergen Huber](https://fonts.google.com/specimen/Blinker)
* Toy Train font: [West Winds Fonts](https://www.dafont.com/west-wind-fonts.d361)
* The many contributors to the Node packages used in this project
