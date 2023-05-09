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
    status;

    constructor() {
        this.classifier = new fastText.Classifier(modelPath);
        this.bot = new TelegramBot(token, { polling: true });
        this.status = false; // means off
        this.listen();
    }

    listen = () => {

        this.bot.on('text', async (msg) => {
            if (!this.status) return true;

            // destructure the values from message
            const { chat: { id: chatId }, from: { id: userId }, text } = msg;
            console.log('Message===========>', text);

            try {
                const [{ label, value }] = await this.predictLanguage(text);
                const name = this.getLanguage(label.slice(-2));
            } catch (error) {
                console.log('Error occured', error);
            }

            // const userInfo = await this.bot.getChatMember(chatId, userId);
            // console.log('userInfo===========>', userInfo);
        });

        this.checkCommand();
        this.statusSwitch();

    }

    /**
     * check the given input and respond with the result
     */
    checkCommand = () => {
        this.bot.onText(/\/check/, async (msg) => {
            // destructure the values from message
            const { chat: { id: chatId }, from: { id: userId }, text } = msg;

            if (!!text) {
                try {
                    const [{ label, value }] = await this.predictLanguage(text);
                    const name = this.getLanguage(label.slice(-2));
                    this.bot.sendMessage(chatId, `predicted language: ${name} , accuracy: ${value.toFixed(8)}`);
                } catch (error) {
                    console.log('Error occured', error);
                    this.bot.sendMessage(chatId, error.toString());
                }
            } else {
                this.bot.sendMessage(chatId, 'Wrong input for check command use like `/check YourTextHere`');
            }
        });
    }

    /**
     * update the languol watch mode on or off
     */
    statusSwitch = () => {
        this.bot.onText(/\/languol/, (msg) => {
            // destructure the values from message
            const { chat: { id: chatId }, from: { id: userId }, text } = msg;
            // get the command 
            const command = (text && text.includes(' ')) ? text.split(' ')[1] : false;

            if (this.isAllowed(userId)) {
                if (command && ['on', 'off'].indexOf(command) > -1) {
                    this.status = (command === 'on');
                    this.bot.sendMessage(chatId, `Languol watching the user inputs: ${command}`);
                } else {
                    this.bot.sendMessage(chatId, 'Wrong Option, on or off');
                }
            }
        });
    }

    /**
     * get user information
     * @param {*} chatId 
     * @param {*} userId 
     */
    getUserInformation = async (chatId, userId) => {
        const userInfo = await this.bot.getChatMember(chatId, userId);
    }

    /**
     * check if current command sender is the bot owner or not.
     * @param {number} userId 
     * @returns 
     */
    isAllowed = (userId) => {
        return (adminId && adminId === userId.toString())
    }


    /**
     * identifies possibilities and shares the prediction scores
     * @param {*} text 
     * @param {*} k 
     */
    predictLanguage = (text, k = 4) => {
        return new Promise((resolve, reject) => {
            this.classifier.predict(text, k).then((res) => {
                res.length > 0 ? resolve(res) : reject('No matches find');
            }).catch((error) => {
                console.log('Error in fasttext', error);
                reject('Error happend!');
            });
        })
    }

    /**
     * get Language Name
     * @param {*} code 
     * @returns language name as string
     */
    getLanguage = (code) => {
        return new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
    }

}

export default new Languol();