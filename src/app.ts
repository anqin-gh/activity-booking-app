import login from './utils/login';
import { book, Time, fetchActivityMatchingTime as findActivityMatchingTime } from './utils/booking';
import config from 'config';
import logger from './utils/logger';

const loginURL: string = config.get('loginUrl');
const baseUrl: string = config.get('baseUrl');
const bookingUrl: string = config.get('bookingUrl');
const email: string = config.get('email');
const password: string = config.get('password');
const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednsday', 'thursday', 'friday', 'saturday'];
const daysOfYoga = config.get('daysOfYoga')! as Array<number>;

(async function run() {
   try {
      logger.info('Running application...');

      const cookie = await login(loginURL, email, password);
      if (!cookie) throw new Error('Could not login!');

      let afterTomorrow = new Date();
      afterTomorrow.setDate(new Date().getDate() + 2);

      const day = afterTomorrow.getDate();
      if (!daysOfYoga.includes(day)) {
         logger.info(`Nothing to book for ${daysOfWeek[day]}`);
         return;
      }

      const [month, weekday] = afterTomorrow
         .toLocaleString('es-ES', { weekday: 'long', month: 'long' })
         .toLowerCase()
         .split(' ');
      const time: Time = {
         day: `${weekday}, ${day} ${month}`,
         hour: config.get('time'),
      };

      const activity = await findActivityMatchingTime(baseUrl, cookie, time);
      if (activity) await book(bookingUrl, cookie, activity);
      else throw Error('Activity not found!');
   } catch (err) {
      logger.error(err.message, err);
   }
})();
