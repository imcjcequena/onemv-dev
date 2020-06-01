source /home/ec2-user/.bash_profile
cd /home/ec2-user/passenger-api/
rm -rf node_modules 
yarn
pm2 start passenger-api
