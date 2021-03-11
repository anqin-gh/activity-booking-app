import login from './utils/login';
import { book, Time, fetchActivityMatchingTime as findActivityMatchingTime } from './utils/booking';
import config from 'config';

const loginURL: string = config.get('loginUrl');
const email: string = config.get('email');
const password: string = config.get('password');
const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednsday', 'thursday', 'friday', 'saturday'];
const daysOfYoga = config.get('daysOfYoga')! as Array<number>;

(async function run() {
   try {
      const cookie = await login(loginURL, email, password);
      if (!cookie) throw new Error('Could not login!');

      let afterTomorrow = new Date();
      afterTomorrow.setDate(new Date().getDate() + 2);

      const today = afterTomorrow.getDay();
      if (!daysOfYoga.includes(today)) {
         console.log(`Nothing to book for ${daysOfWeek[today]}`);
         return;
      }

      const day = afterTomorrow.getDate();
      const [month, weekday] = afterTomorrow
         .toLocaleString('es-ES', { weekday: 'long', month: 'long' })
         .toLowerCase()
         .split(' ');
      const time: Time = {
         day: `${weekday}, ${day} ${month}`,
         hour: config.get('time'),
      };

      const activity = await findActivityMatchingTime(config.get('baseUrl'), cookie, time);
      if (activity) await book(config.get('bookingUrl'), cookie, activity);
      else throw Error('Activity not found!');
   } catch (err) {
      console.log(err);
   }
})();
