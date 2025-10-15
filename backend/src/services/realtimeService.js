const repo = require('./repositories');

// Push periodic dashboard snapshots to all SSE listeners.
// When MySQL is connected, this reflects live SQL state; otherwise mock data.

class RealtimeService {
  constructor() {
    this.clients = new Set();
    this.interval = null;
  }

  addClient(res) {
    this.clients.add(res);
    res.on('close', () => this.clients.delete(res));
    if (!this.interval) {
      this.interval = setInterval(() => this.broadcast(), 8000);
    }
  }

  async snapshot() {
    const kpis = await repo.getKpis().catch(() => null);
    const topCustomers = await repo.topCustomersByOutstanding(5).catch(() => []);
    const recentInvoices = await repo.recentInvoices(6).catch(() => []);
    return { kpis, topCustomers, recentInvoices };
  }

  async broadcast() {
    if (this.clients.size === 0) return;
    const payload = await this.snapshot();
    const data = `event: update\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const res of this.clients) {
      try { res.write(data); } catch {}
    }
  }
}

module.exports = new RealtimeService();


