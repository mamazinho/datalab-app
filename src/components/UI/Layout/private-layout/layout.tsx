import { Footer } from "./footer";
import { Header } from "./header";
import { MainContent, Shell } from "./layout.style";

interface IPrivateLayoutProps {
    children: React.ReactNode;
}

export const PrivateLayout = ({ children }: IPrivateLayoutProps) => {
   return (
        <Shell>
            <Header />
            <MainContent>{children}</MainContent>
            <Footer />
        </Shell>
    );
}