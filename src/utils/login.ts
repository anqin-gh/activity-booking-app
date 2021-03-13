import { parse } from 'node-html-parser';
import FormData from 'form-data';
import axios from 'axios';
import { strict as assert } from 'assert';

export default async (loginUrl: string, email: string, password: string) => {
   const { verificationToken, cookie } = await fetchLoginCredentials(loginUrl);

   const form = new FormData();
   form.append('Input.Email', email);
   form.append('Input.Password', password);
   form.append(verificationToken.name, verificationToken.value);

   const response = await axios.post(loginUrl, form, {
      headers: {
         Cookie: cookie,
         ...form.getHeaders(),
      },
   });

   const cookies: string[] = response.headers['set-cookie'];
   assert.deepEqual(cookies.length, 1);
   return cookies[0];
};

async function fetchLoginCredentials(loginUrl: string) {
   const response = await axios.get(loginUrl, { withCredentials: true });
   const html = parse(response.data);
   const verificationToken = html.querySelector('input[name="__RequestVerificationToken"]')
      .attributes;

   const cookies = response.headers['set-cookie'];
   assert.deepEqual(cookies.length, 1);

   return {
      verificationToken: verificationToken,
      cookie: cookies[0],
   };
}
