# Database Schema Fix - Deployment Checklist

## Pre-Deployment Verification

- [ ] **Backup Created**
  ```bash
  mysqldump -h $HOST -u $USER -p$PASSWORD $DB > backup_$(date +%s).sql
  # Verify file exists: ls -lh backup_*.sql
  ```

- [ ] **Team Notified**
  - [ ] Developers aware of upcoming database changes
  - [ ] QA team informed
  - [ ] Support team ready for any issues

- [ ] **Environment Variables Verified**
  ```bash
  echo "Host: $MYSQL_HOST"
  echo "User: $MYSQL_USER"
  echo "Database: $MYSQL_DATABASE"
  # All should show production values
  ```

- [ ] **Database Connectivity Confirmed**
  ```bash
  mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "SELECT VERSION();"
  # Should return MySQL version without error
  ```

---

## Phase 1: Schema Updates

### Subscriptions Columns

- [ ] **Run SQL Migration**
  ```bash
  cd backend/migrations
  mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < FIX_USERS_SUBSCRIPTION_COLUMNS.sql
  # Watch for "Query OK" messages - should see 11+ of them
  ```

- [ ] **Verify Added (Immediately After)**
  ```bash
  mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='users' AND COLUMN_NAME LIKE 'plan_%' 
    ORDER BY COLUMN_NAME;
  "
  # Should list: plan_id, plan_interval, plan_name, plan_price
  ```

### Ownership Columns

- [ ] **Run SQL Migration**
  ```bash
  mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql
  # Watch for "Query OK" messages - should see 9+ (5 ALTERs + 4 INDEXes)
  ```

- [ ] **Verify Added (Immediately After)**
  ```bash
  mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "
    SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE COLUMN_NAME='created_by' AND TABLE_SCHEMA=DATABASE()
    ORDER BY TABLE_NAME;
  "
  # Should list: customers, invoices, payment_moms, po_entries, sales_invoice_master
  ```

- [ ] **Verify Indexes Created**
  ```bash
  mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "
    SHOW INDEXES FROM customers WHERE Column_name='created_by';
  "
  # Should show: idx_customers_created_by with type 'BTREE'
  ```

---

## Phase 2: Application Updates

- [ ] **Latest Code Deployed**
  ```bash
  cd /path/to/financial-mgmt-system
  git status
  # Should be clean (no uncommitted changes)
  ```

- [ ] **Dependencies Updated (if needed)**
  ```bash
  npm install
  # Verify no errors
  ```

- [ ] **Run Knex Migrations**
  ```bash
  npm run db:migrate
  # Output should show:
  # Ran 2 migrations
  # Migration 202601010001 completed
  # Migration 202601010002 completed
  ```

- [ ] **Verify Migration State**
  ```bash
  npm run db:migrate:status
  # Output should show all migrations as completed (no "pending")
  ```

---

## Phase 3: Application Restart

- [ ] **Stop Application**
  ```bash
  # If using PM2:
  pm2 stop financial-mgmt-backend
  
  # If using systemd:
  sudo systemctl stop financial-mgmt-backend
  
  # If using Docker:
  docker stop financial-mgmt-system-backend
  ```

- [ ] **Wait 5 seconds**
  (Allow graceful shutdown)

- [ ] **Start Application**
  ```bash
  # If using PM2:
  pm2 start financial-mgmt-backend
  
  # If using systemd:
  sudo systemctl start financial-mgmt-backend
  
  # If using Docker:
  docker start financial-mgmt-system-backend
  ```

- [ ] **Verify Application Started**
  ```bash
  # If using PM2:
  pm2 logs financial-mgmt-backend | head -20
  # Should show startup messages, no errors
  
  # Check health endpoint:
  curl http://localhost:5000/health
  # Should return 200
  ```

---

## Phase 4: Functional Testing

### Critical API Endpoints

- [ ] **GET /api/customers**
  ```bash
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    http://localhost:5000/api/customers)
  
  if [ "$RESULT" = "200" ]; then
    echo "✓ PASS: /api/customers"
  else
    echo "✗ FAIL: /api/customers returned $RESULT"
  fi
  ```

- [ ] **POST /api/customers (Create)**
  ```bash
  RESULT=$(curl -s -X POST \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"company_name":"Test Corp"}' \
    http://localhost:5000/api/customers \
    -o /dev/null -w "%{http_code}")
  
  if [ "$RESULT" = "201" ] || [ "$RESULT" = "200" ]; then
    echo "✓ PASS: POST /api/customers"
  else
    echo "✗ FAIL: POST /api/customers returned $RESULT"
  fi
  ```

- [ ] **GET /api/dashboard**
  ```bash
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    http://localhost:5000/api/dashboard)
  
  if [ "$RESULT" = "200" ]; then
    echo "✓ PASS: /api/dashboard"
  else
    echo "✗ FAIL: /api/dashboard returned $RESULT"
  fi
  ```

### Error Log Verification

- [ ] **No ER_BAD_FIELD_ERROR in logs**
  ```bash
  ERROR_COUNT=$(tail -n 1000 backend/logs/error.log 2>/dev/null | grep -i "ER_BAD_FIELD_ERROR" | wc -l)
  
  if [ "$ERROR_COUNT" = "0" ]; then
    echo "✓ PASS: No ER_BAD_FIELD_ERROR in logs"
  else
    echo "✗ FAIL: Found $ERROR_COUNT ER_BAD_FIELD_ERROR instances"
  fi
  ```

- [ ] **No "Unknown column" errors**
  ```bash
  ERROR_COUNT=$(tail -n 1000 backend/logs/error.log 2>/dev/null | grep -i "unknown column" | wc -l)
  
  if [ "$ERROR_COUNT" = "0" ]; then
    echo "✓ PASS: No 'Unknown column' errors"
  else
    echo "✗ FAIL: Found $ERROR_COUNT 'Unknown column' errors"
  fi
  ```

---

## Phase 5: Performance Check

- [ ] **Response Times Acceptable**
  ```bash
  TIME_MS=$(curl -s -o /dev/null -w "%{time_total}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    http://localhost:5000/api/customers | cut -d. -f1)
  
  if [ "$TIME_MS" -lt 1000 ]; then
    echo "✓ PASS: Response time ${TIME_MS}ms"
  else
    echo "⚠ WARN: Response time ${TIME_MS}ms (slower)"
  fi
  ```

- [ ] **No Database Connection Issues**
  ```bash
  ERROR_COUNT=$(grep -i "ECONNREFUSED\|connection.*refused\|PROTOCOL_CONNECTION_LOST" backend/logs/error.log | wc -l)
  
  if [ "$ERROR_COUNT" = "0" ]; then
    echo "✓ PASS: No connection errors"
  else
    echo "✗ FAIL: Found $ERROR_COUNT connection errors"
  fi
  ```

---

## Post-Deployment Verification

- [ ] **Existing Data Preserved**
  ```bash
  # Count should remain the same or increase
  mysql -h $HOST -u $USER -p$PASS $DB -e "SELECT COUNT(*) FROM customers;"
  mysql -h $HOST -u $USER -p$PASS $DB -e "SELECT COUNT(*) FROM users;"
  ```

- [ ] **New Records Can Be Created**
  ```bash
  # Create test customer
  curl -X POST -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"company_name":"Test"}' \
    http://localhost:5000/api/customers
  # Should return 201 or 200
  ```

- [ ] **Schema Stable**
  ```bash
  # Columns should still exist after a few minutes of usage
  mysql -h $HOST -u $USER -p$PASS $DB -e "
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='users' AND COLUMN_NAME='plan_id';
  "
  # Should be 1
  ```

---

## Success Criteria

✅ **All of these must pass:**

- [ ] `/api/customers` returns 200 OK
- [ ] `/api/dashboard` returns 200 OK  
- [ ] `/api/invoices` returns 200 OK
- [ ] New customers can be created
- [ ] No `ER_BAD_FIELD_ERROR` in logs
- [ ] No `Unknown column` errors in logs
- [ ] Existing data count unchanged or increased
- [ ] Response times < 1 second
- [ ] No database connection errors
- [ ] All schema columns present and verified

---

## Rollback Procedure (If Needed)

Only if critical failure occurs:

- [ ] **Stop Application**
  ```bash
  pm2 stop financial-mgmt-backend
  ```

- [ ] **Restore Database**
  ```bash
  mysql -h $HOST -u $USER -p$PASS $DB < backup_TIMESTAMP.sql
  ```

- [ ] **Restart Application**
  ```bash
  pm2 start financial-mgmt-backend
  ```

- [ ] **Verify Rollback**
  ```bash
  # Should return to pre-fix state (possibly with 500 errors)
  curl http://localhost:5000/api/customers
  ```

---

## Sign-Off

**Deployment Date:** ________________

**Deployed by:** ________________

**Reviewed by:** ________________

**Status:** 
- [ ] ✅ Success
- [ ] ⚠️ Warning (specify): ________________
- [ ] ❌ Failure (rolled back, reason): ________________

**Notes:** ________________

---

**Keep this checklist for future database deployments!**
