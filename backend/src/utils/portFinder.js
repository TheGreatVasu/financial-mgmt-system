const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

/**
 * Find the next available port starting from the given port
 * @param {number} startPort - Starting port number
 * @param {number} maxAttempts - Maximum number of ports to try (default: 10)
 * @returns {Promise<number>} - Available port number
 */
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`No available port found in range ${startPort}-${startPort + maxAttempts - 1}`);
}

/**
 * Kill process using a specific port
 * @param {number} port - Port number
 * @returns {Promise<boolean>} - True if process was killed
 */
async function killPortProcess(port) {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port}`;
    
    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(false);
        return;
      }
      
      if (isWindows) {
        // Windows: Extract PID from netstat output and kill it
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        lines.forEach(line => {
          const match = line.match(/\s+(\d+)\s*$/);
          if (match) pids.add(match[1]);
        });
        
        if (pids.size === 0) {
          resolve(false);
          return;
        }
        
        const killCommand = `taskkill /F /PID ${Array.from(pids).join(' /PID ')}`;
        exec(killCommand, (killError) => {
          resolve(!killError);
        });
      } else {
        // Unix/Mac: Kill process directly
        exec(`kill -9 ${stdout.trim()}`, (killError) => {
          resolve(!killError);
        });
      }
    });
  });
}

module.exports = {
  isPortAvailable,
  findAvailablePort,
  killPortProcess
};

