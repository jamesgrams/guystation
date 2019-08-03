# GuyStation
An Emulator Hub

# Run
Note: You need to run this from the top level of this repo.
Make sure the file system is set up appropriately (see below)
`npm install`
`npm start`

# Add a game
Create the directory `systems/<desired_system>/games/<game_name>`. Place the ROM inside this directory.

# File Structure for Systems Directory
* systems
    * `<system>` (d)
        * emulator (d) - you may have to make this directory
        * games (d)
            * `<game>` (d)
                * <ROM>
                * saves (d)
                    * `<save>` (d)
                        * `<save file>`
                        * screenshots (d)
                            * `<screenshot>`
                    * current (d) - symlink to the current save directory

# Helpful Hints
To exit fullscreen on Mac in VirtualBoyAdvance, press Cmd+Ctrl+F

# Notes
VirtualBoyAdvance Version = 2.1.1
https://github.com/visualboyadvance-m/visualboyadvance-m/releases
https://github.com/visualboyadvance-m/visualboyadvance-m/commit/b5741ee4f6351ccc3500a7341f4796720b22e40b