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