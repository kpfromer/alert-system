import spawn from 'spawn-command';
import chalk from 'chalk';
import ffmpeg from 'fluent-ffmpeg';

// This are the scripts created from the gulp "build" process

const commands = [
  {
    name: 'Image streaming server',
    command: 'node image-stream.js'
  },
  {
    name: 'Express server',
    command: 'node express.js'
  },
  {
    name: 'ffmpeg',
    command: 'ffmpeg -f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0 -f mpegts -codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 http://localhost:8081/secret'
  }
];

// const r = () => ffmpeg.inputFormat('v4l2').inputFPS(25).size('640x480').input('/dev/vided0').videoCodec('mpeg1video').output('http://localhost:8081/secret')

// r();

const log = (name, data) => console.log(`"${chalk.cyan(name)}": ${chalk.white(data)}`);

commands.forEach(definition => {
  console.log(chalk.redBright(`Starting command "${definition.name}"`));
  const child = spawn(definition.command);
  child.stdout.on('data', data => log(definition.name, data));
  child.on('exit', () => log(definition.name, 'exited'));
});