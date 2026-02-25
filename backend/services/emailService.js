import nodemailer from "nodemailer";

// Simple developer simulation for email
export const sendEmail = async ({ to, subject, text, html }) => {
    console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);

    // Fallback to real nodemailer if credentials provided, otherwise just log
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `"SmartHire" <${process.env.MAIL_USER}>`,
                to,
                subject,
                text,
                html
            });
            console.log(`Email sent successfully to ${to}`);
        } catch (error) {
            console.error("Error sending real email, falling back to log only:", error);
        }
    }
};

export const sendInterviewInvite = async (candidateEmail, candidateName, jobTitle, companyName, date, time, link) => {
    const subject = `Interview Scheduled: ${jobTitle} at ${companyName}`;
    const html = `
        <h1>Hello ${candidateName},</h1>
        <p>Your interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Meeting Link:</strong> <a href="${link}">${link}</a></p>
        <p>Good luck!</p>
        <p>SmartHire Team</p>
    `;
    await sendEmail({ to: candidateEmail, subject, html });
};
