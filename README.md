# GuyStation
An Emulator Hub for Ubuntu. This is a small frontend for emulators designed to be easily installable and acessible on Ubuntu. Its major highlights include the ability to create seperate save files for the same game and to access the GUI from any web-capable device to easily make changes to your library.

# Run
GuyStation is designed to run on Ubuntu (and to basically be the sole purpose of the machine). The steps to get it running are as follows:
1. Clone this repository into your home directory
2. `cd` into this repository
3. Run `./setup.sh`
4. Restart your computer, and GuyStation should boot automatically.
5. Connect and setup any controllers or other devices that you want to use to control the emulators.
6. Add games and have fun! You should be able to access the GuyStation frontend on any device within the same network by going to the IP that GuyStation displays in your browser.

Note: You can press F11 to get GuyStation out of full screen mode at any time. 

# Recommendations
Here are some recommendedations to make your experience better on Ubuntu.
1. Disable screen lock in settings
2. Use a Bluetooth adapater and install Bluetooth Manager (`sudo apt-get install blueman`)
3. For Wii/Wii U Controllers use xwiimote (`sudo apt-get install xwiimote`)
4. To map controller buttons to keyboard keys, use [Antimicro](https://github.com/AntiMicro/antimicro).
    * To build on Ubuntu, in addition to followin the instructions in the project's README, you will need the following libraries:
        * `sudo apt-get install libqt4-dev libqt4-dev-bin libqt4-opengl-dev libqtwebkit-dev qt4-linguist-tools qt4-qmake`
    * My controller configuration for my Wii U Pro Controller can be found in the `/helper` directory.
5. I link to link my sync my saves with Google Drive (Get on Ubuntu with google-drive-ocamlfuse), so I can play the same game on GuyStation and GBA4iOS (Currently, the Tela fork Beta supports Google Drive). To do this, with GuyStation closed, create a symbolic link from the save file to a save file in the GuyStation tree (or the folder containing the save file). See the tree below for more details.
    * Note: the Tela fork will only download your save file if there is no save on your device. As such, you'll only want to turn on Sync when you want to download or upload your save, and you should delete the game from your iPhone before you download. Then, when you turn on sync, Tela will detect the game isn't there and re-download the game and the save.
    * After uploading from Tela, you will have to remount Google Drive or just restart the computer to get the symbolic links to work, since Google Drive will append a suffix to the name to indicate there was a change from another device.
6. Use unclutter (`sudo apt-get install unclutter` and `unclutter -idle 2 -root`) to hide the mouse after 2 seconds.
7. For easy pairing, I use a script that tries to automatically connect with my controller every couple seconds. I've set this script to run on startup. I also use an Ubuntu Keyboard Shortcut to run a script that disconnects my controller on keypress (and then restarts the program looking for the controller). I use antimicro to map some buttons on my controller to the keys in the keyboard shortcut, so I can disconnect the controller when I'm not using it. My connect and disconnect scripts can be found in `/helper/controller_connect.sh` and `/helper/controller_disconnect.sh` respectively.
8. Disable `apport`, so you don't have to deal with crash menu popups.
9. Several of the programs mentioned above are good to have run on startup. To do this, create a file in `~/.config/autocontrol/` - the setup script should already set one up for guystation itself.
    * The `/helper/autocontrol` directory contains example scripts for antimicro (with hidden GUI), google-drice-ocamlfuse, and the controller_connect script. 

# Controls
You can use the arrow keys to control the menu, and enter to start a game. Escape will return to the menu from a game, and holding escape for 5 seconds will quit a game (once you're already on the menu). Escape will also quit a modal in the menu. Adding games and performing similar functions are best done with a mouse (The UI is in a web browser though, so you can access the buttons however you normally would).


# Technical Notes
GuyStation launches a Node.js server along with a Chromium browser (via Puppeteer) that automatically navigates to a web page that allows you to interact with the server. This same page can be accessed by going to the IP address listed on the page in any web capable device.

# File Structure for Systems Directory
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