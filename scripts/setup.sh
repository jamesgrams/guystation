# Setup script for Ubuntu
# Clone guystation in your home directory and run this.

# Switch to home directory
cd ~

# Install nodejs
sudo apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo sh
sudo apt-get -y install nodejs
sudo npm install -g npm@latest --force

# Install git
# They probably already have it installed to have the repository on their computer, but they might not
sudo apt-get -y install git

# Install dependencies needed to desmume
sudo apt-get -y install build-essential autoconf automake libgtk2.0-dev libglu1-mesa-dev libsdl1.2-dev libglade2-dev gettext zlib1g-dev libosmesa6-dev intltool libagg-dev libasound2-dev libsoundtouch-dev libpcap-dev default-jdk

# Install DeSmuME
# https://wiki.desmume.org/index.php?title=Installing_DeSmuME_from_source_on_Linux
git clone https://github.com/jamesgrams/desmume.git
cd desmume/desmume/src/frontend/posix/
sudo ./autogen.sh
# Remove Windows Line Breaks from the file
sudo sh -c "awk 'gsub(/\r/,\"\"){printf $0;next}{print}' configure > tmp && mv tmp configure"
sudo chmod 755 ./configure
sudo ./configure
sudo make install

# Return to the home directory
cd ~

# Install VisualBoyAdvance
mkdir src && cd src
git clone https://github.com/jamesgrams/visualboyadvance-m.git
cd visualboyadvance-m
./installdeps
mkdir -p build && cd build
cmake ..
make
sudo cp ~/src/visualboyadvance-m/build/visualboyadvance-m /usr/bin/

# Install dependecies for window management
sudo apt-get -y install wmctrl

# Return to the home directory
cd ~

# Install Mupen64
./guystation/scripts/m64p_helper_scripts/m64p_get.sh && ./guystation/scripts/m64p_helper_scripts/m64p_build.sh && ./guystation/scripts/m64p_helper_scripts/m64p_test.sh

# install the necessary modules for guystation
cd guystation
npm install
cd ..

# Disable Chromium Infobars
sudo mkdir -p /etc/chromium/policies/managed
sudo sh -c "echo '{\"CommandLineFlagSecurityWarningsEnabled\": false}' > /etc/chromium/policies/managed/policy.json"

# Setup autostart
mkdir -p ~/.config/autostart
bash -c "echo -e \"[Desktop Entry]\nType=Application\nExec=sudo npm --prefix=~/guystation start\nHidden=false\nX-GNOME-Autostart-enabled=true\nName=GuyStation\" > ~/.config/autostart/guystation.desktop"

# Don't require password for sudo
sudo bash -c "echo -e \"\n\n$USER ALL=(ALL) NOPASSWD: ALL\" >> /etc/sudoers"