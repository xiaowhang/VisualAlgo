#!/usr/bin/env sh

# 发生错误时终止
set -e

# 构建
npm run build

# 进入构建文件夹
cd dist

# 如果要部署到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m '部署'

# 如果部署到 https://<用户名>.github.io/<仓库名>
git push -f git@github.com:xiaowhang/ALG.git main:gh-pages

cd -