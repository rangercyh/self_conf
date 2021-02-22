pm2 start maple_service.json --only server_list_node

pm2 save

pm2 unstartup

pm2 startup
