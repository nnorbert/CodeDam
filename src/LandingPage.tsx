import { Header } from "./components/Header";
import codedamLogo from "./assets/theme/CodeDam/images/codedam.webp";
import devicesImage from "./assets/theme/CodeDam/images/landing_page/devices.webp";
import partnerImage from "./assets/theme/CodeDam/images/landing_page/ikca-logo.webp";
import helpingHandsImage from "./assets/theme/CodeDam/images/landing_page/helping_hands.webp";
import "./LandingPage.scss";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-section landing-section--header">
        <div className="landing-container landing-container--flush-y">
          <Header activeMenuItem="home" showBeavy={false} />
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-section landing-section--devices" aria-label="Devices">
          <div className="landing-container landing-section__content">
            <div className="landing-split">
              <div className="landing-split__text">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">Learning is just a click away</strong>
                  <br />
                  <p className="landing-split__copy">Play on your PC, tablet or phone</p>
                </div>
              </div>
              <div className="landing-split__media">
                <img
                  src={devicesImage}
                  alt="CodeDam on pc and tablet"
                  className="landing-split__img"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--partners" aria-label="Partners">
          <div className="landing-container landing-section__content">
            <div className="landing-split landing-split--media-left">
              <div className="landing-split__text">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">Partner with International Kids Coding Association</strong>
                  <br />
                  <p className="landing-split__copy text-justify">
                    Our mission is to bring knowledge of coding to children all over the world. We are a non-profit organization
                    that is dedicated to teaching children how to code and learn about technology. We beleive that knowledge is
                    the most powerful tool in the world and we want to help children learn how to use it.
                  </p>
                  <p className="landing-split__copy text-justify mt-4">
                    If you are interested in partnering with us, please visit
                    <strong className="ml-2">
                      <a href="https://internationalkidscoding.org/" target="_blank" rel="noreferrer">
                        our website
                      </a>
                    </strong>
                    .
                  </p>
                </div>
              </div>
              <div className="landing-split__media">
                <img
                  src={partnerImage}
                  alt="International Kids Coding Association"
                  className="landing-split__img"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--donations" aria-label="Donations">
          <div className="landing-container landing-section__content">
            <div className="landing-split">
              <div className="landing-split__text">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">Empower Kids to Code the Future</strong>
                  <p className="landing-split__copy text-justify">
                    CodeDam is shaping the next generation of innovators. With your support, we can expand
                    our learning programs and make coding education available to more children.
                  </p>
                  <p className="landing-split__copy mt-4">
                    <strong>20% of every donation will be sent to the International Kids Coding Association.</strong>
                  </p>
                  <p className="mt-6">
                    <a className="donate-link" href="" target="_blank">Donate</a>
                  </p>
                </div>
              </div>
              <div className="landing-split__media">
                <img
                  src={helpingHandsImage}
                  alt="Help our mission"
                  className="landing-split__img"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--footer" aria-label="Footer">
          <div className="landing-container landing-section__content">
            <div className="landing-split landing-footer">
              <div className="landing-split__media landing-footer__brand">
                <img
                  src={codedamLogo}
                  alt="CodeDam"
                  className="landing-footer__logo"
                />
              </div>
              <div className="landing-split__text landing-footer__contact">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">Contact</strong>
                  <p className="landing-split__copy">...@codedam.com</p>
                  <p className="landing-split__copy">You also can contact us via our social media accounts.</p>
                  {/* <p className="landing-split__copy">
                    <a href="https://www.facebook.com/codedam" target="_blank" rel="noreferrer">Facebook</a><br />
                    <a href="https://www.twitter.com/codedam" target="_blank" rel="noreferrer">Twitter</a><br />
                    <a href="https://www.instagram.com/codedam" target="_blank" rel="noreferrer">Instagram</a><br />
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
