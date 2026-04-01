import './style.css';
import { startApp } from './controller/controller.js';

const mountEl = document.querySelector('#app');
if (!mountEl) {
    throw new Error('Missing #app mount element.');
}

startApp(mountEl);
