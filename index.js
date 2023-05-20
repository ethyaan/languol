import TelegramBot from 'node-telegram-bot-api';
import fastText from 'fasttext';
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Low } from 'lowdb'
import lodash from 'lodash';
import { JSONFile } from 'lowdb/node'
console.log('_DEBUG_ =>',);

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json')

class LowWithLodash extends Low {
    chain = lodash.chain(this).get('data')
}

// Configure lowdb to write data to JSON file
const adapter = new JSONFile(file);
const db = new LowWithLodash(adapter, { chats: {} });
await db.read();
const { data: { chats } } = db;

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
        this.status = true; // means off
        this.listen();
    }

    listen = () => {

        this.bot.on('text', async (msg) => {
            // destructure the values from message
            const { chat: { id: chatId }, from: { id: userId }, text } = msg;
            // check if robot is enabled for this chat by admin
            if (this.isActive(chatId)) return true;

            this.isAdminAllowed(chatId, userId);

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
            const { chat: { id: chatId }, text } = msg;

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
        this.bot.onText(/\/languol/, async (msg) => {
            // destructure the values from message
            const { chat: { id: chatId }, from: { id: userId }, text } = msg;
            // get the command 
            const command = (text && text.includes(' ')) ? text.split(' ')[1] : false;

            // if (this.isAllowed(userId)) { // an other type of check only for bot owner, hard coded as config
            if (this.isAdminAllowed(chatId, userId)) {
                if (command && ['on', 'off'].indexOf(command) > -1) {
                    this.status = (command === 'on');
                    this.updateStatus(chatId, command);
                    this.bot.sendMessage(chatId, `Languol watching the user inputs: ${command}`);
                } else {
                    this.bot.sendMessage(chatId, 'Wrong Option, on or off');
                }
            }
        });
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
     * check if user is admin or owner
     * @param {*} chatId 
     * @param {*} userId 
     * @returns 
     */
    isAdminAllowed = async (chatId, userId) => {
        try {
            // get user information
            const { status } = await this.bot.getChatMember(chatId, userId);
            // check if user is admin or owner
            return (['creator', 'administrator'].indexOf(status) > -1);
        } catch (error) {
            console.log('Error check user permission =>', error);
        }
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

    /**
     * update the bot status in db for a specific chat
     * @param {*} chatId 
     * @param {*} status 
     */
    updateStatus = async (chatId, status) => {
        try {
            const currenChat = chats[`${chatId}`] || {};
            // we do two level of assignment to keep the possible existing values
            Object.assign(currenChat, { status });
            Object.assign(chats, { [chatId]: currenChat });
            await db.write();
        } catch (error) {
            console.error('Error update bot status =>', error);
        }
    }

    /**
     * check if robot is active for this chat
     * @param {*} chatId 
     * @returns 
     */
    isActive = (chatId) => {
        return (chats[`${chatId}`]?.status === 'on');
    }
}

export default new Languol();