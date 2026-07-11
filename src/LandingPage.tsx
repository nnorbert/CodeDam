import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Header } from "./components/Header";
import codedamLogo from "./assets/theme/CodeDam/images/codedam.webp";
import beavyMainImage from "./assets/theme/CodeDam/images/landing_page/beavy_main.webp";
import beavyLogoImage from "./assets/theme/CodeDam/images/landing_page/Beavy.webp";
import bubbleImage from "./assets/theme/CodeDam/images/landing_page/bubble.webp";
import bubble2Image from "./assets/theme/CodeDam/images/landing_page/bubble_2.webp";
import devicesImage from "./assets/theme/CodeDam/images/landing_page/devices.webp";
import partnerImage from "./assets/theme/CodeDam/images/landing_page/ikca-logo.webp";
import helpingHandsImage from "./assets/theme/CodeDam/images/landing_page/helping_hands.webp";
import "./LandingPage.scss";

const narrowBubbleMediaQuery = "(max-width: 859px)";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-section landing-section--header">
        <div className="landing-container landing-container--flush-y">
          <Header activeMenuItem="home" showBeavy={false} />
          <div className="landing-hero">
            <div className="landing-hero__group">
              <img
                src={beavyMainImage}
                alt="Beavy"
                className="landing-hero__img"
              />
              <div className="landing-hero__bubble">
                <picture>
                  <source media={narrowBubbleMediaQuery} srcSet={bubble2Image} />
                  <img
                    src={bubbleImage}
                    alt="text bubble image"
                    className="landing-hero__bubble-img"
                    aria-hidden="true"
                  />
                </picture>
                <p className="landing-hero__bubble-text">
                  <span className="landing-hero__bubble-text-inner">
                    Hi! I&apos;m{" "}
                    <img
                      src={beavyLogoImage}
                      alt="Beavy"
                      className="landing-hero__bubble-beavy-logo"
                    />
                    .
                    <br />
                    Ready to learn coding the fun way?
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="landing-hero-cta">
            <a className="landing-hero-cta__button" href="/playground">
              Start Building
            </a>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-section landing-section--intro" aria-label="About CodeDam">
          <div className="landing-container">
            <p className="landing-intro__copy">
              CodeDam is a free visual coding playground for kids. Learn loops, variables, and logic
              by snapping blocks together — then see real JavaScript or Python code appear as you build.
            </p>
          </div>
        </section>

        <section className="landing-section landing-section--devices" aria-label="Devices">
          <div className="landing-container landing-section__content">
            <div className="landing-split">
              <div className="landing-split__text">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">
                    Code anywhere — on any device
                  </strong>
                  <p className="landing-split__copy">Learning is just a click away!</p>
                  <p className="landing-split__copy">
                    Open CodeDam in your browser on a laptop or tablet. The playground works with
                    mouse, keyboard, and touch, so kids can keep building whether they&apos;re at home,
                    in class, or on the go. No downloads, no accounts required to get started.
                  </p>
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

        <section className="landing-section landing-section--how-it-works" aria-label="How it works">
          <div className="landing-container landing-section__content">
            <div className="landing-split">
              <div className="landing-split__text">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">
                    Build with blocks. Learn real code.
                  </strong>
                  <p className="landing-split__copy">
                    CodeDam&apos;s Workshop is filled with drag-and-drop blocks for variables, math,
                    conditions, loops, and more. Snap them together on the canvas to create programs step by step.
                    Hit Run to see your program execute — and watch the matching JavaScript or Python code update
                    in real time. Save your projects, load them later, and pick up right where you left off.
                  </p>
                  <ul className="landing-split__copy">
                    <li><strong>Drag &amp; drop</strong> — no syntax errors while you learn</li>
                    <li><strong>Step through code</strong> — see exactly what each block does</li>
                    <li><strong>Real languages</strong> — preview JavaScript and Python as you build</li>
                    <li><strong>Save &amp; share</strong> — download projects and come back anytime</li>
                  </ul>
                </div>
              </div>
              <div className="landing-split__text">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">
                    Made for curious kids — trusted by parents and teachers
                  </strong>
                  <p className="landing-split__copy">
                    CodeDam is designed for children who are ready to move beyond games and start thinking like
                    programmers. The friendly interface keeps things approachable, while the underlying concepts —
                    variables, logic, loops — are the same ones used in professional software development.
                    Whether you&apos;re a parent looking for a safe first coding tool, a teacher running a classroom
                    activity, or a kid who just wants to build something cool with Beavy — you&apos;re in the right place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--partners" aria-label="Partners">
          <div className="landing-container landing-section__content">
            <div className="landing-split landing-split--media-left">
              <div className="landing-split__text">
                <div className="landing-split__text-inner">
                  <strong className="landing-split__title">
                    Proud partner of the International Kids Coding Association
                  </strong>
                  <p className="landing-split__copy">
                    CodeDam shares a mission with IKCA: making coding education accessible to children everywhere.
                    IKCA is a non-profit organization dedicated to teaching kids how to code and understand technology —
                    because digital literacy is one of the most powerful skills a child can learn.
                  </p>
                  <p className="landing-split__copy">
                    Through this partnership, CodeDam supports IKCA&apos;s global outreach programs and helps bring
                    hands-on coding experiences to more young learners.
                  </p>
                  <p className="landing-split__copy">
                    Interested in collaborating or want to know more about IKCA? Visit{" "}
                    <strong>
                      <u>
                        <a href="https://internationalkidscoding.org/" target="_blank" rel="noreferrer">
                          internationalkidscoding.org
                        </a>
                      </u>
                    </strong>{" "}
                    to learn more about IKCA&apos;s programs and partnership opportunities.
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
                  <strong className="landing-split__title">
                    Help more kids discover the joy of coding
                  </strong>
                  <p className="landing-split__copy">
                    CodeDam is built to give every child a fun, accessible path into programming. Your support helps
                    us improve the platform, create new learning content, and reach students who might not otherwise
                    have access to coding tools.
                  </p>
                  <p className="landing-split__copy">
                    <strong>
                      20% of every donation goes directly to the International Kids Coding Association,
                    </strong>{" "}
                    supporting their non-profit work to teach children around the world.
                  </p>
                  <p className="landing-split__donate-cta">
                    <a className="donate-link" href="" target="_blank" rel="noreferrer">
                      Donate
                    </a>
                  </p>
                  <p className="landing-split__copy">
                    <i>Every contribution helps — thank you!</i>
                  </p>
                  <p className="landing-donation-disclaimer">
                    This is a personal, independently operated educational project and is not a registered charity
                    or nonprofit organisation. Contributions are voluntary and help cover hosting, domain and maintenance costs.
                    No goods or services are provided in exchange for a contribution.
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
                  <p className="landing-split__copy">
                    <a className="landing-footer__email" href="mailto:contact@codedam.eu">
                      <EnvelopeIcon className="landing-footer__email-icon" aria-hidden="true" />
                      contact@codedam.eu
                    </a>
                  </p>
                  {/* <p className="landing-split__copy">You also can contact us via our social media accounts.</p> */}
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
