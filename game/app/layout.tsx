import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Ramen Time — Your bowl. Your rules.',description:'A pixelated Worcester ramen shop. Roll for one of six unique bowls, build your ramen, and discover the chef’s surprises.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
