import axios from 'axios';
import FormData from 'form-data';
import { parse, HTMLElement } from 'node-html-parser';

export async function book(bookingUrl: string, cookie: string, activity: string) {
      const data = new FormData();
      data.append('UniqueActivityCode', activity);
      data.append('ContractConditions', 'true');
      const response = await axios.post(bookingUrl, data, {
         headers: {
            Cookie: cookie,
            ...data.getHeaders(),
         },
      });
      console.log(response.status);
      console.log(response.data);
}

export interface Time {
   day: string;
   hour: string;
}

export async function fetchActivityMatchingTime(url: string, cookie: string, time: Time) {
   const response = await axios.get(url, {
      headers: {
         Cookie: cookie,
      },
   });

   const html = parse(response.data).removeWhitespace();
   const links = html.querySelectorAll('a[href^="#"]');
   const day = links.find((lnk) => lnk.getAttribute('data-date-target') === time.day);

   if (!day) throw Error(`Something wrong happened finding day ${day}`);

   const dayId = day.getAttribute('href')! as string;
   const button = html
      .querySelector(dayId)
      .querySelectorAll('.activity-booking-button')
      .find(
         (btn) =>
            (<HTMLElement>btn.parentNode.parentNode.childNodes[0]).structuredText === time.hour
      );
   if (button) return button.rawAttributes['data-target'];
   return undefined;
}
