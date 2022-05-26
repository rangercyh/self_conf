## 目录
```
sudo mkdir /etc/svn-access-manager
sudo chown apache:apache /etc/svn-access-manager
```

## 配置 mysql 7
```
sudo rpm -ivh mysql80-community-release-el7-6.noarch.rpm
修改 etc/yum.repo.d/mysql-community.repo 5.7 打开 8.0 关闭 gpgcheck 关闭
sudo yum install mysql-server
service mysqld start
sudo grep 'temporary password' /var/log/mysqld.log
mysql -uroot -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'TestMysql!123';
flush privileges;
quit
CREATE DATABASE svnadmin;
SET GLOBAL validate_password_length = 6;
SET GLOBAL validate_password_number_count = 0;
SET GLOBAL validate_password_policy = 0;
CREATE USER 'svnadmin'@'localhost' IDENTIFIED BY '123456';
GRANT USAGE ON . TO 'svnadmin'@'localhost' IDENTIFIED BY '123456'
WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0
MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;
GRANT ALL PRIVILEGES ON svnadmin . * TO 'svnadmin'@'localhost';
quit
```

## 配置 apache 2
```
sudo yum install httpd

sudo cp /etc/httpd/conf/httpd.conf /etc/httpd/conf/httpd.conf.backup

vi /etc/httpd/conf.d/svn.conf

Alias /svnaccessmanager /home/caiyiheng/svn-access-manager

<Directory "/home/caiyiheng/svn-access-manager">
    AllowOverride None
    Require all granted
</Directory>

<Location /home/caiyiheng/svn/test>
    DAV svn

    SVNParentPath /home/caiyiheng/svn/test

    AuthType Basic
    AuthName "Subversion Repository"
    AuthUserFile /etc/svn/svn-passwd
    AuthzSVNAccessFile /etc/svn/svn-access
    Require valid-user

    SVNIndexXSLT /svnstyle/svnindex.xsl
</Location>

CustomLog /var/log/apache2/svn.log "%t %u %{SVN-ACTION}e" env=SVN-ACTION

sudo yum install mod_dav_svn
sudo mkdir /etc/svn
sudo chown -R apache:apache /etc/svn /home/caiyiheng/svn-access-manager
sudo chmod 755 ~
sudo mkdir -p /var/log/apache2/
sudo chmod -R 744 /var/log/apache2/

systemctl start httpd

http://10.0.136.6/svnaccessmanager
```

## 安装php 5.4
```
sudo yum install php
sudo yum install php-mysql

php --ini
修改php.ini
mysql.allow_persistent = On
date.timezone = Asia/Hong_Kong
extension=mysql.so

systemctl restart httpd
```

## 安装 postgresql 9
```
sudo yum install postgresql postgresql-server
sudo postgresql-setup initdb
systemctl start postgresql

su postgres
psql
ALTER USER postgres WITH PASSWORD 'TestMysql!123';
```

## 配置web

![](index.jpg)

![](db.jpg)

```
mysql -usvnadmin -p
use svnadmin
SELECT @@character_set_database, @@collation_database;
```


![](web.jpg)

![](svn.jpg)

![](admin.jpg)

![](misc.jpg)

![](result.jpg)
