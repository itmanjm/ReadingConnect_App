import { spawn } from 'child_process';
import { join } from 'path';

/**
 * Global setup for Playwright tests
 * Starts Firebase emulators before running tests
 */
async function globalSetup() {
  console.log('🚀 Starting Firebase emulators...');
  
  const projectRoot = join(__dirname, '../../..');
  
  // Start Firebase emulators
  const emulatorProcess = spawn(
    'firebase',
    ['emulators:start', '--project', 'readingconnect-lit'],
    {
      cwd: projectRoot,
      stdio: 'pipe',
      shell: true,
    }
  );

  // Wait for emulators to be ready
  await new Promise<void>((resolve, reject) => {
    let output = '';
    
    emulatorProcess.stdout?.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
      
      // Check if all emulators are ready
      if (output.includes('All emulators ready')) {
        console.log('✅ Firebase emulators are ready');
        resolve();
      }
    });

    emulatorProcess.stderr?.on('data', (data) => {
      console.error(data.toString());
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      reject(new Error('Firebase emulators failed to start within 60 seconds'));
    }, 60000);
  });

  // Store emulator process for teardown
  (global as any).__FIREBASE_EMULATOR_PROCESS__ = emulatorProcess;
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
