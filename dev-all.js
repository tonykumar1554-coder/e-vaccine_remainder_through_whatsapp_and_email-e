const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

function isMongoRunning() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1200);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(27017, '127.0.0.1');
  });
}

async function start() {
  console.log('===================================================');
  console.log('    VaxCare - E-Vaccine Reminder & Tracker Dev');
  console.log('===================================================');

  const running = await isMongoRunning();
  if (running) {
    console.log('[OK] MongoDB is already running on port 27017.');
  } else {
    console.log('Starting local MongoDB server on port 27017...');
    const mongoPath = 'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';
    const dbPath = path.join(__dirname, 'backend', 'data', 'db');
    const mongo = spawn(mongoPath, ['--dbpath', dbPath, '--port', '27017', '--bind_ip', '127.0.0.1'], {
      stdio: 'ignore',
      detached: true
    });
    mongo.unref();

    // Wait until MongoDB is accepting connections
    let ready = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await isMongoRunning()) {
        ready = true;
        break;
      }
    }
    if (ready) {
      console.log('[OK] MongoDB initialized successfully.');
    } else {
      console.warn('[Warning] MongoDB starting may have taken longer than expected.');
    }
  }

  console.log('Starting Backend server...');
  const backend = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  console.log('Starting Frontend Vite server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  const cleanup = () => {
    console.log('\nShutting down dev servers...');
    try { backend.kill(); } catch (e) {}
    try { frontend.kill(); } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start();
