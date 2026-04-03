import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
    await transporter.sendMail({
        from: `"Plant Shop" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your OTP Code",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>OTP Verification</h2>
                <p>Your OTP code is:</p>
                <h1 style="letter-spacing: 8px; color: #2e7d32;">${otp}</h1>
                <p>This code expires in <strong>1 hour</strong>.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `,
    });
};
