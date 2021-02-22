vi  ~/.vimrc

yum -y install vim-enhanced

vi /etc/profile

alias vi=vim

```bash
filetype plugin on
syntax on
set nu
set nobackup
set laststatus=2
set showcmd
set list
set cursorline
highlight WhitespaceEOL ctermbg=red guibg=red
match WhitespaceEOL /\s\+$/
```
