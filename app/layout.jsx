import './globals.css';
import BugReport from './components/BugReport';

export const metadata = {
  title: 'TabTogether',
  description: 'The Easiest Way to Split Bills and Settle Payments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <div className="container">
            <img src="/assets/TabTogetherLogo.png" alt="TabTogether logo" onError="this.style.display='none'" />
            <div className="title-block">
              <div className="brand">Tab Together</div>
              <div className="slogan">The Easiest Way to Split Bills and Settle Payments</div>
            </div>
          </div>
        </div>
        {children}
        <footer className="made-by">
          <a href="https://github.com/DigitalKevin" target="_blank" rel="noopener noreferrer">
            Built by <span>Kevin Hoang</span>
          </a>
        </footer>
        <BugReport />
      </body>
    </html>
  );
}
