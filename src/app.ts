import login from './utils/login';
import { book, Time, fetchActivityMatchingTime as findActivityMatchingTime } from './utils/booking';
import config from 'config';
import logger from './utils/logger';

const loginURL: string = config.get('loginUrl');
const baseUrl: string = config.get('baseUrl');
const bookingUrl: string = config.get('bookingUrl');
const email: string = config.get('email');
const password: string = config.get('password');
const daysOfWeek: string[] = ['sunday', 'monday', 'tuesday', 'wednsday', 'thursday', 'friday', 'saturday'];

let yogaClasses: Map<String, String> = new Map();
yogaClasses.set('monday', config.get('mondayClass'));
yogaClasses.set('tuesday', config.get('tuesdayClass'));
yogaClasses.set('wednsday', config.get('wednsdayClass'));
yogaClasses.set('thursday', config.get('thursdayClass'));
yogaClasses.set('friday', config.get('fridayClass'));

(async function run() {
   try {
      logger.info('Running application...');

      const cookie = await login(loginURL, email, password);
      if (!cookie) throw new Error('Could not login!');

      let afterTomorrow = new Date();
      afterTomorrow.setDate(new Date().getDate() + 2);

      const dayOfWeek = afterTomorrow.getDay();
      if (!yogaClasses.has(daysOfWeek[dayOfWeek])) {
         logger.info(`Nothing to book for ${daysOfWeek[dayOfWeek]}`);
         return;
      }

      const day = ('0' + (afterTomorrow.getDate())).slice(-2);
      const [month, weekday] = afterTomorrow
         .toLocaleString('es-ES', { weekday: 'long', month: 'long' })
         .toLowerCase()
         .split(' ');
      const time: Time = {
         day: `${weekday}, ${day} ${month}`,
         hour: yogaClasses.get(daysOfWeek[dayOfWeek])! as string,
      };

      const activity = await findActivityMatchingTime(baseUrl, cookie, time);
      if (!activity)
         throw Error(`Activity not found for ${time.day} at ${time.hour}!`);

      await book(bookingUrl, cookie, activity);

   } catch (err) {
      logger.error(err.message, err);
   }
})();
