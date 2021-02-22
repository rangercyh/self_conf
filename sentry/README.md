# sentry 本地搭建

## 安装 docker 跟 docker-compose
参考 [本地搭建gitlab docker部分](https://github.com/rangercyh/self_conf/blob/master/gitlab/README.md)

## 安装 sentry
    修改 sentry.conf.py 里 web 模块的 worker 数量，调大一点
    文件最后加上时区配置：
    SENTRY_DEFAULT_TIME_ZONE = 'Asia/Shanghai'

    docker-compose run --rm web upgrade

    docker-compose up -d
    localhost:9000 可以访问了
    
## 更新 sentry 仓库

    git pull
    docker-compose build
    docker-compose run --rm web upgrade
    docker-compose up -d
    
## 更新配置文件
    
    docker-compose run --rm web upgrade
