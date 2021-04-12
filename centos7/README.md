## 申请centos7虚拟机，修改时区
```bash
timedatectl set-local-rtc 1 # 将硬件时钟调整为与本地时钟一致, 0 为设置为 UTC 时间
timedatectl set-timezone Asia/Shanghai # 设置系统时区为上海
timedatectl status
```

## 修改登录方式（可选）
用root登录虚拟机创建个人账户，并添加进组 wheel。
```
adduser xxx
passwd xxx
usermod -G wheel xxx
```
禁止root账户ssh登录，禁止 wheel 组以外的任何普通用户通过su命令提升成root用户。
```
修改 /etc/ssh/sshd_config 文件，修改“#PermitRootLogin yes”改为 “PermitRootLogin no”。
修改 /etc/pam.d/su 文件，找到“#auth required pam_wheel.so use_uid ”这一行，将行首的“#”去掉。
修改 /etc/login.defs 文件，在最后一行增加“SU_WHEEL_ONLY yes”语句。
```
重启sshd服务
```
service sshd restart
```
之后使用个人账户登录服务器。

是否配置ssh key登录看个人需求，不要禁掉个人账户密码登录，不然密钥丢失就麻烦了。
```
自己机器上生成ssh公钥私钥
公钥复制到 home/xxx/.ssh/authorized_keys 文件里
chmod 600 authorized_keys
chmod -R 700 .ssh
修改 /etc/ssh/sshd_config 文件，去掉注释“#RSAAuthentication yes”以及“#PubkeyAuthentication yes”
```

## ~~修改yum源为阿里的源~~（可选）经过实践还是清华的源比较好，直接用下面的清华源吧
```bash
cd /etc/yum.repos.d
sudo mv CentOS-Base.repo CentOS-Base.repo.bak
sudo wget -O CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
这里可以修改阿里云的 CentOS-Base.repo 文件，里面 baseurl 有三个地址，分别是

非阿里云机器： mirrors.aliyun.com 阿里云经典网络: mirrors.aliyuncs.com 阿里云VPC网络: mirrors.cloud.aliyuncs.com

内网保留非阿里云机器就可以了，后面两个地址是无法访问的
安装 epel 源
sudo yum install epel-release
sudo wget -O epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
修改 Centos-Base.repo 里 gpgcheck=1 为 gpgcheck=0
yum clean all
yum makecache
sudo yum -y update
update 这一步骤非常漫长，一定要注意不要中途用 ctrl+c 中止了，否则可能破坏 yum 命令，只能重装系统了。
```

## 清华源：<https://mirror.tuna.tsinghua.edu.cn/help/centos/>

## 升级 curl（可选）
```
sudo rpm -Uvh  http://www.city-fan.org/ftp/contrib/yum-repo/city-fan.org-release-2-1.rhel7.noarch.rpm
修改 /etc/yum.repos.d/city-fan.org.repo 去掉 baseurl 前的注释，gpgcheck=0
sudo yum update curl --enablerepo=city-fan.org -y
```

## 关闭firewall
```
systemctl stop firewalld.service
systemctl disable firewalld.service
```
## 关闭selinux
```
setenforce 0
修改配置文件 /etc/selinux/config，将 SELINUX 置为 disabled
```

## 安装必须的软件

* git <https://centos.pkgs.org/7/endpoint-x86_64/git-2.8.4-1.ep7.x86_64.rpm.html>
* mongo4.2  <https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/#configure-the-package-management-system-yum>
* python2
* lua5.4
* go  <https://golang.org/doc/install>
```
    新版本的go可以直接用go mod
    `export GO111MODULE=on`
    `export GOPROXY=https://goproxy.io`  设置代理方便下载，还不行就用七牛的 https://github.com/goproxy/goproxy.cn
    
    新版本安装
    rm -rf /usr/local/go
    tar -C /usr/local/ -xzf goxxx
```
* ~~iptraf & iftop~~


<https://packages.endpoint.com/rhel/7/os/x86_64/>
```
Download latest endpoint-release rpm from https://packages.endpoint.com/rhel/7/os/x86_64/
Install endpoint-release rpm:
rpm -Uvh endpoint-release*rpm
Install git rpm package:
yum install git
```

<https://github.com/nodesource/distributions>

<https://mirrors.ustc.edu.cn/help/nodesource.html#rhel>
```
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
nodesource源：修改 /etc/yum.repos.d/nodesource-*.repo 文件，将其中的所有 rpm.nodesource.com 替换为 mirrors.ustc.edu.cn/nodesource/rpm 即可
mongo源：修改 mongo官网源文件， repo.mongodb.org 替换为 mirrors.aliyun.com/mongodb 即可
npm加速：npm config set registry https://registry.npm.taobao.org
vi ~/.npmrc
registry=https://registry.npm.taobao.org
sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
phantomjs_cdnurl=http://npm.taobao.org/mirrors/phantomjs
electron_mirror=http://npm.taobao.org/mirrors/electron/  (特别针对electron加一下，因为我经常用)
```

## 系统能够打开的句柄数量受3个层次限制，系统级 fs.fs_max，进程级 fs.nr_open，用户级 nofile
### 修改用户进程文件句柄限制和core文件大小1G
```bash
vi /etc/security/limits.conf
```

    *        soft  nofile  6553500
    *        hard  nofile  6553500
    *        soft  nproc  6553500
    *        hard  nproc  6553500
    *        soft  core  unlimited
    *        hard  core  unlimited

修改file-max
```bash
# vi /etc/sysctl.conf, 加入以下内容，重启生效
fs.file-max = 65535000
fs.nr_open = 65535000
net.nf_conntrack_max = 10240000
net.netfilter.nf_conntrack_max = 10240000
```

由于 centos7 使用Systemd替代了之前的SysV，所以 limits.conf 作用小了，对于 systemd 启动的进程，需要修改 /etc/systemd/system.conf 和 /etc/systemd/user.conf
```bash
DefaultLimitCORE=infinity
DefaultLimitNOFILE=6553500
DefaultLimitNPROC=6553500
```

重启
```
sudo reboot
```

## 安装rsyslog（一般centos都装了）
```bash
sudo cp misc/rsyslog.conf /etc/rsyslog.d/49-xxx.conf
systemctl restart rsyslog
```

## 添加github地址解析（可选）
修改`/etc/hosts` 添加 `151.101.229.194 github.global-ssl.fastly.net`

## 使用supervisor管理进程（可选）
```bash
echo_supervisord_conf >> /home/samba_share/supervisord.conf
supervisord -c /home/samba_share/supervisord.conf
```
    [unix_http_server]
    file=/home/samba_share/supervisor.sock
    
    [inet_http_server]
    port=127.0.0.1:9001
    
    [supervisord]
    logfile=/home/samba_share/supervisord.log
    pidfile=/home/samba_share/supervisord.pid
    
    [supervisorctl]
    serverurl=unix:///home/samba_share/supervisor.sock
    
    [program:center]
    command=/home/samba_share/maple/bin/skynet ./center/etc/config.cyh
    directory=/home/samba_share/maple
    user=samba_share
    redirect_stderr=true
    stdout_logfile=/home/samba_share/center.log
    priority=1
    
    [program:game]
    command=/home/samba_share/maple/bin/skynet ./game/etc/config.cyh
    directory=/home/samba_share/maple
    user=samba_share
    redirect_stderr=true
    stdout_logfile=/home/samba_share/game.log
    priority=100

## 修改bash配色以及git分支显示，修改 ~/.bashrc（可选）
```bash
function git_branch {
    branch="`git branch 2>/dev/null | grep "^\*" | sed -e "s/^\*\ //"`"
    if [ "${branch}" != "" ];then
        if [ "${branch}" = "(no branch)" ];then
            branch="(`git rev-parse --short HEAD`...)"
        fi
        echo " ($branch)"
    fi
}
export PS1='\u@\h \[\033[01;36m\]\W\[\033[01;32m\]$(git_branch)\[\033[00m\] \$ '
```

## 安装samba服务（可选）
参考：https://www.cnblogs.com/muscleape/p/6385583.html

安装sambe
```
sudo yum install samba
```
设置开机启动
```
systemctl enable smb
```
修改 `/etc/samba/smb.conf` 添加共享目录

    [caiyiheng]
    comment = Public
    path=/home/caiyiheng
    browsable = yes
    writable = yes
    public = yes

创建 samba 用户，注意用户名必须是一个已经存在的 linux 系统用户
```
sudo smbpasswd -a caiyiheng
```
重启系统
```
sudo reboot
```

## 如何查看 ssh 登录使用的哪个 key

    首先知晓一点，就是 centos7 使用的是 rsyslog 系统来记录日志， rsyslog 系统对于日志有自己的一套管理。
    像 /var/log/wtmp 和 /var/log/secure 记录多少天的，多少内容的日志其实是配置的。由 logrotate 工具管理的。
    可以查看 cat /etc/logrotate.conf  cat /etc/logrotate.d/syslog 进行查看。
    logrotate 操作是由 cron 进行触发的，每天触发一下 cat /etc/cron.daily/logrotate
    
    查看所有登录历史，方便找出来你怀疑有问题的登录 who /var/log/wtmp
    然后查看详细安全日志 less /var/log/secure 就能看到所有登录细节，一次成功登录如下：
    修改 /etc/ssh/sshd_config 里 LogLevel VERBOSE 这样就可以看到登录用的 key 的 footprint（好像不需要改也能看到）
    Jun 24 22:43:42 localhost sshd[29779]: Postponed publickey for caiyiheng from 192.168.21.190 port 54080 ssh2 [preauth]
    Jun 24 22:43:42 localhost sshd[29779]: Accepted publickey for caiyiheng from 192.168.21.190 port 54080 ssh2: RSA SHA256:jeGfUo02I9hEIRTqu1qxMHqINuoKH4GMFDuIpmz9wBs
    然后列出系统所有允许登录的 key 的 footprint 就知道了是谁登录了
    ssh-keygen -E sha256 -lf ~/.ssh/authorized_keys
    
    由于日志可能被 logrorate 切了，所以如果没找到想看的，可以在 /var/log/ 目录下找 secure-时间戳.log 的

## 小贴士
    :w !sudo tee %  vi保存文件提升sudo权限
    echo -n "hello"|md5sum|cut -d" " -f1 计算字符串的md5值
    w命令可以查看当前登录的所有用户，根据登录TTY，ps -ef|grep XX来找到他的shell，kill -9杀掉shell实现踢掉用户的作用

### 修改文件夹权限
```bash
sudo chown -R samba_share:samba_share xxx/
```
    :nohl  vi清除搜索高亮
    grep 'xxx' game.log > 1.txt  查询关键字导出文件
    npm安装权限问题可以修改安装目录到 ~/。 改 ~/.npmrc 加 prefix=~/，然后加 .bash_profile PATH=$PATH:$HOME/bin
    luacheck <https://luacheck.readthedocs.io/en/stable/config.html>
    windows客户端服务：pm2 serve . --port 5678
### 如果无意间把用户移出了wheel组导致sudo无法使用，可以建2个ssh连接，在第一个里面输入echo $$获得进程id，在第二个里面输入pkttyagent --process xxx进程id，然后回第一个里面输入pkexec su，然后在第二个里面输入root的密码，第一个里面就变成了root登录

### 配置 wheel 组用户 sudo 不需要密码，修改 /etc/sudoers，换掉下方的注释
    ## Allows people in group wheel to run all commands
    %wheel  ALL=(ALL)       ALL
    ## Same thing without a password
    # %wheel        ALL=(ALL)       NOPASSWD: ALL

### 生成 jenkins ssh key ，首先得用 jenkins 用户登录在 /var/lib/jenkins/.ssh/ 目录下生成，然后 publish 发布填写相对路径 .ssh/id_rsa
    ## 先给 jenkins 用户设置密码
    sudo passwd jenkins
    ## 用 jenkins 用户登录
    sudo -s -H -u jenkins
    ## 之后就可以类似普通 linux 用户生成 key
    mkdir .ssh
    ssh-keygen
    chmod -R 700 .ssh


### centos7 添加新硬盘扩展根目录（ LVM 方式）

    `fdisk -l|grep sd` 查看当前所有硬盘，假设新硬盘叫/dev/sdb

    `fdisk /dev/sdb` 对新硬盘进行分区

    `n p <cr> <cr> <cr> t 8e w`
    - 输入 n 添加新的物理分区
    - 输入 p 选择主分区类型
    - 默认1
    - 默认
    - 默认
    - 输入 t 修改分区 id
    - 输入 8e 修改分区为 Linux LVM 类型
    - 输入 w 将修改写入磁盘

    `pvcreate /dev/sdb1` 创建 PV

    `vgdisplay` 查看卷组，假设 VG NAME 为 centos

    `vgextend centos /dev/sdb1` 将新的 PV 加入 centos 组卷

    `lvextend -l +100%FREE /dev/centos/root` 将 /dev/centos/root 所在卷组所有剩余空间都分配给了它

    `xfs_growfs /dev/centos/root` 对扩容后的 LV 进行 xfs 格式大小调整

### 升级gcc到9

    sudo yum install centos-release-scl scl-utils-build -y
    sudo yum install devtoolset-9-toolchain -y
    scl enable devtoolset-9 bash
    sudo echo "source /opt/rh/devtoolset-9/enable" >> /etc/profile
    gcc -v

