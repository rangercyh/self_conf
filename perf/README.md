## 抓取 10min CPU占用

我们经常在编译的时候会开启frame pointers优化选项，即优化掉函数栈帧rbp，省略掉frame pointer是编译器一个很烂的优化，它会破坏debug, 更烂的是省略frame pointer一般是编译器默认的优化选项。
没有frame pointer会使perf 无法获取完整的调用栈。

有三种方法可以修复这个问题：
- using dwarf data to unwind the stack, 实际上很多profile工具：gperftools, valgrind都是依赖于libunwind,通过dwarf来进行stack trace的
- using last branch record (LBR) if available (a processor feature)
- returning the frame pointers

一般编译的时候只要开了 -O fp 就被优化掉了：
`-O ' also turns on '-fomit-frame-pointer' on machines where doing so does not interfere with debugging.

事实上gcc的所有级别的优化（-O, -O2, -O3等）都会打开-fomit-frame-pointer，
该选项的功能是函数调用时不保存frame指针，在ARM上就是fp，
故我们无法按照APCS中的约定来回溯调用栈。但是GDB中仍然可以使用bt命令看到调用栈，为什么？
得知GDB v6之后都是支持DWARF2的，也就意味着它可以不依赖fp来回溯调用栈
看来想在代码中动态显示调用栈而又不希望使用GDB的朋友，只能在编译时关掉-fomit-frame-pointer了：-fno-omit-frame-pointer



## 几个参数

- -F: 事件采样的频率, 单位HZ, 更高的频率会获得更细的统计，但会带来更多的开销
- -g: 进行堆栈追踪，生成调用关系图，等价于–call-graph， 默认情况下，-g等同于–call-graph fp，即通过frame pointer来进行堆栈追踪。 如果frame pointer被优化掉的话，可以通过dwarf, lbr进行堆栈追踪
- -- sleep: 采样的时间
- -p: 进程 id

```bash
sudo perf record -F 99 -p 21605 --call-graph dwarf -- sleep 600
```

## 生成火焰图

```bash
git clone https://github.com/brendangregg/FlameGraph.git
cd FlameGraph
sudo perf script > out.perf
sudo ./stackcollapse-perf.pl out.perf > out.folded
sudo ./flamegraph.pl out.folded > out.svg
```

## 安装debug内核
```bash
yum install systemtap yum-utils
debuginfo-install kernel-$(uname -r)
```
