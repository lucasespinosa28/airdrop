import sharp from "sharp";

function randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
//const imag await sharp('ninja.png', { animated: true }).toFile('./output/out.webp');
const body =  await sharp('body.png');

for (let index = 0; index < 90; index++) {
    const rndInt = randomIntFromInterval(0, 360);
    body.modulate({hue:rndInt}).composite([{input:"face.png"}]).toFile(`./output/ninja${index+1}.webp`);
}