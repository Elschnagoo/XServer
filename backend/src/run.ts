import { XUtil } from '@grandlinex/kernel';
import XKernel from './XKernel';

XUtil.setupEnvironment([__dirname, '..'], ['data', 'config']);

/**
 * Starting the new kernel
 */
const kernel = new XKernel();

kernel.start();
