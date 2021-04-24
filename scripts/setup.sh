#!/bin/bash

# Setup script for Ubuntu
# Clone guystation in your home directory and run this.
# Run this as your user, not root

TYPE="quick"
if [ $# -eq 1 ]
then
    TYPE=$1
fi

# Don't require password for sudo
sudo bash -c "echo -e \"\n\n$USER ALL=(ALL) NOPASSWD: ALL\" >> /etc/sudoers"

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

# when running the pre-built setup, they will just download this file directly and run it.
if [ $TYPE != "complete" ]
then
    cd ~
    sudo apt-get install -y libsfml-dev # vbam and dolphin
    sudo apt-get install -y libavdevice57 # dolphin
    git clone https://github.com/jamesgrams/guystation
    # Get the pre-built emulators
    # Store in website rather than releases in case the installtion method ever changes - easier to change
    wget https://github.com/jamesgrams/guystation/releases/download/v2.0/guystation-builds.zip
    unzip guystation-builds.zip
    cd guystation-builds
    sudo mv citra-qt /usr/local/bin/
    sudo mv citra /usr/local/bin/
    sudo mv dolphin-emu /usr/local/bin/
    sudo mv dolphin-emu-nogui /usr/local/bin/
    sudo mv desmume /usr/local/bin/
    sudo mv fceux /usr/local/bin/
    sudo mv m64py /usr/local/bin/
    sudo mv m64py-0.2.5-py2.7.egg /usr/local/lib/python2.7/dist-packages/
    #sudo mv mupen64plus /usr/local/bin/
    #sudo mv mupen64plus-lib /usr/local/lib/mupen64plus
    #sudo mv libmupen64plus.so.2.0.0 /usr/local/lib/
    #cd /usr/local/lib
    #sudo ln -s libmupen64plus.so.2.0.0 libmupen64plus.so.2
    cd ~/guystation-builds
    sudo mv snes9x-gtk /usr/local/bin/
    sudo mv visualboyadvance-m /usr/bin/
    mkdir ~/ppsspp
    mkdir ~/ppsspp/build
    mv assets ~/ppsspp/build/
    cp -r ~/ppsspp/build/assets ~/ppsspp/assets
    mv PPSSPPQt ~/ppsspp/build/
    mkdir ~/pcsx2
    mv bin ~/pcsx2/
    mkdir ~/blastem
    mv blastem ~/blastem/
    mv default.cfg ~/blastem/
    mv rom.db ~/blastem/
    mv shaders ~/blastem/shaders
    cd ~
fi

# Install dependencies needed
# Build tools are needed for most items, jdk is needed for some system control from node as is xdotool
DEP_GENERAL="build-essential autoconf cmake automake default-jdk gcc gcc-multilib g++ g++-multilib xdotool nasm onboard ffmpeg dosbox"
DEP_FCEUX="libxtst-dev libpng++-dev scons"
DEP_DESMUME="libgtk2.0-dev libglu1-mesa-dev libsdl1.2-dev libglade2-dev gettext zlib1g-dev libosmesa6-dev intltool libagg-dev libasound2-dev libsoundtouch-dev libpcap-dev"
DEP_VBAM="" # installed by vbam
DEP_MUPEN="libboost-filesystem-dev python-pyqt5 pyqt5-dev-tools python-pyqt5.qtopengl libsdl2-dev python-setuptools python-sdl2"
DEP_DOLPHIN="libevdev-dev qt5-default qtbase5-private-dev libbluetooth-dev libwxbase3.0-dev wx-common libgtk-3-dev libwxbase3.0-dev libwxgtk3.0-dev libwxgtk3.0-gtk3-dev libegl1-mesa-dev"
DEP_CITRA="qtbase5-dev libqt5opengl5-dev libjack-dev qtmultimedia5-dev doxygen"
DEP_PPSSPP="libvulkan-dev libgl1-mesa-dev qttools5-dev-tools qt5-qmake"
DEP_SNES9X="libglib2.0-dev gawk libxml2-dev libxv-dev libpulse-dev portaudio19-dev meson ninja-build minizip"
DEP_BLASTEM="libglew-dev"
DEP_64="$DEP_GENERAL $DEP_FCEUX $DEP_DESMUME $DEP_VBAM $DEP_MUPEN $DEP_DOLPHIN $DEP_CITRA $DEP_PPSSPP $DEP_SNES9X $DEP_BLASTEM"
sudo apt-get -y install $DEP_64

# Install FCEUX
if [ $TYPE == "complete" ]
then
    git clone https://github.com/jamesgrams/fceux.git
    cd fceux
    scons
    sudo scons install
fi


# Return to the home directory
cd ~

# Install DeSmuME
# https://wiki.desmume.org/index.php?title=Installing_DeSmuME_from_source_on_Linux
if [ $TYPE == "complete" ]
then
    git clone https://github.com/jamesgrams/desmume.git
    cd desmume/desmume/src/frontend/posix/
    sudo ./autogen.sh
    # Remove Windows Line Breaks from the file
    sudo sh -c "awk 'gsub(/\r/,\"\"){printf $0;next}{print}' configure > tmp && mv tmp configure"
    sudo chmod 755 ./configure
    sudo ./configure
    sudo make install
fi


# Return to the home directory
cd ~

# Install VisualBoyAdvance
if [ $TYPE == "complete" ]
then
    mkdir src && cd src
    git clone https://github.com/jamesgrams/visualboyadvance-m.git
    cd visualboyadvance-m
    ./installdeps
    mkdir -p build && cd build
    cmake ..
    make
    sudo cp ~/src/visualboyadvance-m/build/visualboyadvance-m /usr/bin/
fi


# Install dependecies for window management
sudo apt-get -y install wmctrl

# Return to the home directory
cd ~

# Install Mupen64
sudo ./guystation/scripts/m64p_helper_scripts/m64p_get.sh && sudo ./guystation/scripts/m64p_helper_scripts/m64p_build.sh && sudo ./guystation/scripts/m64p_helper_scripts/m64p_install.sh
if [ $TYPE == "complete" ]
then
    git clone https://github.com/jamesgrams/mupen64plus-ui-python.git
    cd mupen64plus-ui-python
    python setup.py build
    sudo python setup.py install
fi

# Return to the home directory
cd ~

# Install Dolphin
if [ $TYPE == "complete" ]
then
    git clone https://github.com/jamesgrams/dolphin.git
    cd dolphin
    mkdir build && cd build
    cmake ..
    make
    sudo make install
fi

# Return to the home directory
cd ~

# Install Citra
if [ $TYPE == "complete" ]
then
    git clone --recursive https://github.com/jamesgrams/citra.git
    cd citra
    git submodule update --init --recursive
    mkdir build && cd build
    cmake .. -DCMAKE_BUILD_TYPE=Release
    make
    sudo make install
fi

# Return to the home directory
cd ~

# Install PPSSPP
if [ $TYPE == "complete" ]
then
    git clone --recursive https://github.com/jamesgrams/ppsspp.git
    cd ppsspp
    ./b.sh --qt
fi

# Return to the home directory
cd ~

# Install snes9x
if [ $TYPE == "complete" ]
then
    git clone https://github.com/jamesgrams/snes9x.git
    cd snes9x/gtk
    meson builddir
    cd builddir
    ninja
    sudo ninja install
fi

# Return to the home directory
cd ~

# Install blastem
if [ $TYPE == "complete" ]
then
    git clone https://github.com/jamesgrams/blastem
    cd blastem
    make
fi


# Return to the home directory
cd ~

# Install PCSX2
# Note, we need to use some 32 bit libraries for PCSX2 - some will overwrite the 64 bit libraries
# So, we need to install PCSX2 last
sudo apt-get -y remove libsoundtouch-dev:amd64 libmirclient-dev:amd64
# These are the libraries needed by PCSX2
sudo apt-get -y install libaio-dev:i386 libbz2-dev:i386 libcggl:i386 libegl1-mesa-dev:i386 libglew-dev:i386 libgles2-mesa-dev libgtk2.0-dev:i386 libjpeg-dev:i386 libsdl1.2-dev:i386 libsoundtouch-dev:i386 libwxgtk3.0-dev:i386 nvidia-cg-toolkit portaudio19-dev:i386 zlib1g-dev:i386 libsdl2-dev:i386 libjack-jackd2-dev:i386 libportaudiocpp0:i386 liblzma-dev:i386 libpango1.0-dev:i386
if [ $TYPE == "complete" ]
then
    git clone https://github.com/jamesgrams/pcsx2.git
    cd pcsx2
    sudo ./build.sh
fi
# Reinstall 64 bit dependencies except libportaudio2:i386 (ps2 needs it) which is removed by libjack-dev for 3ds (3ds no longer needs it)
sudo apt-get -y remove libsdl2-dev:i386 libsoundtouch-dev:i386 libmirclient-dev:i386
sudo apt-get -y install $DEP_64
sudo apt-get -y install libportaudio2:i386

# Return to the home directory
cd ~

# Install Wine
wget -nc https://dl.winehq.org/wine-builds/winehq.key
sudo apt-key add winehq.key
sudo apt-add-repository 'deb https://dl.winehq.org/wine-builds/ubuntu/ bionic main'
sudo apt update
wget -nc https://download.opensuse.org/repositories/Emulators:/Wine:/Debian/xUbuntu_18.04/amd64/libfaudio0_19.07-0~bionic_amd64.deb
wget -nc https://download.opensuse.org/repositories/Emulators:/Wine:/Debian/xUbuntu_18.04/i386/libfaudio0_19.07-0~bionic_i386.deb
sudo apt install -y ./libfaudio0_19.07-0~bionic_amd64.deb
sudo apt install -y ./libfaudio0_19.07-0~bionic_i386.deb
rm ./libfaudio0_19.07-0~bionic_amd64.deb
rm ./libfaudio0_19.07-0~bionic_i386.deb
sudo apt install -y --install-recommends winehq-stable
sudo rm -rf ~/.wine || true
sudo mkdir ~/.wine

# Return to the home directory
cd ~

# Make sure nodjs is installed
sudo apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo sh
sudo apt-get -y install nodejs
sudo npm install -g npm@latest --force

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
bash -c "ln -s ~/guystation/helper/autostart/guystation.desktop ~/.config/autostart/guystation.desktop"

# Add icon
mkdir -p ~/.icons
bash -c "ln -s ~/guystation/assets/icons/android-icon-192x192.png ~/.icons/guystation.png"
bash -c "ln -s ~/guystation/helper/autostart/guystation.desktop ~/.local/share/applications/guystation.desktop"