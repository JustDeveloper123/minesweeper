import { IMAGE_CACTUS } from '@constants/images.js';

const cactusLink = document.getElementById('cactus');

cactusLink.href = IMAGE_CACTUS;

const cactusImage = cactusLink.querySelector('img');
cactusImage.src = IMAGE_CACTUS;
