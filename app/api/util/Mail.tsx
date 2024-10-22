"use server";

import "server-only";
import { RequestWithParts } from "@/app/Types/Request/Request";
import nodemailer from "nodemailer";
import DOMPurify from "isomorphic-dompurify";
import getConfig from "@/app/getConfig";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { formateDate } from "./Constants";

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
		${`<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Dear ${DOMPurify.sanitize(firstName)} ${DOMPurify.sanitize(lastName)},
		</p>`}
		${content}`);
}

export async function verifyEmailTemplate(verifyUrl: string) {
	return emailTemplate(`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			To complete your registration, please verify your email address by clicking the button below.
		</p>
		<a href=${verifyUrl} target="_blank" style="font-family: inherit; text-decoration:none;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">Verify Email</button>
		</a>
	`);
}

export async function passwordResetTemplate(passwordResetUrl: string) {
	return emailTemplate(`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			It seems you've forgotten your password. Just click the button below, and you'll be taken to a secure page where you can create a new password.
		</p>
		<a href=${passwordResetUrl} target="_blank" style="font-family: inherit; text-decoration:none;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">Reset Password</button>
		</a>
	`);
}

export async function requestReceivedHTML(request: RequestWithParts) {
	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been received. We are currently processing your request,
			and a quote will be provided within 1-2 business days.
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Request</button>
		</a>`
	);
}

export async function requestQuotedHTML(request: RequestWithParts) {
	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been approved and quoted and is projected to be completed by ${formateDate(request.quote!.estimatedCompletionDate)}. To continue, please review and approve the quote on our website.
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}#payment_details`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Quote</button>
		</a>`
	);
}

export async function requestQuotedFreeHTML(request: RequestWithParts) {
	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been approved and is projected to be completed by ${formateDate(request.quote!.estimatedCompletionDate)}. 
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}#payment_details`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Request</button>
		</a>`
	);
}

export async function requestCompletedHTML(request: RequestWithParts) {
	return emailTemplateDearUser(request.firstName, request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been completed. You may pick up your parts during our <a href=${`${envConfig.hostURL}/schedule`}>pickup hours</a> whenever you are available. Thank you for choosing the Additive Manufacturing Service of PNW!
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Request</button>
		</a>`
	);
}

