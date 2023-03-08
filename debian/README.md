## all
```
sudo apt install build-essential
sudo apt install cmake
sudo apt install autoconf
sudo apt install libssl-dev
sudo apt install libreadline-dev

cd /lib/x86_64-linux-gnu/
sudo ln -s libreadline.so.8.1 libreadline.so.6

sudo apt install python2
cd /usr/bin/
sudo ln -s python2.7 python
```

## fix dpkg

sudo dpkg --force depends -P libglib2.0-0:i386
sudo apt autoremove
sudo apt clean
sudo dpkg --configure -a
sudo apt-get install -f

vi /etc/apt/source.list

```
deb http://mirrors.aliyun.com/debian/ buster main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster main non-free contrib
deb http://mirrors.aliyun.com/debian-security buster/updates main
deb-src http://mirrors.aliyun.com/debian-security buster/updates main
deb http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
```

apt-get update
