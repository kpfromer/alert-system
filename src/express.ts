import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import NodeWebcam from 'node-webcam';
import path from 'path';
import { Gpio } from 'onoff';

const motionSensor = new Gpio(21, 'in');

// const FSWebcam = NodeWebcam.FSWebcam;

// const opts = {
//   width: 720,
//   height: 480,
//   quality: 60,
//   skip: 20,
//   output: 'jpeg',
//   callbackReturn: 'buffer',
//   timestamp: true
// };

// const cam = new FSWebcam(opts);

// const capture = (): Promise<Buffer> => new Promise((resolve, reject) => cam.capture('image', (error, data) => {
//   if (error) return reject(error);
//   return resolve(data);
// }));

const app = express();

app.use(cors());
app.use(bodyParser.json());


app.get('/api/image', async (req, res) => {
  const motion = (await motionSensor.read()) === 1;
  // const [image, motion] = await Promise.all([capture(), motionSensor.read()]);
  res.json({
    motion,
    time: new Date()
  })
})

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'assets/index.html')));
app.use(express.static('assets'))




app.listen(3000, () => console.log('Running!'));