"use server";

import "server-only";
import { RequestWithParts } from "@/app/Types/Request/Request";
import nodemailer from "nodemailer";
import DOMPurify from "isomorphic-dompurify";
import getConfig from "@/app/getConfig";
import SMTPTransport from "nodemailer/lib/smtp-transport";

DOMPurify.setConfig({ USE_PROFILES: { html: false } });

const envConfig = getConfig();

const transportOptions: SMTPTransport.Options = {
	host: envConfig.email.host,
	port: 587,
	auth: {
		user: envConfig.email.user,
		pass: envConfig.email.password
	}
};
const transporter = nodemailer.createTransport(transportOptions);

export async function sendEmail(to: string, subject: string, html: string) {
	try {
		const sessionInfo = await transporter.sendMail({
			from: `Additive Manufacturing Service of PNW <${envConfig.email.user}>`,
			to,
			subject,
			html
		});
		return sessionInfo.messageId;
	} catch (error) {
		console.error(
			`Failed to send email to ${to} through ${transporter.options}`
		);
		throw error;
	}
}

export async function emailTemplate(content: string) {
	return `
		<div style="font-family:inherit;background-color:rgb(248,248,248);padding:1.5rem;border-radius:12px;color:rgb(64,64,64);">
			<h1 style="margin-top:0px; font-family:'Helvetica'; letter-spacing:0.025em; font-weight:bolder;"><span style="color: #b1810b;">PNW</span> Additive Manufacturing Service</h1>
			
			<div style="max-width: 650px;">
				${content}
			</div>
		</div>`;
}

export async function emailTemplateDearUser(
	firstName: string,
	lastName: string,
	content: string
) {
	return emailTemplate(`
		${`<p style="font-family: inherit; color: rgb(64, 64, 64);">
			Dear ${DOMPurify.sanitize(firstName)} ${DOMPurify.sanitize(lastName)},
		</p>`}
		${content}`);
}

export async function verifyEmailTemplate(verifyUrl: string) {
	return emailTemplate(`
		<p style="font-family: inherit; color: rgb(64, 64, 64);">
			To complete your registration, please verify your email address by clicking the button below.
		</p>
		<a href=${verifyUrl} target="_blank" style="font-family: inherit; text-decoration:none;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">Verify Email</button>
		</a>
	`);
}

export async function requestReceivedHTML(request: RequestWithParts) {
	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64);">
			Thank you for reaching out to us with your request for
			<span style="text-decoration: underline;">${DOMPurify.sanitize(
				request.name
			)}</span>. We are currently processing your request,
			and a quote will be provided within 1-2 business days. If
			you have any further questions please visit the status page.
		</p>
		<a href=${`http://localhost:3000/dashboard/user/${request.id}`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Request</button>
		</a>`
	);
}

export async function requestQuotedHTML(request: RequestWithParts) {
	// const formattedCost = getTotalCost(request).totalCost.toFixed(2);

	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64);">
			We are pleased to inform you that your request for <span style="text-decoration: underline;">${DOMPurify.sanitize(
				request.name
			)}</span> has been approved and quoted.
			To continue, please review and approve the quote on our website.
		</p>
		<a href=${`http://localhost:3000/dashboard/user/${request.id}#payment_details`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Quote</button>
		</a>`
	);
}
