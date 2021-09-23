### 安装指南：https://kubernetes.io/zh/docs/setup/production-environment/tools/kubeadm/install-kubeadm/

- 关闭swap
- 添加主机名跟 ip 地址关系
- 添加 iptables 桥接
- 安装 docker
- 配置 docker 的启动模式
- 安装 kube 工具链

```
sudo swapoff -a
sudo vi /etc/fstab
注释掉这一行 # /dev/mapper/centos-swap swap

sudo vi /etc/hosts
添加
192.168.38.11     k8s-master
192.168.38.12     k8s-node1
192.168.38.13     k8s-node2

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
systemctl start docker

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

sudo kubeadm init --apiserver-advertise-address=10.0.136.17 --image-repository registry.aliyuncs.com/google_containers --kubernetes-version v1.22.2 --service-cidr=10.1.0.0/16 --pod-network-cidr=10.244.0.0/16
```
