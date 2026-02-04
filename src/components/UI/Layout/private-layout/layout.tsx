import { Footer } from "./footer";
import { Header } from "./header";

interface IPrivateLayoutProps {
    children: React.ReactNode;
}

export const PrivateLayout = ({ children }: IPrivateLayoutProps) => {
   return (
        <>
            <Header />
                {children}
            <Footer />
        </>
    );
}