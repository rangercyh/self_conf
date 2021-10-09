### 安装指南：https://docs.docker.com/engine/install/centos/
### registry https://docs.docker.com/registry/

```
先拉官方 registry 镜像
docker pull registry

启动 registry 镜像，/registry 是主机目录（没有会创建），/var/lib/registry 是 registry 容器内目录，这样挂在一下可以防止 registry 容器被删除了，已经上传到 registry 容器的镜像也被删掉了，所以 -v 挂载一下目录
--privileged=true是让docker里的root用户拥有真正的root权限而不是一个外部普通用户
docker run -d -v /registry:/var/lib/registry -p 5000:5000 --restart=always --privileged=true --name registry registry:latest

registry 容器启动好了，这样在别的机器上就可以往 registry 上传镜像了，上传镜像命令
10.1.1.1:5000/hello-world:latest 是本地镜像的名字，10.1.1.1:5000是私有仓库的地址
需要先设置下面的 http 允许才可以 push 成功
docker push 10.1.1.1:5000/hello-world:latest

需要注意的是上传的私有仓库默认使用https连接，没有配置会失败，可以修改 /etc/docker/daemon.json 来允许上传
sudo vi /etc/docker/daemon.json
添加
"insecure-registries":["10.1.1.1:5000"]

systemctl daemon-reload
systemctl restart docker

验证上传是否成功
curl http://10.1.1.1:5000/v2/_catalog
```

示例打包本地镜像并上传脚本
```
#!/bin/bash

docker_name="10.1.1.1:5000/lyra:latest"

docker_build="docker build -t ${docker_name} -f Dockerfile ."
docker_ls="docker image ls"
docker_push="docker push ${docker_name}"
# docker_query="docker image ls -q ${docker_name}"
# docker_clean="docker image rm -f $(${docker_query})"
docker_clean(){
    if [ -n "$(docker image ls -q ${docker_name})" ]; then
        docker image rm -f $(docker image ls -q ${docker_name})
    fi
}
docker_enter="docker run -ti ${docker_name} /bin/bash"
docker_pull="docker pull ${docker_name}"

${docker_ls}

docker_clean

${docker_build}

${docker_push}

docker_clean

${docker_ls}
```
