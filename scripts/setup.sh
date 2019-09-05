# Setup script for Ubuntu
# Clone guystation in your home directory and run this.
# Run this as your user, not root

# Switch to home directory
cd ~
# Update the metadata for PS2 to include the user's home directory
sed -i "s/james/$USER/g" ~/guystation/systems/ps2/metadata.json
# Update the metadata for PSP to include the user's home directory
sed -i "s/james/$USER/g" ~/guystation/systems/psp/metadata.json

# Install nodejs
sudo apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo sh
sudo apt-get -y install nodejs
sudo npm install -g npm@latest --force

# Install git
# They probably already have it installed to have the repository on their computer, but they might not
sudo apt-get -y install git

# Install dependencies needed
DEP_64="build-essential autoconf cmake automake libgtk2.0-dev libglu1-mesa-dev libsdl1.2-dev libglade2-dev gettext zlib1g-dev libosmesa6-dev intltool libagg-dev libasound2-dev libsoundtouch-dev libpcap-dev default-jdk libboost-filesystem-dev libevdev-dev qt5-default qtbase5-private-dev libbluetooth-dev gcc gcc-multilib g++ g++-multilib python-pyqt5 pyqt5-dev-tools python-pyqt5.qtopengl libsdl2-dev python-setuptools libwxbase3.0-dev wx-common libgtk-3-dev libwxbase3.0-dev libwxgtk3.0-dev libwxgtk3.0-gtk3-dev wx-common python-sdl2 qtbase5-dev libqt5opengl5-dev qtmultimedia5-dev libjack-dev libvulkan-dev libgl1-mesa-dev qttools5-dev-tools qt5-qmake"
sudo apt-get -y install $DEP_64

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
./guystation/scripts/m64p_helper_scripts/m64p_get.sh && ./guystation/scripts/m64p_helper_scripts/m64p_build.sh && ./guystation/scripts/m64p_helper_scripts/m64p_install.sh
cd ~
git clone https://github.com/jamesgrams/mupen64plus-ui-python.git
cd mupen64plus-ui-python
python setup.py build
sudo python setup.py install

# Return to the home directory
cd ~

# Install Dolphin
git clone https://github.com/jamesgrams/dolphin.git
cd dolphin
mkdir build && cd build
cmake ..
make
sudo make install

# Return to the home directory
cd ~

# Install Citra
git clone --recursive https://github.com/jamesgrams/citra.git
cd citra
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make
sudo make install

# Return to the home directory
cd ~

# Instal PPSSPP
git clone --recursive https://github.com/jamesgrams/ppsspp.git
cd ppsspp
./b.sh --qt

# Return to the home directory
cd ~

# Install PCSX2
# Note, we need to use some 32 bit libraries for PCSX2 - some will overwrite the 64 bit libraries
# So, we need to install PCSX2 last
sudo apt-get -y remove libsoundtouch-dev:amd64
sudo apt-get -y install libaio-dev:i386 libbz2-dev:i386 libcggl:i386 libegl1-mesa-dev:i386 libglew-dev:i386 libgles2-mesa-dev libgtk2.0-dev:i386 libjpeg-dev:i386 libsdl1.2-dev:i386 libsoundtouch-dev:i386 libwxgtk3.0-dev:i386 nvidia-cg-toolkit portaudio19-dev:i386 zlib1g-dev:i386 libsdl2-dev:i386 libjack-jackd2-dev:i386 libportaudiocpp0:i386 portaudio19-dev:i386 liblzma-dev:i386 
git clone https://github.com/jamesgrams/pcsx2.git
cd pcsx2
sudo ./build.sh
# Reinstall 64 bit dependencies except libportaudio2:i386 (ps2 needs it) which is removed by libjack-dev for 3ds (3ds no longer needs it)
sudo apt-get -y remove libsdl2-dev:i386 libsoundtouch-dev:i386
sudo apt-get -y install $DEP_64
sudo apt-get -y install libportaudio2:i386

# Return to the home directory
cd ~

# install the necessary modules for guystation
cd guystation
npm install
cd ..

# install google chrome so we can watch video in the browser
cd /tmp
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb

# Disable Chromium Infobars
sudo mkdir -p /etc/chromium/policies/managed
sudo sh -c "echo '{\"CommandLineFlagSecurityWarningsEnabled\": false}' > /etc/chromium/policies/managed/policy.json"

# Disable Chrome Infobars
sudo mkdir -p /etc/opt/chrome/policies/managed
sudo sh -c "echo '{\"CommandLineFlagSecurityWarningsEnabled\": false}' > /etc/opt/chrome/policies/managed/policy.json"

# Setup autostart
mkdir -p ~/.config/autostart
bash -c "echo -e \"[Desktop Entry]\nType=Application\nExec=sudo npm --prefix=~/guystation start\nHidden=false\nX-GNOME-Autostart-enabled=true\nName=GuyStation\" > ~/.config/autostart/guystation.desktop"

# Don't require password for sudo
sudo bash -c "echo -e \"\n\n$USER ALL=(ALL) NOPASSWD: ALL\" >> /etc/sudoers"
