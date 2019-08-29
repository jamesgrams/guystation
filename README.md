# GuyStation
An Emulator Hub for Ubuntu. This is a small frontend for emulators designed to be easily installable and accessible on Ubuntu. Its major highlights include the ability to create seperate save files for the same game and to access the GUI from any web-capable device to easily make changes to your library.

## Run
GuyStation is designed to run on Ubuntu (and to basically be the sole purpose of the machine). The steps to get it running are as follows:
1. Clone this repository into your home directory
2. `cd` into this repository
3. Run `./scripts/setup.sh`
4. Restart your computer, and GuyStation should boot automatically.
5. Connect and setup any controllers or other devices that you want to use to control the emulators.
6. Add games and have fun! You should be able to access the GuyStation frontend on any device within the same network by going to the IP that GuyStation displays in your browser.

Note: You can press F11 to get GuyStation out of full screen mode at any time. 

## Supported Systems
* Game Boy
* Game Boy Color
* Game Boy Advance
* Nintendo DS
* Nintendo 3DS
* Nintendo 64
* Nintendo GameCube
* Wii
* PlayStation 1
* PlayStation 2

## Recommendations
Here are some recommendedations to make your experience better on Ubuntu.
1. Disable screen lock in settings
2. Use a Bluetooth adapater and install Bluetooth Manager (`sudo apt-get install blueman`)
    * This is good for initially pariring your controller.
3. For Wii/Wii U Controllers use xwiimote (`sudo apt-get install xwiimote`)
4. To map controller buttons to keyboard keys, use [Antimicro](https://github.com/AntiMicro/antimicro).
    * To build on Ubuntu, in addition to followin the instructions in the project's README, you will need the following libraries:
        * `sudo apt-get install libqt4-dev libqt4-dev-bin libqt4-opengl-dev libqtwebkit-dev qt4-linguist-tools qt4-qmake`
    * The configuration for my Wii U Pro Controller can be found in the `/helper` directory.
5. I sync my saves with Google Drive (Get on Ubuntu with google-drive-ocamlfuse - you'll have to mount as root), so I can play the same game on GuyStation and GBA4iOS (Currently, the Tela fork Beta supports Google Drive). To do this, with GuyStation closed, create a symbolic link from the save file (in the Google Drive mount) to a save file in the GuyStation tree (or the folder containing the save file). See the tree below for more details.
    * Note: the Tela fork will only download your save file if there is no save on your device. As such, you'll only want to turn on Sync when you want to download or upload your save, and you should delete the game from your iPhone before you download. Then, when you turn on sync, Tela will detect the game isn't there and re-download the game and the save.
    * After uploading from Tela, you will have to remount Google Drive or just restart the computer to get the symbolic links to work, since Google Drive will append a suffix to the name to indicate there was a change from another device. There is a helper script located in `/helper/remount_drive.sh` that you can use as a starting point to do this. You might want to map it to a keyboard shortcut and then map some controller keys to that shortcut.
6. Use unclutter (`sudo apt-get install unclutter` and `unclutter -idle 2 -root`) to hide the mouse after 2 seconds.
7. For easy controller connecting, I use a script that tries to automatically connect with any paired controller (I use Bluetooth Manager to initially pair) every couple seconds. I've set this script to run on startup. I also use an Ubuntu Keyboard Shortcut to run a script that disconnects my controller on keypress (and then restarts the program looking for the controller). I use Antimicro to map some buttons on my controller to the keys in the keyboard shortcut, so I can disconnect the controller when I'm not using it. My connect and disconnect scripts can be found in `/helper/controller_connect.sh` and `/helper/controller_disconnect.sh` respectively. You will need the `bluetoothctl` program.
    * You'll have to kill this script when you add a new controller, I've found.
8. Disable `apport`, so you don't have to deal with crash menu popups.
9. Several of the programs mentioned above are good to have run on startup. To do this, create a file in `~/.config/autocontrol/` - the setup script should already set one up for guystation itself.
    * The `/helper/autocontrol` directory contains example scripts for antimicro (with hidden GUI), google-drice-ocamlfuse, and the controller_connect script. 

## Emulator Specific Setup
For all emulators, you will have to setup your controller(s).

### VBA-M (Game Boy Advance)
This emulator doesn't change the default screenshot key to be S/Ctrl+S like most others, mainly because you can set the screenshot key to a joystick button. Feel free to set it accordingly when you set up your controller.
Personally, I use the same controller button that I have mappend to Ctrl+S in Antimicro, so the same button takes screenshots in all emulators. As such, in the future the default may be changed to Ctrl+S as I see little downside in going through Antimicro.

### Mupen64Plus (Nintendo 64)
You may need to change the Video Plugin for Mupen64Plus. It defaults to `mupen64plus-video-rice.so`, and I changed it to `mupen64plus-video-glide64.so` to work properly on my machine. You can change it in the mupen64 configuration file created after the first time you start Mupen64Plus in `~/.config/mupen64plus/mupen64plus.cfg`.
    * I also had to edit the controller configuration. Mupen64Plus is good at autodetecting controllers, but I had to change the Analog Peak, since the analog stick was too sensitive. If you do this, be sure to set the "mode" for the controller to 0, so your settings do not get overwritten.
    * This version of Mupen64Plus changes the quit key to F15 rather than Escape (since Escape takes you home) and sets the screenshot key to "S" by default (In DesMuME, the screenshot key is Ctrl+S, so mapping a button to Ctrl+S will allow you to take screenshots in both).
    * Guystation will install M64Py, a frontend for Mupen64Plus, but will not use it due to it having problems with Fullscreen. You can still use it to esily configure settings, however. It can be opened by running m64py in the command line.

### Dolphin (Gamecube/Wii)
The version of Dolphin used changes the default screenshot key to Ctrl+S, and the quit key to Delete+F12.

### PXSX2 (PS2)
The version of PCSX2 changes the default screenshot key to S. In addition, you will have to run PCSX2 once to get it set up first (you can do that by running `/home/*/pcsx2/bin/PCSX2` in the command line). The main configuration you will have to make is providing PS2 BIOS. You can look more into how this can be acheived online.
    * The configuration options for PCSX2 are extensive. You might want to play around with them to try to get as little lag as possible.

### Citra (3DS)
The version of Citra changes the default screenshot key to Ctrl+S, the default toggle status bar key to Ctrl+P, and the default exit full screen key to F12. In addition, this version removes the prompt that asks you for a screenshot file name and simply uses the current timestamp as the name. When Citra first starts up, it will ask if you want to send data to the Citra team for debugging. Finally, there are some points within games where you might have to do something that usually would interact with shared 3DS data such as select a Mii. Citra handles this nicely and shows a dialog box. You'll likely have to use a mouse to navigate these, however. 

## Backwards Compatibility
Some emulators have Backwards compability. From what I understand, VisualBoyAdvance-M supports Game Boy Color and Game Boy Games (like the Game Boy Advance), and PCSX2 supports PS1 games (like the Playstation 2). Dolphin could be thought of as a Wii emulator with backwards compability for the GameCube (like the Wii), however they are two seperate menu options since the Wii requires some extra commands due to the structure it uses for save games. Citra does not support DS games.

## Controls
You can use the arrow keys to control the menu, and enter to start a game. Escape will return to the menu from a game, and holding escape for 2.5 seconds will quit a game (once you're already on the menu). Escape will also quit a modal in the menu, and it will snap you to the game you are currently playing if there is one. Adding games and performing similar functions are best done with a mouse (The UI is in a web browser though, so you can access the buttons however you normally would). You can also use a game controller. The D-Pad and left analog stick will move the menu, A or Start will start a game, and the left and right triggers will cycle through saves. You can configure the Joypad controls by opening the menu, clicking "Joypad Config", and then selecting the field for the input you want (e.g. "Start", "Left Trigger", etc.) and pressing the button on the Joypad that you want to use. To restore to default, you should clear local storage in Chrome.

You will want to use Antimicro to map home (or some other button) to the escape key. I also map the right analog stick press to Ctrl+S in Antrimicro to use for screenshots (See above for what emulators you need to update the settings in). Beyond that, you can see my helper scripts mentioned above. I have some button combinations mapping to key combinations which are shortcuts for remounting Google Drive and disconnecting the controller. You should manually configure the emulators to have the control scheme you want for your controllers.

## Technical Notes
GuyStation launches a Node.js server along with a Chromium browser (via Puppeteer) that automatically navigates to a web page that allows you to interact with the server. This same page can be accessed by going to the IP address listed on the page in any web capable device.

## File Structure for Systems Directory
* `systems`
    * `<system>` (d)
        * `games` (d)
            * `<game>` (d)
                * `<ROM>`
                * `saves` (d)
                    * `<save>` (d)
                        * `<save file>`
                        * `screenshots` (d)
                            * `<screenshot>`
                    * `current` (d) - symlink to the current save directory
                * `metadata.json`
        * `metadata.json`

## Credits and Special Thanks
* Game Boy Advance and DS Lite icons: [David Pérez](https://thenounproject.com/david730/)
* Nintendo 64 icon: [Guilherme Simoes](https://thenounproject.com/uberux/)
* Gamecube icon: [Aaron Benjamin](https://thenounproject.com/aaron.benjamin/)
* PS2 icon: [Icon-Library.net](https://icon-library.net/icon/playstation-controller-icon-5.html)
* 3DS icon: [Sweet Design, Man](https://www.iconfinder.com/sweetdesignman)
* WiiMote icon: [Jon Koop](https://www.iconfinder.com/Koop_Designs)
* Internet icon: [flaticon.com](https://www.flaticon.com/)
* Game Boy Advance emulator: [VisualBoyAdvance-m](https://vba-m.com/)
* DS emulator: [DeSmuMe](http://desmume.org/)
* Nintendo 64 emulator: [Mupen64Plus](https://mupen64plus.org/)
* Gamecube/Wii emulator: [Dolphin](https://dolphin-emu.org/)
* PS2 emulator: [PCSX2](https://pcsx2.net/)
* 3DS emulator: [Citra](https://citra-emu.org/)
