import emailjs from "@emailjs/browser";

type EmailParams = {
	to_email: string;
	title: string;
	message: string;
};

const sendEmailJs = async (params: EmailParams) => {
	const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
	const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
	const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

	if (!serviceId || !templateId || !publicKey) {
		throw new Error(
			"Не заданы переменные VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID или VITE_EMAILJS_PUBLIC_KEY",
		);
	}

	try {
		await emailjs.send(serviceId, templateId, params, { publicKey });
	} catch (error) {
		console.error("Ошибка при отправке email", error);
		throw error;
	}
};

export { sendEmailJs };