### fis receiver for yog2

用于yog2 project接收yog2上传的yog2 app。

#### install/安装

```
yog2 plugin install https://github.com/ssddi456/yog-receiver
```

#### usage/使用
在yog2 app 的```fis-conf.js```中增加:
```js
fis.config.set('deploy',{
  remote : {
    receiver : 'http://%your_yog2_server_address%/receiver',
    // hack for fis
    to       : '/'
  }
});
```

执行命令

```
yog2 release -d remote
```

现在会在接受一批文件之后自动重启。

#### unstall/卸载

```
rm -rf project/plugins/yog-receiver
rm -rf project/plugins/yog-receiver-plugin.json
```

#### 注意

1. 上传过程中服务器挂掉/重启就得重传了。
2. 目前不支持开发环境标志。请注意不要部署到线上环境。
