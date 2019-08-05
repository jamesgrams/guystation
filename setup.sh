# Setup script for Ubuntu

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
sudo apt-get -y install build-essential autoconf automake libgtk2.0-dev libglu1-mesa-dev libsdl1.2-dev libglade2-dev gettext zlib1g-dev libosmesa6-dev intltool libagg-dev libasound2-dev libsoundtouch-dev libpcap-dev

# Install DeSmuME
# https://wiki.desmume.org/index.php?title=Installing_DeSmuME_from_source_on_Linux
git clone https://github.com/jamesgrams/desmume.git
cd desmume/desmume/src/frontend/posix/
./autogen.sh
# Remove Windows Line Breaks from the file
awk 'gsub(/\r/,""){printf $0;next}{print}' configure > tmp && mv tmp configure
./configure
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

# Install dependecies for window management
sudo apt-get -y install wmctrl