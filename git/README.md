## 用户级配置
```
    git config --global user.name "caiyiheng"
    git config --global user.email rangercyh@qq.com

    git config --global color.ui auto

    git config --global core.editor vim
    git config --global gui.encoding utf-8

    git config --global alias.co checkout
    git config --global alias.br branch
    git config --global alias.ci commit
    git config --global alias.st status
    git config --global alias.sh stash
    git config --global alias.up 'pull --rebase'
    git config --global alias.pl pull
    git config --global alias.pu push
    git config --global alias.sm submodule
    git config --global alias.lg "log --graph --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%cr)%C(reset) %C(blue)%s%C(reset) %C(bold Cyan)- %an%C(reset)%C(bold Green)%d%C(reset)' --abbrev-commit"
    git config --global alias.cf "!f() { git checkout -b feature-$1 origin/feature-$1; }; f"

```
## 设置 git 代理，修改 ~/.ssh/config
```
    Host github.com
        ProxyCommand connect -H 127.0.0.1:1080 %h 22
```
## 换行设置
    linux 上设置 git config --global core.autocrlf input  提交时把 CRLF 转换成 LF ，签出时不转换
    win 上设置   git config --global core.autocrlf true   提交时把 CRLF 转换成 LF ，签出转换 CRLF

## 修改错误的 alias
```
    git config --global --replace-all  user.name "New Name"
```
## 安装 luacheck 钩子
```
    vi .git/hooks/pre-commit
```
```bash
#!/bin/sh
#STAGED_FILES=$(find ./ -name *.lua)
STAGED_FILES=$(git status -s | grep "[M|A|??].*lua$" | awk '{printf $2 "\n"}')
if [[ "$STAGED_FILES" = "" ]]; then
    exit 0
fi
PASS=true
echo -e "LUACHECK...\n"
# Check for luacheck
which luacheck &> /dev/null
if [[ "$?" == 1 ]]; then
    echo -e "\e[1;31mplease install luacheck\e[0m"
    exit 1
fi
luacheck --config .luacheckrc $STAGED_FILES
if [[ "$?" == 0 ]]; then
    echo -e "\e[1;32mCOMMIT SUCCESSED\e[0m\n"
    exit 0
else
    echo -e "\e[1;31mCOMMIT FAILED\e[0m\n"
    exit 1
fi
```

## 删除 submodule
1. 删除 .gitmodule 中对应 submodule 的条目
2. 删除 .git/config 中对应 submodule 的条目
3. 执行 git rm --cached {submodule_path}。`注意，路径不要加后面的“/”。例如：你的submodule保存在 3rd/lfs/ 目录。执行命令为： git rm --cached 3rd/lfs。`

## 修改 submodule 远程地址
1. 更新 .gitmodule 中对应 submodule 的条目 URL
2. 更新 .git/config 中对应 submodule 的条目的 URL
3. 执行 git submodule sync

## 添加 shell 的 git branch 提示
```
function parse_git_branch {
  git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e "s/* \(.*\)/[\1]/"
}
export PS1='\u@\h:\w\[\e[1;36m\]$(parse_git_branch)\[\e[0m\]$ '
```

## 查看每个人提交的代码统计
```
git log --format='%aN' | sort -u | while read name; do echo -en "$name\t"; git log --author="$name" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }' -; done
```

## 查看单人的代码统计
```
git log --author="username" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }' -
```
