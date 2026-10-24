import styles from './layout.module.css';
import { Footer } from "./footer";
import { Header } from "./header";

interface IPrivateLayoutProps {
    children: React.ReactNode;
}

export const PrivateLayout = ({ children }: IPrivateLayoutProps) => {
   return (
        <div className={styles.shell}>
            <Header />
            <main className={styles.mainContent}>{children}</main>
            <Footer />
        </div>
    );
}