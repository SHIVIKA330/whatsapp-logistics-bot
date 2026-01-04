const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize the Client
// LocalAuth stores the session so you don't have to scan QR every time
const client = new Client({
    authStrategy: new LocalAuth()
});

console.log('Initializing Bot...');

// Generate QR Code for login
client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP LINKED DEVICE OPTION:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready! Send "Hi" to this number to test.');
});

// Simple in-memory state management
// Structure: { 'user_phone_number': 'current_step' }
const userState = {};
const userData = {}; // To store choices

// Owner/Service Contacts (Replace with real numbers, include country code)
// Format: 9358505935@c.us
const OWNER_ID = '9358505935@c.us';
const TECH_ID = '9634222550@c.us';

client.on('message', async msg => {
    const chat = await msg.getChat();
    // const contact = await msg.getContact(); // method is currently unstable
    const contactName = "Guest"; // Fallback
    const userId = msg.from; // e.g., 9358505935@c.us
    const text = msg.body.trim().toLowerCase();

    // Ignore groups for now
    if (chat.isGroup) return;

    // --- ADMIN COMMANDS ---

    // Command: !dispatch <Phone> | <GR> | <Consignee> | <City> | <Qty> | <E-GR Link>
    if (text.startsWith('!dispatch')) {
        // Use slice to correctly remove "!dispatch" regardless of original casing
        // "!dispatch".length is 9
        const cleanMessage = msg.body.slice(9).trim();
        const args = cleanMessage.split('|').map(arg => arg.trim());

        if (args.length < 6) {
            await msg.reply('❌ Format Error! Use:\n!dispatch <Phone> | <GR> | <Consignee> | <City> | <Qty> | <E-GR Link>');
            return;
        }

        let [rawPhone, grNo, consignee, city, qty, link] = args;

        // Basic phone sanitization (assuming India +91 default if missing)
        let targetPhone = rawPhone.replace(/\D/g, ''); // Remove non-digits
        if (targetPhone.length === 10) targetPhone = '91' + targetPhone;
        targetPhone = targetPhone + '@c.us';

        const dispatchMessage = `Dear customer, this is to inform you that you consignment has been booked with us.

Order Number: ${grNo}
Consignor: THE MANISH ENGINEERING CORPORATION(AGRA)
Consignee: ${consignee}
From: AGRA
To: ${city}
Quantity: ${qty}

Download e-GR from: ${link}

Customer Care Number: 9358505935, 9634222550

JAIN KANTE WALE AGRA`;

        try {
            await client.sendMessage(targetPhone, dispatchMessage);
            await msg.reply(`✅ Dispatch notification sent to ${rawPhone}`);
        } catch (err) {
            console.error(err);
            await msg.reply('❌ Failed to send message. Check phone number.');
        }
        return;
    }

    // --- LOGIC FLOW ---

    // 1. Reset / Start
    if (text === 'hi' || text === 'hello' || text === 'menu' || text === 'start') {
        userState[userId] = 'START';
        await chat.sendMessage(
            `👋 Welcome to *Jain Kante Wale*!\n\nI am your automated assistant. How can we help you today?\n\n1️⃣ Buy a New Scale\n2️⃣ Repair / Service\n3️⃣ Contact Support\n\n_Reply with 1, 2, or 3_`
        );
        return;
    }

    // Checking State
    const currentState = userState[userId];

    if (!currentState) {
        // If message received but no state, suggest starting
        // Optional: only reply if it looks like a query
        // await chat.sendMessage(`Hi ${contact.pushname}! Reply with "Menu" to see options.`);
        return;
    }

    // --- STEP 1: Main Menu Selection ---
    if (currentState === 'START') {
        if (text === '1') {
            userState[userId] = 'SALES_TYPE';
            await chat.sendMessage(
                `🛒 *Sales Inquiry*\n\nBe glad to help! What type of scale do you need?\n\n1️⃣ Industrial (Heavy Duty)\n2️⃣ Retail / Shop Scale\n3️⃣ Laboratory / Precision\n\n_Reply with 1, 2, or 3_`
            );
        } else if (text === '2') {
            userState[userId] = 'SERVICE_ISSUE';
            await chat.sendMessage(
                `🔧 *Repair Request*\n\nSorry to hear you're having trouble. What seems to be the issue?\n\n1️⃣ Not Powering On\n2️⃣ Weight Inaccurate\n3️⃣ Physical Damage\n4️⃣ Other\n\n_Reply with number_`
            );
        } else if (text === '3') {
            userState[userId] = null; // End session
            await chat.sendMessage(
                `📞 *Contact Us*\n\nOffice: 18, Sharada Complex, Daresi No 2, Chhata Rd, Agra, Uttar Pradesh 282003\nPhone: +91-9358505935\nEmail: contact@jainkantewaleagra.com\n\nHave a great day!`
            );
        } else {
            await chat.sendMessage(`Please Select you choice. Please reply with 1, 2, or 3.`);
        }
        return;
    }

    // --- SALES PATH ---
    if (currentState === 'SALES_TYPE') {
        const categories = { '1': 'Industrial', '2': 'Retail', '3': 'Laboratory' };
        if (categories[text]) {
            userData[userId] = { category: categories[text] };
            userState[userId] = 'SALES_CAPACITY';
            await chat.sendMessage(
                `Got it: *${categories[text]} Scale*.\n\nNow, what is the max capacity you need?\n\n1️⃣ Small (< 50kg)\n2️⃣ Medium (50kg - 500kg)\n3️⃣ Large (1 Ton +)\n\n_Reply with 1, 2, or 3_`
            );
        } else {
            await chat.sendMessage(`Please reply with 1, 2, or 3.`);
        }
        return;
    }

    if (currentState === 'SALES_CAPACITY') {
        const caps = { '1': 'Small (<50kg)', '2': 'Medium (50-500kg)', '3': 'Large (1T+)' };
        if (caps[text]) {
            const finalCat = userData[userId].category;
            const finalCap = caps[text];

            await chat.sendMessage(
                `✅ *Perfect!*\n\nI have gathered your requirement:\n- Type: ${finalCat}\n- Capacity: ${finalCap}\n\nI am forwarding this to the Shop Owner right now. They will contact you shortly.`
            );

            // Notify Owner (Simulated)
            // In a real scenario, you can uncomment this to message the owner automatically
            /*
            client.sendMessage(OWNER_ID, `🔔 *New Lead!*\nCustomer: ${contact.number}\nRequirement: ${finalCat} scale, ${finalCap}.`);
            */

            userState[userId] = null; // Reset
        } else {
            await chat.sendMessage(`Please reply with 1, 2, or 3.`);
        }
        return;
    }

    // --- SERVICE PATH ---
    if (currentState === 'SERVICE_ISSUE') {
        const issues = { '1': 'Power Issue', '2': 'Inaccuracy', '3': 'Damage', '4': 'Other' };
        if (issues[text]) {
            await chat.sendMessage(
                `⚠️ *Ticket Created*\n\nIssue: ${issues[text]}\n\nI have alerted our Service Technician. Contact on this no. 9634222550. Please bring your scale to our center or await a call for a site visit.\n\nThank you!`
            );

            // Notify Tech
            /*
            client.sendMessage(TECH_ID, `🛠️ *Service Alert*\nCustomer: ${contact.number}\nIssue: ${issues[text]}`);
            */

            userState[userId] = null;
        } else {
            await chat.sendMessage(`Please select a valid option.`);
        }
        return;
    }

});

client.initialize();
