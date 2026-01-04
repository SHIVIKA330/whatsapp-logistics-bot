const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const dotenv = require('dotenv');

dotenv.config();

// 1. Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve the dashboard
const PORT = process.env.PORT || 3000;

// 2. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR Code Generation
client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP LINKED DEVICE OPTION:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
});

client.on('authenticated', () => {
    console.log('✅ Authenticated successfully!');
});

// 3. Message Logic (Inbound)
client.on('message', async msg => {
    const text = msg.body.trim().toLowerCase();
    const chat = await msg.getChat();

    // Ignore groups
    if (chat.isGroup) return;

    if (text === '1') {
        await msg.reply('🚚 *Tracking Info*:\nYour consignment is currently at the *Agra Hub*. It is expected to be delivered by tomorrow.');
    } else if (text === '2') {
        await msg.reply('📄 Here is the link to download your e-GR:\nhttps://example.com/egr/download');
    } else if (text === '3') {
        await msg.reply('☎️ *Customer Support*:\nPlease call us at +91-9358505935 for immediate assistance.');
    } else if (['hi', 'hello', 'help'].includes(text)) {
        await msg.reply(`👋 Welcome to *Jain Kante Wale*!

I am your automated assistant.
How can we help you today?

1️⃣ Buy a New Scale
2️⃣ Repair / Service
3️⃣ Contact Support

_Reply with 1, 2, or 3_`);
    }
});

client.initialize();

// 4. API Endpoints (Outbound Trigger)
app.post('/api/send-booking', async (req, res) => {
    const {
        phoneNumber,
        complaintNo,
        productName,
        cdnCode,
        techName,
        techPhone
    } = req.body;

    if (!phoneNumber || !complaintNo) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Sanitize phone number: remove non-numeric chars
        let sanitizedPhone = phoneNumber.replace(/\D/g, '');

        // Ensure it has country code (default to 91 if length is 10)
        if (sanitizedPhone.length === 10) {
            sanitizedPhone = '91' + sanitizedPhone;
        }

        // Verify if the number is registered on WhatsApp
        const registeredUser = await client.getNumberId(sanitizedPhone);
        if (!registeredUser) {
            console.error(`Number not registered: ${sanitizedPhone}`);
            return res.status(400).json({ success: false, error: 'Phone number not registered on WhatsApp' });
        }

        const chatId = registeredUser._serialized;

        const dispatchMessage = `Your complaint req. ${complaintNo} for the ${productName} Shall be attended asap. Share CDN- ${cdnCode} if you are satisfied with our Service or want to cancel this request.

*JAIN KANTE WALE* team does not charge advance payment, please do not pay advance.

*JAIN KANTE WALE* after sale service is now on WhatsApp. For registering any type of request, say hi on watsup

Team *JAIN KANTE WALE*

Your Call no - ${complaintNo} is allocated to *${techName}*
${techPhone}.
he will be attending your call shortly.

Thanking you *JAIN KANTE WALE*`;

        // Send the main notification
        await client.sendMessage(chatId, dispatchMessage);

        // Send the interactive "menu" (Text based for stability)
        setTimeout(async () => {
            const menuMessage = `👋 Welcome to *Jain Kante Wale*!

I am your automated assistant.
How can we help you today?

1️⃣ Buy a New Scale
2️⃣ Repair / Service
3️⃣ Contact Support

_Reply with 1, 2, or 3_`;
            await client.sendMessage(chatId, menuMessage);
        }, 2000);

        res.json({ success: true, message: 'Messages queued successfully' });
    } catch (err) {
        console.error('Failed to send message:', err);
        res.status(500).json({ success: false, error: 'Failed to send message via WhatsApp Client', details: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Initializing WhatsApp Client...');
});
