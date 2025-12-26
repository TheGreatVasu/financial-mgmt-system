# SSH Connection Troubleshooting Guide

## Issue: Permission Denied When Connecting to Server

If you're getting "Permission denied" when trying to SSH, try these solutions:

---

## Solution 1: Check Your Credentials

### For Neev Cloud:
- **Username**: May not be `root`. Common usernames:
  - `ubuntu` (for Ubuntu servers)
  - `admin`
  - `neev` or `neevuser`
  - Your custom username provided by Neev

- **Password**: Make sure you're using the correct password provided by Neev Cloud

**Try:**
```bash
ssh ubuntu@103.192.198.70
# or
ssh admin@103.192.198.70
```

---

## Solution 2: Use SSH Key Authentication (Recommended)

Many cloud providers disable password authentication and require SSH keys.

### Check if you have SSH keys:
```bash
# On Windows (PowerShell)
ls ~/.ssh
# Look for: id_rsa, id_ed25519, or similar
```

### Generate SSH Key (if you don't have one):
```bash
# On Windows (PowerShell)
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Enter a passphrase (optional but recommended)
```

### Copy Public Key to Server:

**Option A: Using ssh-copy-id (if available)**
```bash
ssh-copy-id username@103.192.198.70
```

**Option B: Manual Method**
1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # or
   cat ~/.ssh/id_rsa.pub
   ```

2. Connect to server using web console/control panel and add the key

3. Or use password login once to add the key:
   ```bash
   ssh username@103.192.198.70
   # Then run:
   mkdir -p ~/.ssh
   echo "your-public-key-here" >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

---

## Solution 3: Check Neev Cloud Control Panel

1. **Login to Neev Cloud Dashboard**
   - Go to your Neev Cloud account
   - Navigate to your server instance

2. **Check Server Details:**
   - Look for SSH connection details
   - Check the correct username
   - Check if password authentication is enabled
   - Check if SSH keys are required

3. **Reset Password (if needed):**
   - Some cloud providers allow password reset from dashboard
   - Use the "Reset Password" or "Change Root Password" option

4. **Check Security Groups/Firewall:**
   - Ensure SSH port (22) is open
   - Check firewall rules

---

## Solution 4: Use Neev Cloud Web Console

Many cloud providers offer a web-based console:

1. **Access Web Console:**
   - Login to Neev Cloud dashboard
   - Find your server instance
   - Click "Console" or "Web SSH" or "VNC Console"
   - This bypasses SSH connection issues

2. **From Web Console:**
   - You can configure SSH keys
   - Reset passwords
   - Check server status

---

## Solution 5: Try Different Connection Methods

### Method 1: Specify Port (if non-standard)
```bash
ssh -p 2222 username@103.192.198.70
```

### Method 2: Verbose Mode (to see what's happening)
```bash
ssh -v username@103.192.198.70
# or more verbose
ssh -vvv username@103.192.198.70
```

### Method 3: Use PuTTY (Windows)
- Download PuTTY: https://www.putty.org/
- Enter host: `103.192.198.70`
- Port: `22`
- Connection type: `SSH`
- Click "Open"
- Enter username and password when prompted

---

## Solution 6: Contact Neev Cloud Support

If none of the above work:

1. **Contact Neev Cloud Support:**
   - They can provide:
     - Correct username
     - Reset password
     - Enable password authentication
     - Provide SSH key setup instructions

2. **Information to provide:**
   - Server IP: `103.192.198.70`
   - Error message: "Permission denied"
   - Your account details

---

## Common Neev Cloud Usernames

Try these common usernames:

```bash
ssh root@103.192.198.70
ssh ubuntu@103.192.198.70
ssh admin@103.192.198.70
ssh neev@103.192.198.70
ssh neevuser@103.192.198.70
```

---

## Once Connected Successfully

After you successfully connect, you can proceed with deployment:

```bash
# 1. Update system
sudo apt-get update

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Continue with deployment steps from DEPLOYMENT_GUIDE.md
```

---

## Quick Checklist

- [ ] Tried different usernames (ubuntu, admin, etc.)
- [ ] Checked Neev Cloud dashboard for correct credentials
- [ ] Verified password is correct
- [ ] Checked if SSH keys are required
- [ ] Tried web console access
- [ ] Contacted Neev Cloud support if needed

---

## Next Steps After Connection

Once you can SSH into the server, follow the `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

