mkdir ./dist
mkdir ./dist/subapp

# sub-react子应用
cp -r ./sub-vue3/dist/ ./dist/subapp/sub-vue3/

# sub-vue子应用
cp -r ./sub-vue2/dist/ ./dist/subapp/sub-vue2/

# sub-html子应用
cp -r ./sub-html/dist/ ./dist/subapp/sub-html/

# main基座
cp -r ./main/dist/ ./dist/main/

# cd ./dist
# zip -r mp$(date +%Y%m%d%H%M%S).zip *
# cd ..
echo 'bundle.sh execute success.'
