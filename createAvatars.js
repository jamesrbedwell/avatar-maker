import * as faceapi from 'face-api.js';
const canvas = require('canvas');
import * as fs from 'fs';
const sharp = require('sharp');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const checkVal = (val, newMeasurement, compareVal) => {
	const measuredVal = val + newMeasurement;
	if (measuredVal > compareVal) {
		const dif = measuredVal - compareVal;
		const newVal = val - dif;
		return newVal > 0 ? newVal : 0;
	} else {
		return val;
	}
};

const createAvatar = async (filename) => {
	await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights');
	await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights');
	const img = await canvas.loadImage(`./images/${filename}`);
	const landmarks = await faceapi.detectFaceLandmarks(img);
	const dimensions = await faceapi.getMediaDimensions(img);
	const smallestEdge = Math.floor(
		Math.min(dimensions._width, dimensions._height)
	);
	const nose = landmarks.getNose();

	const topNoseX = nose[1]._x;
	const topNoseY = nose[1]._y;

	const halfDimension = Math.floor(smallestEdge / 2);
	const left = Math.floor(topNoseX - halfDimension);
	const top = Math.floor(topNoseY - halfDimension);

	const newLeft = left > 0 ? left : 0;
	const newTop = top > 0 ? top : 0;

	const checkedLeft = checkVal(newLeft, smallestEdge, dimensions._width);
	const checkedTop = checkVal(newTop, smallestEdge, dimensions._height);

	const extracted = await sharp(`./images/${filename}`)
		.extract({
			left: checkedLeft,
			top: checkedTop,
			width: smallestEdge,
			height: smallestEdge,
		})
		.toFile(`./out/${filename.split('.')[0]}.png`, (err, info) => {
			if (err) throw err;
			console.log('Success', info);
		});
};

export const createAvatars = async () => {
	fs.readdir('./images', async (err, files) => {
		if (err) throw err;
		files.forEach(async (image) => {
			await createAvatar(image);
		});
	});
};
