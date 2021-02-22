# gitlab本地搭建

推荐使用 docker-compose 搭建

## 安装 docker
https://docs.docker.com/install/linux/docker-ce/centos/#prerequisites

    sudo yum install -y yum-utils device-mapper-persistent-data lvm2
    docker-ce.repo不一定能下载下来，可以使用阿里云的镜像
    
~~sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo~~

    sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
    sudo yum install docker-ce
    systemctl start docker
    添加当前用户到docker用户组，不然会报权限错误
    sudo usermod -aG docker $USER
    newgrp docker
    
    docker pull美国地址很慢，可以用中国的镜像，修改 /etc/docker/daemon.json 文件并添加上 registry-mirrors 键值
    {
      "registry-mirrors": ["https://registry.docker-cn.com"]
    }
    systemctl restart docker
    
    docker run hello-world

## 安装 docker-compose
https://docs.docker.com/compose/install/#install-compose

    sudo curl -L "https://get.daocloud.io/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo curl -L https://raw.githubusercontent.com/docker/compose/1.22.0/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose
    docker-compose --version
    
## 安装 gitlab 以及 gitlab-runner

添加gitlab源 <https://mirror.tuna.tsinghua.edu.cn/help/gitlab-ce/>

添加runner源 <https://mirror.tuna.tsinghua.edu.cn/help/gitlab-runner/>

https://docs.gitlab.com/omnibus/docker/README.html#install-gitlab-using-docker-compose

    wget https://gitlab.com/gitlab-org/omnibus-gitlab/raw/master/docker/docker-compose.yml
    修改如下：
    gitlab:
      image: 'gitlab/gitlab-ce:latest'
      container_name: 'gitlab'
      restart: always
      hostname: '192.168.5.80'
      environment:
        GITLAB_OMNIBUS_CONFIG: |
          external_url 'http://192.168.5.80'
          gitlab_rails['gitlab_shell_ssh_port'] = 2222
      ports:
        - '80:80'
        - '443:443'
        - '2222:22'
      volumes:
        - '/srv/gitlab/config:/etc/gitlab'
        - '/srv/gitlab/logs:/var/log/gitlab'
        - '/srv/gitlab/data:/var/opt/gitlab'
    runner:
      image: 'gitlab/gitlab-runner:latest'
      container_name: 'gitlab-runner'
      restart: always
      links:
        - gitlab:192.168.5.80
      volumes:
        - '/srv/gitlab-runner/config:/etc/gitlab-runner'
        - '/var/run/docker.sock:/var/run/docker.sock'
    在 docker-compose.yml 文件所在目录下敲命令 docker-compose up
    等待 5 min左右
    docker-compose exec gitlab bash 进入gitlab容器
    vi /etc/gitlab/gitlab.rb
    修改时区
    gitlab_rails['time_zone'] = 'Asia/Shanghai'
    
    修改邮件设置，这里使用qq的smtp邮箱代发邮件为例子：
    ### Email Settings
    gitlab_rails['gitlab_email_enabled'] = true
    gitlab_rails['gitlab_email_from'] = 'xxx@qq.com'
    gitlab_rails['gitlab_email_display_name'] = 'GitLab'
    gitlab_rails['gitlab_email_reply_to'] = 'noreply@example.com'
    gitlab_rails['gitlab_email_subject_suffix'] = ''
    
    gitlab_rails['smtp_enable'] = true
    gitlab_rails['smtp_address'] = "smtp.qq.com"
    gitlab_rails['smtp_port'] = 465
    gitlab_rails['smtp_user_name'] = "xxx@qq.com"
    gitlab_rails['smtp_password'] = "填写在qq邮箱申请的应用码"
    gitlab_rails['smtp_domain'] = "qq.com"
    gitlab_rails['smtp_authentication'] = "login"
    gitlab_rails['smtp_enable_starttls_auto'] = true
    gitlab_rails['smtp_tls'] = true
    
    最好修改一下unicorn的worker数量，不然内存占用很高
    unicorn['worker_processes'] = 4
    
    exit
    
    docker-compose exec runner bash 进入runner容器
    gitlab-runner register
    按照要求输入
    exit
    
    修改容器的时区
    mv /etc/localtime /etc/localtime.bak
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
    echo "export TZ='Asia/Shanghai'" >> /etc/profile
    source /etc/profile
    
    重启
    docker-compose up
    
## gitlab-runner image 不要每次重拉
```bash
docker-compose exec runner bash
vi /etc/gitlab-runner/config.toml
在 [runners.docker] 下添加
pull_policy = "if-not-present"
重启 runner
```
    
## gitlab 修改 gitlab.rb 之后重载配置
容器里执行
```bash
gitlab-ctl reconfigure
gitlab-ctl restart
gitlab-ctl status
```
    
## 其他邮箱配置方法
https://docs.gitlab.com.cn/omnibus/settings/smtp.html

## 安装 gitlab 以及 gitlab-runner

添加gitlab源 <https://mirror.tuna.tsinghua.edu.cn/help/gitlab-ce/>

添加runner源 <https://mirror.tuna.tsinghua.edu.cn/help/gitlab-runner/>

## crontab添加每日备份到远端

    crontab -e
    0 3 * * * /home/caiyiheng/gitlab/auto_backup_gitlab.sh > ~/bak_out.file 2>&1 &
    auto_backup_gitlab.sh
    #!/bin/bash
    /usr/local/bin/docker-compose -f /home/caiyiheng/gitlab/docker-compose.yml exec -T gitlab gitlab-rake gitlab:backup:create
    /usr/local/bin/docker-compose -f /home/caiyiheng/gitlab/docker-compose.yml exec -T gitlab auto_backup.sh
    gitlab容器里添加 /usr/bin/auto_backup.sh
    #!/bin/bash
    find /var/opt/gitlab/backups -mtime +7 -name "*gitlab_backup.tar" -exec rm -f {} \;
    ls /var/opt/gitlab/backups -t|head -1|xargs -I {} scp /var/opt/gitlab/backups/{} samba_share@192.168.5.48:/home/samba_share/gitlab_backup/

## 自动删除7天之前的文件

    crontab -e
    0 5 * * * /home/samba_share/gitlab_backup/del_7_days_file.sh
    del_7_days_file.sh
    #!/bin/bash
    find ./ -mtime +7 -name "*gitlab_backup.tar" -exec rm -f {} \;
