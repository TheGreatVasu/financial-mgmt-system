# ✅ Deployment Checklist

Print this checklist and check off items as you complete them.

## Pre-Deployment

- [ ] Reviewed `DEPLOYMENT_GUIDE.md`
- [ ] Have SSH access to Neev cloud server
- [ ] Have MySQL database credentials ready
- [ ] Know your frontend URL/domain
- [ ] Generated strong JWT_SECRET key
- [ ] Backend code ready (committed/pushed)

## Server Setup

- [ ] Connected to server via SSH
- [ ] Node.js installed (v16+)
- [ ] PM2 installed globally
- [ ] MySQL client installed (if needed)
- [ ] Firewall configured for port 5001

## Code Upload

- [ ] Backend code uploaded to server
- [ ] Navigated to backend directory

## Configuration

- [ ] Created `.env` file from `.env.example`
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=5001`
- [ ] Generated and set strong `JWT_SECRET`
- [ ] Configured MySQL credentials:
  - [ ] `MYSQL_HOST`
  - [ ] `MYSQL_PORT`
  - [ ] `MYSQL_USER`
  - [ ] `MYSQL_PASSWORD`
  - [ ] `MYSQL_DATABASE`
- [ ] Set `FRONTEND_URL` (your frontend domain)
- [ ] Set `CORS_ORIGIN` (matches FRONTEND_URL)
- [ ] Configured Google OAuth (if using)
- [ ] Set `.env` file permissions: `chmod 600 .env`

## Database Setup

- [ ] MySQL database created
- [ ] Database connection tested
- [ ] Ran migrations: `npm run db:migrate`
- [ ] (Optional) Ran seeds: `npm run db:seed`

## Application Deployment

- [ ] Installed dependencies: `npm install --production`
- [ ] Made deploy script executable: `chmod +x deploy.sh`
- [ ] Ran deployment script: `./deploy.sh`
- [ ] OR manually started with PM2

## Verification

- [ ] PM2 shows app as "online"
- [ ] Health endpoint works: `curl http://localhost:5001/health`
- [ ] Checked PM2 logs for errors
- [ ] Database connection confirmed in logs
- [ ] Socket.io initialized (check logs)

## Reverse Proxy (Optional but Recommended)

- [ ] Nginx installed
- [ ] Nginx config created
- [ ] Site enabled
- [ ] Nginx config tested: `sudo nginx -t`
- [ ] Nginx restarted
- [ ] SSL certificate installed (Let's Encrypt)

## Security

- [ ] Strong JWT_SECRET set (not default)
- [ ] Database password is secure
- [ ] .env file permissions secure (600)
- [ ] Firewall configured properly
- [ ] SSL/HTTPS configured (recommended)
- [ ] CORS_ORIGIN matches frontend exactly

## Auto-Start Setup

- [ ] PM2 startup script generated: `pm2 startup`
- [ ] PM2 config saved: `pm2 save`

## Frontend Configuration

- [ ] Frontend updated with backend URL
- [ ] Frontend API endpoint configured
- [ ] Frontend tested with backend

## Final Testing

- [ ] Can access health endpoint
- [ ] Can login via API
- [ ] Can create customer
- [ ] Can create invoice
- [ ] Real-time updates working (Socket.io)
- [ ] Dashboard loads correctly
- [ ] Data persists after refresh

## Monitoring Setup

- [ ] Know how to check PM2 status: `pm2 status`
- [ ] Know how to view logs: `pm2 logs financial-mgmt-backend`
- [ ] Know how to restart: `pm2 restart financial-mgmt-backend`
- [ ] Database backup plan in place

## Documentation

- [ ] Deployment guide saved/printed
- [ ] Server credentials stored securely
- [ ] Database credentials stored securely
- [ ] Backup procedures documented

---

## 🎉 Deployment Complete!

Once all items are checked, your backend is deployed and ready!

**Backend URL:** `http://your-server-ip:5001` or `https://api.your-domain.com`

**Next Steps:**
1. Monitor logs for first 24 hours
2. Test all features thoroughly
3. Setup regular database backups
4. Configure monitoring alerts (optional)

---

## 📞 Quick Commands Reference

```bash
# Status
pm2 status

# Logs
pm2 logs financial-mgmt-backend

# Restart
pm2 restart financial-mgmt-backend

# Stop
pm2 stop financial-mgmt-backend

# Health Check
curl http://localhost:5001/health
```

---

**Date Completed:** _______________

**Deployed By:** _______________

**Server IP/Domain:** _______________

**Backend URL:** _______________

