### 安装指南：https://kubernetes.io/zh/docs/setup/production-environment/tools/kubeadm/install-kubeadm/

过程中有失败就用 kubeadm reset 重置

- 关闭swap
- 添加主机名跟 ip 地址关系
- 添加 iptables 桥接
- 安装 docker
- 配置 docker 的启动模式
- 安装 kube 工具链
- 拷贝 config 文件
- 安装 pod 网络插件（选一个就好） https://kubernetes.io/zh/docs/concepts/cluster-administration/addons/
- node 节点链接进网络

```
sudo swapoff -a
sudo vi /etc/fstab
注释掉这一行 # /dev/mapper/centos-swap swap

sudo vi /etc/hosts
添加
192.168.0.11     k8s-master
192.168.0.12     k8s-node1
192.168.0.13     k8s-node2

sudo vi /etc/sysctl.d/k8s.conf
添加
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1

sysctl --system

sudo wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O/etc/yum.repos.d/docker-ce.repo
sudo yum -y install docker-ce
systemctl enable docker
sudo vi /etc/docker/daemon.json
添加
{
"exec-opts": ["native.cgroupdriver=systemd"]
}

systemctl daemon-reload
systemctl restart docker

sudo vi /etc/yum.repos.d/kubernetes.repo
添加
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
exclude=kubelet kubeadm kubectl

sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
sudo systemctl enable --now kubelet

sudo kubeadm init --apiserver-advertise-address=192.168.0.11 --image-repository registry.aliyuncs.com/google_containers --kubernetes-version v1.22.2 --service-cidr=10.1.0.0/16 --pod-network-cidr=10.244.0.0/16

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

kubectl get node  （状态为  NotReady）
这里安装 flannel 网络：https://github.com/flannel-io/flannel
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
kubectl get pods -n kube-system (状态全为 running，coredns需要等几秒)
kubectl get node  （状态为 Ready）

在 master 节点查看 token 跟 ca hash值
kubeadm token list
获取 ca证书 sha256 hash值
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'
在 node 节点连接进网络
sudo kubeadm join 192.168.0.11:6443 --token 6xhol7.nyuxcgbsw856ts01 --discovery-token-ca-cert-hash sha256:e74be9f23cf427c47ba6a332db2dd7f4829d8bf5859f4fcf1070af58edcc21f
```
