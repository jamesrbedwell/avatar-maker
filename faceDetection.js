import '@tensorflow/tfjs-node';
import { createAvatars } from './createAvatars';

async function run() {
	await createAvatars();
}

run();
