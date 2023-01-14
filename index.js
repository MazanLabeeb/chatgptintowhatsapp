import { ChatGPTAPIBrowser } from 'chatgpt'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import qrcode from "qrcode-terminal";
import whatsappweb from "whatsapp-web.js";

const { Client, LocalAuth } = whatsappweb;


var whatsappIsReady = false;

const client = new Client({
    authStrategy: new LocalAuth(),

});
client.on('authenticated', (session) => {
    // Save the session object however you prefer.
    // Convert it to json, save it to a file, store it in a database...
    console.log("> User Logged In");
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});
client.on('ready', () => {
    console.log('> Client is ready!');
    whatsappIsReady = true;
});
client.initialize();



(async () => {
    // use puppeteer to bypass cloudflare (headful because of captchas)
    const api = new ChatGPTAPIBrowser({
        email: process.env.OPENAI_EMAIL,
        password: process.env.OPENAI_PASSWORD,
        isGoogleLogin: true
    })

    await api.initSession() 

    client.on('message', message => {

        console.log(
            `From: ${message._data.id.remote} (${message._data.notifyName})`
        );
        console.log(`Message: ${message.body}`);

        if (message.body.toLocaleLowerCase().includes(process.env.CMD)) {

            api.sendMessage(message)
                .then((result) => {
                    console.log(`GPT: ${result.response}`);
                    
                    message.reply(result.response);
                })
                .catch(e => {
                    console.log(e);
                    message.reply(e.toString());
                })

        }
    });


})();