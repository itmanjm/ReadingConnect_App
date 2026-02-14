import { spawn } from 'child_process';

/**
 * Global teardown for Playwright tests
 * Stops Firebase emulators after tests complete
 */
async function globalTeardown() {
  console.log('🛑 Stopping Firebase emulators...');
  
  const emulatorProcess = (global as any).__FIREBASE_EMULATOR_PROCESS__;
  
  if (emulatorProcess) {
    emulatorProcess.kill('SIGTERM');
    
    // Wait for process to exit
    await new Promise<void>((resolve) => {
      emulatorProcess.on('close', () => {
        console.log('✅ Firebase emulators stopped');
        resolve();
      });
      
      // Force kill after 5 seconds
      setTimeout(() => {
        emulatorProcess.kill('SIGKILL');
        resolve();
      }, 5000);
    });
  }
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
