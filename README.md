# Languol

This is a Telegram robot that uses Neural Network to determine the message language and enable restrictions based on the predictions. 

This is a case study project.

# Telegram Robot Backend Project

This is a Node.js-based project for running a Telegram robot with various functionalities. The robot is designed to respond to specific commands and perform language detection on incoming messages. It utilizes the FastText(Neural Network) library for language detection.

## Features

The Telegram robot has the following functionalities:

1. **On/Off Command**: Allows the (owner/admin) to turn the robot on or off.
2. **Status Check Command**: Provides the current status of the robot (whether it is active or inactive).
3. **Check Command**: Performs language detection on a given string and identifies its language.
4. **Language Monitoring**: When the robot is active and added to a group chat, it monitors all incoming messages and responds if the message is not in English.

## Prerequisites

Before running the Telegram robot backend, ensure you have the following installed:

- Node.js (version 18.X.X)
- NPM (Node Package Manager)

## Installation

Follow the steps below to set up and run the Telegram robot backend:

1. Clone the project repository from GitHub: `git clone https://github.com/ethyaan/languol.git`
2. Navigate to the project directory: `cd telegram-robot-backend`
3. Install the required dependencies: `npm install`

## Configuration

To configure the Telegram robot, follow these steps:

1. Obtain a Telegram bot token by creating a new bot using the BotFather.
2. Rename the `env.sample` file to `.env`.
3. Open `.env` and replace the placeholder values with your Telegram bot token.

## Usage

To start the Telegram robot backend, run the following command:

```
npm start
```

The backend server will start running and connect to the Telegram API. You can now interact with the robot using the configured commands.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Acknowledgements

We would like to thank the developers of FastText for their language detection library, which greatly enhances the functionality of this Telegram robot.
note ( you might need to train a new model)

## Contact

For any further questions or inquiries, feel free to contact me [https://www.linkedin.com/in/ehsanaghaei/](https://www.linkedin.com/in/ehsanaghaei/)
