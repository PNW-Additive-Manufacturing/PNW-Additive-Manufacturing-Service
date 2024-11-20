"use server";

import "server-only";
import { RequestEmail, RequestWithParts } from "@/app/Types/Request/Request";
import nodemailer from "nodemailer";
import DOMPurify from "isomorphic-dompurify";
import getConfig from "@/app/getConfig";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { formateDate } from "./Constants";
import { RequestServe } from "@/app/Types/Request/RequestServe";
import { randomUUID } from "crypto";
import { WalletTransaction } from "@/app/Types/Account/Wallet";
import Account from "@/app/Types/Account/Account";

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

export async function sendRequestEmail(emailKind: RequestEmail["kind"], request: RequestWithParts) {
	try {
		let emailSubject: string;
		let emailHTML: string;

		let trackingId = randomUUID();

		if (emailKind == "approved") {
			emailSubject = `Request for ${request.name} Approved`;
			emailHTML = await requestQuotedFreeHTML(request, trackingId);
		}
		else if (emailKind == "completed") {
			emailSubject = `Request for ${request.name} Completed`;
			emailHTML = await requestCompletedHTML(request, trackingId);
		}
		else if (emailKind == "quoted") {
			emailSubject = `Request for ${request.name} Quoted`;
			emailHTML = await requestQuotedHTML(request, trackingId);
		}
		// else if (email.kind == "received") {
		else {
			emailSubject = `Request for ${request.name} Received`;
			emailHTML = await requestReceivedHTML(request, trackingId);
		}

		await sendEmail(request.requesterEmail, emailSubject, emailHTML);

		await RequestServe.createSuccessfulEmail(trackingId, emailKind, request.id);
	}
	catch (error) {
		let failedReason: string = error instanceof Error ? error.name : "Unknown";

		await RequestServe.createFailedEmail(emailKind, request.id, failedReason);
	}
}

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
			<h2 style="margin-top:0px; font-family:'Helvetica'; letter-spacing:0.025em; font-weight:bolder;"><span style="color: #b1810b;">PNW</span> Additive Manufacturing Service</h2>
			
			<div style="max-width: 850px;">
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

export async function fundsAdded(transaction: WalletTransaction) {
	return emailTemplate(`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			\$${(transaction.amountInCents / 100).toFixed(2)} has been added to your account. To view this transaction in detail, please click on the button below.
		</p>
		<a href=${`${envConfig.hostURL}/user/profile#transaction-${transaction.id}`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Transaction</button>
		</a>`
	);
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

export async function requestReceivedHTML(request: RequestWithParts, trackingId?: string) {
	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been received. We are currently processing your request,
			and a quote will be provided within 1-2 business days.
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}${trackingId ? `?trackingId=${trackingId}` : ""}`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Request</button>
		</a>`
	);
}

export async function requestQuotedHTML(request: RequestWithParts, trackingId?: string) {
	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been approved and quoted and is estimated to be completed by ${formateDate(request.quote!.estimatedCompletionDate)}. To continue, please review and approve the quote on our website.
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}${trackingId ? `?trackingId=${trackingId}` : ""}#payment_details`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Quote</button>
		</a>`
	);
}

export async function requestQuotedFreeHTML(request: RequestWithParts, trackingId?: string) {
	return emailTemplateDearUser(
		request.firstName,
		request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been approved and is estimated to be completed by ${formateDate(request.quote!.estimatedCompletionDate)}. 
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}${trackingId ? `?trackingId=${trackingId}` : ""}#payment_details`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Request</button>
		</a>`
	);
}

export async function requestCompletedHTML(request: RequestWithParts, trackingId?: string) {
	return emailTemplateDearUser(request.firstName, request.lastName,
		`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			Your request for ${DOMPurify.sanitize(request.name)} has been completed. You may pick up your parts during our scheduled <a href=${`${envConfig.hostURL}/schedule`}>pickup hours</a> whenever you are available. Thank you for choosing the Additive Manufacturing Service of PNW!
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/user/${request.id}${trackingId ? `?trackingId=${trackingId}` : ""}`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">View Request</button>
		</a>`
	);
}

export async function maintainerRequestReceived(request: RequestWithParts) {
	return emailTemplate(`
		<p style="font-family: inherit; color: rgb(64, 64, 64); font-size: medium;">
			${request.firstName} ${request.lastName} has submitted a new request for ${request.name}.
		</p>
		<a href=${`${envConfig.hostURL}/dashboard/maintainer/orders/${request.id}`} target="_blank" style="font-family: inherit; text-decoration:none; height: fit-content; width: fit-content; display: block;">
			<button style="font-family: inherit; text-decoration: none; border-radius: 5px; padding: 1rem 1.2rem 1rem 1.2rem; padding-top: 12px; padding-bottom: 12px; display: block; margin-bottom: 0px; outline: none; border: none; background-color: #2b2b2b; color: white; font-size: large; font-weight: 500; text-wrap: nowrap; width: auto; font-size: small;">Manage Request</button>
		</a>`);
}