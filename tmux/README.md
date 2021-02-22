https://centos.pkgs.org/7/ghettoforge-plus-x86_64/tmux-2.4-2.gf.el7.x86_64.rpm.html

## Download latest gf-release rpm from
http://mirror.ghettoforge.org/distributions/gf/el/7/plus/x86_64//tmux-2.4-2.gf.el7.x86_64.rpm

## Install gf-release rpm:
    sudo rpm -Uvh tmux-2.4-2.gf.el7.x86_64.rpm

    vi ~/.tmux.conf

    tmux source-file ~/.tmux.conf
    git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
    bash ~/.tmux/plugins/tpm/bin/install_plugins
    tmux source-file ~/.tmux.conf
