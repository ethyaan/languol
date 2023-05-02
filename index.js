import path from 'path';
import TelegramBot from 'node-telegram-bot-api';
import fastText from 'fasttext';

const token = process.env.TELEGRAM_API_KEY;
const adminId = process.env.ADMIN_USER_ID;
const modelPath = './models/lid.176.bin';

// Languol Bot Instance

class Languol {

    classifier;
    bot;

    constructor() {
        this.classifier = new fastText.Classifier(modelPath);
        this.bot = new TelegramBot(token, { polling: true });
        this.listen();
    }

    listen = () => {
        // this.bot.on('message', async (msg) => {
        //     // console.log('Message =>', msg);

        //     // classifier.predict(msg.text, 2)
        //     //     .then((res) => {
        //     //         if (res.length > 0) {
        //     //             console.log('_DEBUG_ =>', res);
        //     //             // let tag = res[0].label; // __label__knives
        //     //             // let confidence = res[0].value // 0.8787146210670471
        //     //             // console.log('classify', tag, confidence, res);
        //     //         } else {
        //     //             console.log('No matches');
        //     //         }
        //     //     });

        //     const chatId = msg.chat.id;
        //     const userId = msg.from.id;
        //     const userInfo = await this.bot.getChatMember(chatId, userId);
        //     console.log('_DEBUG_ =>', userInfo);
        //     // send a message to the chat acknowledging receipt of their message
        //     // bot.sendMessage(chatId, 'Received your message');
        // });

        this.statusSwitch();

    }

    statusSwitch = () => {
        this.bot.onText(/\/languol/, (msg) => {
            // destructure the values from message
            const { chat: { id: chatId }, from: { id: userId }, text } = msg;
            // get the command 
            const command = (text && text.includes(' ')) ? text.split(' ')[1] : false;

            console.log('_sdfdsdsf =>', this.isAllowed(userId));

            // check if command is valid or not
            console.log('bef =>', command);
            if (command && ['on', 'off'].indexOf(command) > -1) {
                console.log('command =>', command);
            } else {
                this.bot.sendMessage(chatId, 'Wrong Option, on or off');
            }
            // bot.sendPhoto(msg.chat.id, photo, {
            //     caption: "I'm a bot!"
            // });
        });
    }

    getUserInformation = async (chatId, userId) => {
        const userInfo = await this.bot.getChatMember(chatId, userId);
        console.log('_DEBUG_ =>', userInfo);
    }

    /**
     * check if current command sender is the bot owner or not.
     * @param {number} userId 
     * @returns 
     */
    isAllowed = (userId) => {
        console.log('rsss =>', adminId, userId);
        return (adminId && adminId === userId.toString())
    }


    /**
     * identifies possibilities and shares the prediction scores
     * @param {*} text 
     * @param {*} k 
     */
    predictLanguage = (text, k = 2) => {
        new Promise((resolve, reject) => {
            this.classifier.predict(text, k).then((res) => {
                res.length > 0 ? resolve(res) : reject('No matches find');
            }).catch(reject('Error happend!'));
        })
    }

}

export default new Languol();