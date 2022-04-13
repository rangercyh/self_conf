## lua

```
gcc -fPIC -shared -Isrc -L./ -llua53 -o lfs.dll lfs.c
gcc -fPIC -shared -Isrc -L./ -llua53 -o crab.dll lua-crab.c
```
