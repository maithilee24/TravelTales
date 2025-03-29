import nodeMailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import hbs from "nodemailer-express-handlebars";
import { fileURLToPath } from "node:url";

dotenv.config();

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const sendEmail = async (subject, send_to, send_from, reply_to, template, name, link) => {
    const transporter = nodeMailer.createTransport({
        service: "Outlook365", // Optional
        host: "smtp.office365.com",
        port: 587,
        secure: false, // Use STARTTLS instead of SSL/TLS
        auth: {
            user: process.env.USER_EMAIL, // Your email address
            pass: process.env.EMAIL_APP_PASSWORD, // Your password or app password
        },
    });
    

    const handlebarsOptions = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve(_dirname, "../views/"),
            defaultLayout: false,
        },
        viewPath: path.resolve(_dirname, "../views/"),
        extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarsOptions));

    const mailOptions = {
        from: send_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        template: template,
        context: {
            name: name,
            link: link,
        },
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};

export default sendEmail;
