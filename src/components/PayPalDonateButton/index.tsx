const HOSTED_BUTTON_ID = "HBDP4VJFZRSTN";
const DONATE_URL = `https://www.paypal.com/donate/?hosted_button_id=${HOSTED_BUTTON_ID}`;

export function PayPalDonateButton() {
  return (
    <a
      className="donate-link"
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Donate
    </a>
  );
}
