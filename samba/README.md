### 多人sambe权限控制
```bash
useradd fengfan -s /sbin/nologin
useradd wangjin -s /sbin/nologin
usermod -aG caiyiheng fengfan
usermod -aG caiyiheng wangjin
sudo smbpasswd -a fengfan
sudo smbpasswd -a wangjin
```

`/etc/samba/smb.conf`
```bash
#[homes]
#       comment = Home Directories
#       valid users = %S, %D%w%S
#       browseable = No
#       read only = No
#       inherit acls = Yes

[caiyiheng]
        path = /samba
        writable = yes
        browseable = no
        valid users = caiyiheng
        read only = No

[fengfan]
        path = /samba/fengfan
        writable = yes
        valid users = caiyiheng,fengfan
        read only = No
        browseable = no

[wangjin]
        path=/samba/wangjin
        writable = yes
        valid users = caiyiheng,wangjin
        read only = No
        browseable = no

```
